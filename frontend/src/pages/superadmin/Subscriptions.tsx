import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, Save, X, Check, Loader2, 
  Settings, CreditCard, Building2, Calendar,
  ChevronRight, AlertCircle, Info
} from 'lucide-react';
import { superAdminService } from '../../api/superAdmin';
import { showToast } from '../../components/Toast';

const SuperAdminSubscriptions = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [plans, setPlans] = useState<any[]>([]);
  const [companySubscriptions, setCompanySubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Plan Editor State
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<any>({});
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, subsRes] = await Promise.all([
        superAdminService.getPlans(),
        superAdminService.getSubscriptions()
      ]);
      setPlans(plansRes.data.data);
      setCompanySubscriptions(subsRes.data.data);
    } catch (error) {
      showToast('Failed to load subscription data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan._id);
    setPlanForm({ ...plan, features: plan.features.join(', ') });
  };

  const handleSavePlan = async () => {
    setActionLoading(true);
    try {
      const data = { 
        ...planForm, 
        features: planForm.features.split(',').map((f: string) => f.trim()).filter(Boolean) 
      };
      
      if (isAddingPlan) {
        await superAdminService.createPlan(data);
        showToast('Plan created!', 'success');
      } else {
        await superAdminService.updatePlan(editingPlan!, data);
        showToast('Plan updated!', 'success');
      }
      
      setEditingPlan(null);
      setIsAddingPlan(false);
      fetchData();
    } catch (error) {
      showToast('Failed to save plan', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSub = async (subId: string, data: any) => {
    try {
      await superAdminService.updateSubscription(subId, data);
      showToast('Subscription updated', 'success');
      fetchData();
    } catch (error) {
      showToast('Update failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Subscriptions & Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure service tiers and manage client billing accounts.</p>
        </div>
        {activeTab === 'plans' && !isAddingPlan && (
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { setIsAddingPlan(true); setEditingPlan('new'); setPlanForm({ name: '', price: 0, maxUsers: 10, maxProjects: 5, features: '' }); }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-foreground text-background text-sm font-medium shadow-lg shadow-foreground/10"
          >
            <Plus className="w-4 h-4" /> Add New Tier
          </motion.button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-px">
        <button 
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 text-sm font-medium transition-all relative ${activeTab === 'plans' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Plan Tiers
          {activeTab === 'plans' && <motion.div layoutId="subtab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />}
        </button>
        <button 
          onClick={() => setActiveTab('companies')}
          className={`px-4 py-2 text-sm font-medium transition-all relative ${activeTab === 'companies' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Company Subscriptions
          {activeTab === 'companies' && <motion.div layoutId="subtab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'plans' ? (
            <motion.div 
              key="plans" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {plans.map((plan) => (
                <div key={plan._id} className={`bg-card border-2 rounded-2xl p-6 transition-all ${editingPlan === plan._id ? 'border-foreground' : 'border-border hover:border-foreground/20 shadow-sm'}`}>
                  {editingPlan === plan._id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Plan Name</label>
                        <input value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mt-1" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Price ($)</label>
                          <input type="number" value={planForm.price} onChange={e => setPlanForm({...planForm, price: Number(e.target.value)})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mt-1" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">User Limit</label>
                          <input type="number" value={planForm.maxUsers} onChange={e => setPlanForm({...planForm, maxUsers: Number(e.target.value)})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mt-1" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Features (comma separated)</label>
                        <textarea rows={3} value={planForm.features} onChange={e => setPlanForm({...planForm, features: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mt-1" />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button onClick={handleSavePlan} disabled={actionLoading} className="flex-1 bg-foreground text-background py-2 rounded-lg text-sm font-bold flex justify-center items-center">
                          {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1"/> Save</>}
                        </button>
                        <button onClick={() => { setEditingPlan(null); setIsAddingPlan(false); }} className="px-4 py-2 border border-border rounded-lg text-sm font-medium">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${plan.name === 'Pro' ? 'bg-indigo-100 text-indigo-600' : 'bg-muted text-muted-foreground'}`}>
                          {plan.name === 'Pro' ? 'Most Popular' : 'Tier'}
                        </div>
                        <button onClick={() => handleEditPlan(plan)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><Edit2 className="w-4 h-4" /></button>
                      </div>
                      <h3 className="text-xl font-bold font-heading">{plan.name}</h3>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-sm text-muted-foreground">/mo</span>
                      </div>
                      <div className="mt-6 space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500" />
                          <span>Up to <strong>{plan.maxUsers}</strong> users</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500" />
                          <span>Up to <strong>{plan.maxProjects}</strong> projects</span>
                        </div>
                        {plan.features.map((f: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-green-500/50" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
              {isAddingPlan && editingPlan === 'new' && (
                <div className="bg-card border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                  <div className="space-y-4 w-full">
                    <h3 className="text-lg font-bold font-heading">New Service Tier</h3>
                    <div className="space-y-3 text-left">
                       <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Plan Name</label>
                        <input value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mt-1" placeholder="e.g. Enterprise" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Price ($)</label>
                          <input type="number" value={planForm.price} onChange={e => setPlanForm({...planForm, price: Number(e.target.value)})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mt-1" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">User Limit</label>
                          <input type="number" value={planForm.maxUsers} onChange={e => setPlanForm({...planForm, maxUsers: Number(e.target.value)})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mt-1" />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <button onClick={handleSavePlan} disabled={actionLoading} className="flex-1 bg-foreground text-background py-2.5 rounded-xl text-sm font-bold flex justify-center items-center">
                          {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Tier'}
                        </button>
                        <button onClick={() => { setEditingPlan(null); setIsAddingPlan(false); }} className="px-4 py-2.5 bg-muted rounded-xl text-sm font-medium">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="subscriptions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</th>
                      <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Plan</th>
                      <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expiry / Renewal</th>
                      <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {companySubscriptions.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No active subscriptions found.</td></tr>
                    ) : (
                      companySubscriptions.map((sub) => (
                        <tr key={sub._id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{sub.company?.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold">{sub.plan?.name}</span>
                              <span className="text-xs text-muted-foreground">${sub.plan?.price}/mo</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              sub.status === 'trial' ? 'bg-orange-100 text-orange-600' :
                              sub.status === 'active' ? 'bg-green-100 text-green-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {sub.status === 'trial' ? new Date(sub.trialEndDate).toLocaleDateString() : (sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : 'N/A')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {sub.status === 'trial' && (
                                <button 
                                  onClick={() => handleUpdateSub(sub._id, { trialEndDate: new Date(new Date(sub.trialEndDate).getTime() + 7 * 24 * 60 * 60 * 1000) })}
                                  className="text-[10px] font-bold bg-muted px-2 py-1 rounded hover:bg-border transition-colors uppercase tracking-tight"
                                >
                                  +7 Days Trial
                                </button>
                              )}
                              <select 
                                onChange={(e) => handleUpdateSub(sub._id, { planId: e.target.value })}
                                className="text-[10px] font-bold bg-muted px-2 py-1 rounded outline-none cursor-pointer"
                                defaultValue=""
                              >
                                <option value="" disabled>Change Plan</option>
                                {plans.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 flex gap-4">
        <Info className="w-5 h-5 text-blue-500 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">Payment Processing is currently in Manual Mode</p>
          <p className="text-xs text-blue-700 dark:text-blue-300/80 leading-relaxed">
            Stripe integration is temporarily disabled. You can manually adjust tiers, extend trials, and override subscription statuses for users. 
            All changes will be effective immediately for the target company.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSubscriptions;
