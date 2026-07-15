const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Meeting = require('../models/Meeting');
const MeetingRequest = require('../models/MeetingRequest');
const DailyReport = require('../models/DailyReport');
const Demand = require('../models/Demand');
const Notification = require('../models/Notification');
const toObjectId = require('../utils/toObjectId');
const PDFDocument = require('pdfkit');

// ── OVERVIEW ──────────────────────────────────────────────────────────────────
exports.getOverview = async (req, res) => {
  try {
    const clientId = toObjectId(req.user._id);
    const companyId = toObjectId(req.user.company);

    // Fetch the client to check assignedProject field
    const User = require('../models/User');
    const client = await User.findById(clientId).select('assignedProject');

    if (!client || !client.assignedProject) {
      return res.json({ success: true, data: { assigned: false, hasProject: false } });
    }

    // Get assigned project details
    const project = await Project.findOne({ _id: client.assignedProject, company: companyId });
    if (!project) {
      return res.json({ success: true, data: { assigned: false, hasProject: false } });
    }

    const projectId = project._id;

    // Next scheduled meeting
    const nextMeeting = await Meeting.findOne({
      companyId,
      participants: clientId,
      startTime: { $gte: new Date() },
      status: 'scheduled',
    }).sort({ startTime: 1 });

    // Latest activity feed (Tasks updated, reports shared, meetings scheduled)
    const [recentTasks, sharedReports, recentMeetings] = await Promise.all([
      Task.find({ project: projectId }).sort({ updatedAt: -1 }).limit(5),
      DailyReport.find({ company: companyId, sharedWithClient: true }).populate('task', 'title').sort({ createdAt: -1 }).limit(5),
      Meeting.find({ companyId, participants: clientId, startTime: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }).sort({ createdAt: -1 }).limit(5),
    ]);

    const activity = [
      ...recentTasks.map(t => ({
        type: 'task',
        description: `Task "${t.title}" updated to ${t.status}`,
        timestamp: t.updatedAt,
        icon: 'task'
      })),
      ...sharedReports.map(r => ({
        type: 'report',
        description: `New report shared for task: ${r.task?.title || 'Unknown'}`,
        timestamp: r.createdAt,
        icon: 'file-text'
      })),
      ...recentMeetings.map(m => ({
        type: 'meeting',
        description: `Meeting "${m.title}" ${m.startTime < new Date() ? 'was held' : 'scheduled'}`,
        timestamp: m.startTime,
        icon: m.startTime < new Date() ? 'check-circle' : 'calendar'
      }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

    return res.json({
      success: true,
      data: {
        assigned: true,
        hasProject: true,
        projectName: project.name,
        projectStatus: project.status,
        progress: project.progress,
        deadline: project.deadline,
        nextMeeting: nextMeeting ? {
          title: nextMeeting.title,
          startTime: nextMeeting.startTime,
          manager: nextMeeting.createdBy // Frontend will populate manager name
        } : null,
        activityFeed: activity
      }
    });
  } catch (error) {
    console.error('Client overview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── PROJECT DETAILS ───────────────────────────────────────────────────────────
exports.getProject = async (req, res) => {
  try {
    const clientId = toObjectId(req.user._id);
    const companyId = toObjectId(req.user.company);

    const project = await Project.findOne({ client: clientId, company: companyId })
      .populate('manager', 'fullName email avatar');
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'No project assigned' });
    }

    const tasks = await Task.find({ project: project._id });
    
    // Group tasks by phase
    const phasesMap = {};
    tasks.forEach(t => {
      const phaseName = t.phase || 'General';
      if (!phasesMap[phaseName]) {
        phasesMap[phaseName] = {
          name: phaseName,
          tasks: [],
          completed: 0
        };
      }
      phasesMap[phaseName].tasks.push({
        _id: t._id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate
      });
      if (t.status === 'completed' || t.status === 'done') {
        phasesMap[phaseName].completed++;
      }
    });

    const phases = Object.values(phasesMap).map(p => ({
      ...p,
      progress: Math.round((p.completed / p.tasks.length) * 100) || 0,
      taskCount: p.tasks.length
    }));

    return res.json({
      success: true,
      data: {
        project,
        phases
      }
    });
  } catch (error) {
    console.error('Client project fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── MEETINGS ──────────────────────────────────────────────────────────────────
exports.getMeetings = async (req, res) => {
  try {
    const clientId = toObjectId(req.user._id);
    const companyId = toObjectId(req.user.company);

    const now = new Date();
    
    // Total meetings participant list
    const meetings = await Meeting.find({
      companyId,
      participants: clientId
    }).populate('createdBy', 'fullName').sort({ startTime: -1 });

    const requests = await MeetingRequest.find({
      companyId,
      requestedBy: clientId
    }).sort({ createdAt: -1 });

    // Filter past meetings to only show results that were shared with client
    // unless they were the host (unlikely for client)
    const filteredMeetings = meetings.filter(m => {
      const isPast = new Date(new Date(m.startTime).getTime() + (m.durationMinutes || 30) * 60000) < now;
      if (isPast) {
        return m.sharedWithClient === true;
      }
      return true; // Show all upcoming/active meetings they are invited to
    });

    return res.json({
      success: true,
      data: {
        meetings: filteredMeetings,
        requests
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.requestMeeting = async (req, res) => {
  try {
    const clientId = toObjectId(req.user._id);
    const companyId = toObjectId(req.user.company);
    const { subject, preferredDate, message } = req.body;

    const project = await Project.findOne({ client: clientId, company: companyId });
    if (!project || !project.manager) {
      return res.status(400).json({ success: false, message: 'No manager assigned to your project' });
    }

    const request = await MeetingRequest.create({
      requestedBy: clientId,
      requestedTo: project.manager,
      companyId,
      subject,
      preferredDate: new Date(preferredDate),
      agenda: message,
      requesterRole: 'client',
      status: 'pending'
    });

    // Notify Manager
    await Notification.create({
      company: companyId,
      user: project.manager,
      title: 'New Meeting Request',
      message: `Client ${req.user.fullName} requested a meeting regarding: ${subject}`,
      type: 'meeting_request',
      relatedId: request._id,
      relatedModel: 'MeetingRequest'
    });

    try {
      const { emitToUser } = require('../socket');
      emitToUser(project.manager.toString(), 'notification', { message: 'New meeting request from client' });
    } catch (e) {
      console.error('Socket emit error:', e.message);
    }

    return res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── REPORTS ───────────────────────────────────────────────────────────────────
exports.getReports = async (req, res) => {
  try {
    const clientId = toObjectId(req.user._id);
    const companyId = toObjectId(req.user.company);

    const project = await Project.findOne({ client: clientId, company: companyId });
    if (!project) return res.json({ success: true, data: { reports: [], summaries: [] } });

    const [reports, summaries] = await Promise.all([
      DailyReport.find({
        company: companyId,
        sharedWithClient: true
      })
      .populate('employee', 'fullName avatar')
      .populate('task', 'title')
      .sort({ createdAt: -1 }),
      
      Meeting.find({
        companyId,
        participants: clientId,
        sharedWithClient: true,
        'summary.rawSummary': { $exists: true, $ne: '' }
      }).select('title startTime summary').sort({ startTime: -1 })
    ]);

    return res.json({
      success: true,
      data: {
        reports,
        summaries
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReportDetails = async (req, res) => {
  try {
    const companyId = toObjectId(req.user.company);
    const reportId = toObjectId(req.params.id);

    const report = await DailyReport.findOne({
      _id: reportId,
      company: companyId,
      sharedWithClient: true
    })
    .populate('employee', 'fullName email')
    .populate('task', 'title description status');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found or not shared' });
    }

    return res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.downloadReportPdf = async (req, res) => {
  try {
    const companyId = toObjectId(req.user.company);
    const reportId = toObjectId(req.params.id);

    const report = await DailyReport.findOne({
      _id: reportId,
      company: companyId,
      sharedWithClient: true
    }).populate('employee', 'fullName').populate('task', 'title');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${report._id}.pdf"`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(20).text('Daily Report Details', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Date: ${new Date(report.createdAt).toLocaleDateString()}`);
    doc.text(`Employee: ${report.employee?.fullName || 'N/A'}`);
    doc.text(`Task: ${report.task?.title || 'General'}`);
    doc.text(`Hours Spent: ${report.hoursSpent}`);
    doc.text(`Status: ${report.status}`);
    doc.moveDown();

    doc.fontSize(14).font('Helvetica-Bold').text('Work Done:');
    doc.fontSize(12).font('Helvetica').text(report.workDone || 'N/A');
    doc.moveDown();

    if (report.blockers) {
      doc.fontSize(14).font('Helvetica-Bold').text('Blockers:');
      doc.fontSize(12).font('Helvetica').text(report.blockers);
      doc.moveDown();
    }

    if (report.managerFeedback) {
      doc.fontSize(14).font('Helvetica-Bold').text('Manager Feedback:');
      doc.fontSize(12).font('Helvetica').text(report.managerFeedback);
      doc.moveDown();
    }

    doc.end();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

// ── DEMANDS ───────────────────────────────────────────────────────────────────
exports.getDemands = async (req, res) => {
  try {
    const clientId = toObjectId(req.user._id);
    const companyId = toObjectId(req.user.company);

    const demands = await Demand.find({
      client: clientId,
      company: companyId
    }).sort({ createdAt: -1 });

    return res.json({ success: true, data: demands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitDemand = async (req, res) => {
  try {
    const clientId = toObjectId(req.user._id);
    const companyId = toObjectId(req.user.company);
    const { title, category, description, priority, attachments } = req.body;

    const project = await Project.findOne({ client: clientId, company: companyId });
    if (!project || !project.manager) {
      return res.status(400).json({ success: false, message: 'No manager assigned to your project' });
    }

    const demand = await Demand.create({
      title,
      category,
      description,
      priority,
      client: clientId,
      project: project._id,
      manager: project.manager,
      company: companyId,
      attachments: attachments || []
    });

    // Notify Manager
    await Notification.create({
      company: companyId,
      user: project.manager,
      title: 'New Client Demand',
      message: `Client ${req.user.fullName} submitted a new demand: ${title}`,
      type: 'demand_created',
      relatedId: demand._id,
      relatedModel: 'Demand'
    });

    // Notify Admin if High priority
    if (priority === 'High') {
      const admins = await require('../models/User').find({ company: companyId, role: 'company_admin' });
      for (const admin of admins) {
        await Notification.create({
          company: companyId,
          user: admin._id,
          title: 'High Priority Demand',
          message: `Client ${req.user.fullName} submitted a High priority demand: ${title}`,
          type: 'demand_created',
          relatedId: demand._id,
          relatedModel: 'Demand'
        });
      }
    }

    try {
      const { emitToUser } = require('../socket');
      emitToUser(project.manager.toString(), 'notification', { message: 'New demand from client' });
    } catch (e) {
      console.error('Socket emit error:', e.message);
    }

    return res.status(201).json({ success: true, data: demand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
exports.getNotifications = async (req, res) => {
  try {
    const userId = toObjectId(req.user._id);
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    return res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    
    return res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSharedSummaries = async (req, res) => {
  try {
    const SharedSummary = require('../models/SharedSummary');
    const summaries = await SharedSummary.find({ sharedWith: req.user._id })
      .populate('meetingId', 'title startTime')
      .populate('sharedBy', 'fullName')
      .sort({ createdAt: -1 });
    
    return res.json({ success: true, data: summaries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
