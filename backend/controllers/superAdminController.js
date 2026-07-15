const Company = require('../models/Company');
const User = require('../models/User');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const PlatformActivityLog = require('../models/PlatformActivityLog');
const ActivityLog = require('../models/ActivityLog');

// ━━━ OVERVIEW ━━━
exports.getOverview = async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const activeCompanies = await Company.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments();
    
    // Subscriptions
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    
    // New companies this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newCompaniesThisMonth = await Company.countDocuments({ createdAt: { $gte: startOfMonth } });

    // Expiring trials (in 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const expiringTrials = await Subscription.countDocuments({
      status: 'trial',
      trialEndDate: { $lte: sevenDaysFromNow, $gte: new Date() }
    });

    // Recent Activity
    const recentActivity = await PlatformActivityLog.find()
      .populate('targetCompany', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalCompanies,
          activeCompanies,
          totalUsers,
          activeSubscriptions,
          newCompaniesThisMonth,
          expiringTrials
        },
        recentActivity
      }
    });
  } catch (error) {
    console.error('Superadmin overview error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ━━━ COMPANIES ━━━
exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    
    // Enrich with owner and subscription info
    const enrichedCompanies = await Promise.all(companies.map(async (company) => {
      const owner = await User.findOne({ company: company._id, role: 'company_admin' }).select('email');
      const subscription = await Subscription.findOne({ company: company._id }).populate('plan');
      const userCount = await User.countDocuments({ company: company._id });
      
      return {
        ...company.toObject(),
        ownerEmail: owner ? owner.email : 'N/A',
        plan: subscription ? subscription.plan?.name : 'No Plan',
        status: subscription ? subscription.status : (company.isActive ? 'active' : 'inactive'),
        expiryDate: subscription ? (subscription.status === 'trial' ? subscription.trialEndDate : subscription.nextBillingDate) : null,
        userCount
      };
    }));

    return res.status(200).json({
      success: true,
      data: enrichedCompanies
    });
  } catch (error) {
    console.error('Superadmin companies error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getCompanyDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    const owner = await User.findOne({ company: id, role: 'company_admin' });
    const subscription = await Subscription.findOne({ company: id }).populate('plan');
    const managersCount = await User.countDocuments({ company: id, role: 'manager' });
    const employeesCount = await User.countDocuments({ company: id, role: 'employee' });
    const clientsCount = await User.countDocuments({ company: id, role: 'client' });
    
    // Internal logs for this company
    const recentLogs = await ActivityLog.find({ company: id })
      .populate('user', 'fullName role')
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      data: {
        company,
        owner,
        subscription,
        counts: {
          managers: managersCount,
          employees: employeesCount,
          clients: clientsCount
        },
        recentLogs
      }
    });
  } catch (error) {
    console.error('Superadmin company detail error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.suspendCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    // Update subscription status if exists
    await Subscription.findOneAndUpdate({ company: id }, { status: 'suspended' });

    await PlatformActivityLog.create({
      action: 'Company Suspended',
      targetCompany: id,
      performedBy: req.user._id,
      details: { companyName: company.name }
    });

    return res.status(200).json({ success: true, message: 'Company suspended successfully' });
  } catch (error) {
    console.error('Suspend company error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.activateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findByIdAndUpdate(id, { isActive: true }, { new: true });
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    // Update subscription status if exists
    await Subscription.findOneAndUpdate({ company: id }, { status: 'active' });

    await PlatformActivityLog.create({
      action: 'Company Activated',
      targetCompany: id,
      performedBy: req.user._id,
      details: { companyName: company.name }
    });

    return res.status(200).json({ success: true, message: 'Company activated successfully' });
  } catch (error) {
    console.error('Activate company error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    // In a real app, you'd cascade delete all company data (users, projects, tasks, etc.)
    // For now, let's delete the company, its subscription, and its users
    await Company.findByIdAndDelete(id);
    await Subscription.findOneAndDelete({ company: id });
    await User.deleteMany({ company: id });

    await PlatformActivityLog.create({
      action: 'Company Deleted',
      targetCompany: null,
      performedBy: req.user._id,
      details: { companyId: id, companyName: company.name }
    });

    return res.status(200).json({ success: true, message: 'Company and all associated data deleted' });
  } catch (error) {
    console.error('Delete company error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ━━━ SUBSCRIPTIONS ━━━
exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('company', 'name')
      .populate('plan')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { planId, status, trialEndDate } = req.body;

    const subscription = await Subscription.findByIdAndUpdate(
      id,
      { plan: planId, status, trialEndDate },
      { new: true }
    );

    if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found' });

    await PlatformActivityLog.create({
      action: 'Subscription Updated',
      targetCompany: subscription.company,
      performedBy: req.user._id,
      details: { planId, status }
    });

    return res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    console.error('Update subscription error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ━━━ PLANS ━━━
exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    return res.status(200).json({ success: true, data: plans });
  } catch (error) {
    console.error('Get plans error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const plan = await Plan.create(req.body);
    return res.status(201).json({ success: true, data: plan });
  } catch (error) {
    console.error('Create plan error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findByIdAndUpdate(id, req.body, { new: true });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    return res.status(200).json({ success: true, data: plan });
  } catch (error) {
    console.error('Update plan error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ━━━ ANALYTICS ━━━
exports.getAnalytics = async (req, res) => {
  try {
    // Group companies by month
    const companiesByMonth = await Company.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Plan distribution
    const planDistribution = await Subscription.aggregate([
      {
        $lookup: {
          from: 'plans',
          localField: 'plan',
          foreignField: '_id',
          as: 'planInfo'
        }
      },
      { $unwind: '$planInfo' },
      {
        $group: {
          _id: '$planInfo.name',
          count: { $sum: 1 }
        }
      }
    ]);

    // User growth (simplified)
    const usersByMonth = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const averageCompanySize = await User.countDocuments() / (await Company.countDocuments() || 1);

    return res.status(200).json({
      success: true,
      data: {
        companiesByMonth,
        planDistribution,
        usersByMonth,
        stats: {
          averageCompanySize: averageCompanySize.toFixed(1),
          mostPopularPlan: planDistribution.length > 0 ? planDistribution.sort((a,b) => b.count - a.count)[0]._id : 'N/A'
        }
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
