import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'zomer-motion'; // Wait, it should be framer-motion
import { motion as mot } from 'framer-motion';
import { 
  Building2, Search, Filter, MoreHorizontal, 
  Eye, ShieldAlert, ShieldCheck, Trash2, 
  Loader2, X, Activity, Mail, Calendar,
  Users, CheckCircle2, AlertCircle
} from 'lucide-react';
import { superAdminService } from '../../api/superAdmin';
import { showToast } from '../../components/Toast';
import { Drawer } from 'vaul';

const SuperAdminCompanies = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [companyDetails, setCompanyDetails] = useState<any>(null);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await superAdminService.getCompanies();
      setCompanies(res.data.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      showToast('Failed to load companies', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleFetchDetails = async (company: any) => {
    setSelectedCompany(company);
    setDetailsLoading(true);
    try {
      const res = await superAdminService.getCompanyDetail(company._id);
      setCompanyDetails(res.data.data);
    } catch (error) {
      showToast('Failed to load company details', 'error');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, action: 'suspend' | 'activate') => {
    try {
      if (action === 'suspend') {
        await superAdminService.suspendCompany(id);
        showToast('Company suspended', 'success');
      } else {
        await superAdminService.activateCompany(id);
        showToast('Company activated', 'success');
      }
      fetchCompanies();
      if (selectedCompany?._id === id) {
        handleFetchDetails(selectedCompany);
      }
    } catch (error) {
      showToast(`Failed to ${action} company`, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this company? This action is irreversible and will delete all associated data.')) return;
    try {
      await superAdminService.deleteCompany(id);
      showToast('Company deleted successfully', 'success');
      fetchCompanies();
      setSelectedCompany(null);
    } catch (error) {
      showToast('Failed to delete company', 'error');
    }
  };

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.ownerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && c.isActive) || 
                          (statusFilter === 'suspended' && !c.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Companies</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all registered organizations on the platform.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-foreground"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Owner</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Users</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No companies found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr key={company._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                          {company.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{company.name}</p>
                          <p className="text-xs text-muted-foreground">{company.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{company.ownerEmail}</td>
                    <td className="px-6 py-4 text-sm font-medium">{company.plan}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${company.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${company.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                        {company.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{company.userCount}</td>
                    <td className="px-6 py-4 text-right">
                      <Drawer.Root>
                        <Drawer.Trigger asChild>
                          <button 
                            onClick={() => handleFetchDetails(company)}
                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </Drawer.Trigger>
                        <Drawer.Portal>
                          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
                          <Drawer.Content className="bg-card flex flex-col rounded-t-[10px] h-[90%] mt-24 fixed bottom-0 left-0 right-0 z-50 outline-none border-t border-border">
                            <div className="p-4 bg-card rounded-t-[10px] flex-1 overflow-y-auto">
                              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-8" />
                              <div className="max-w-4xl mx-auto">
                                {detailsLoading ? (
                                  <div className="flex flex-col items-center justify-center py-24">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                                    <p className="text-muted-foreground animate-pulse">Loading company intelligence...</p>
                                  </div>
                                ) : companyDetails && (
                                  <div className="space-y-8 pb-12">
                                    {/* Header Info */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
                                      <div className="flex items-center gap-5">
                                        <div className="w-20 h-20 rounded-3xl bg-indigo-500 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-indigo-500/20">
                                          {companyDetails.company.name.charAt(0)}
                                        </div>
                                        <div>
                                          <h2 className="text-3xl font-bold font-heading">{companyDetails.company.name}</h2>
                                          <div className="flex flex-wrap gap-3 mt-2">
                                            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                              <Calendar className="w-4 h-4" /> Joined: {new Date(companyDetails.company.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                              <Activity className="w-4 h-4" /> {companyDetails.company.industry || 'General'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        {companyDetails.company.isActive ? (
                                          <button 
                                            onClick={() => handleStatusUpdate(companyDetails.company._id, 'suspend')}
                                            className="px-6 py-2.5 rounded-full bg-red-100 text-red-600 font-medium hover:bg-red-200 transition-colors flex items-center gap-2"
                                          >
                                            <ShieldAlert className="w-4 h-4" /> Suspend
                                          </button>
                                        ) : (
                                          <button 
                                            onClick={() => handleStatusUpdate(companyDetails.company._id, 'activate')}
                                            className="px-6 py-2.5 rounded-full bg-green-100 text-green-600 font-medium hover:bg-green-200 transition-colors flex items-center gap-2"
                                          >
                                            <ShieldCheck className="w-4 h-4" /> Activate
                                          </button>
                                        )}
                                        <button 
                                          onClick={() => handleDelete(companyDetails.company._id)}
                                          className="p-2.5 rounded-full border border-border text-muted-foreground hover:text-red-500 hover:border-red-500 transition-all"
                                        >
                                          <Trash2 className="w-5 h-5" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Grid Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      <div className="bg-muted/30 border border-border rounded-2xl p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                          <Users className="w-5 h-5 text-blue-500" />
                                          <h4 className="font-semibold">Team Distribution</h4>
                                        </div>
                                        <div className="space-y-4">
                                          <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Managers</span>
                                            <span className="font-bold">{companyDetails.counts.managers}</span>
                                          </div>
                                          <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Employees</span>
                                            <span className="font-bold">{companyDetails.counts.employees}</span>
                                          </div>
                                          <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Clients</span>
                                            <span className="font-bold">{companyDetails.counts.clients}</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="bg-muted/30 border border-border rounded-2xl p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                          <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                                          <h4 className="font-semibold">Current Plan</h4>
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-2xl font-bold">{companyDetails.subscription?.plan?.name || 'No Active Plan'}</p>
                                          <p className="text-sm text-muted-foreground">
                                            Status: <span className="font-medium text-foreground capitalize">{companyDetails.subscription?.status || 'N/A'}</span>
                                          </p>
                                          <p className="text-xs text-muted-foreground mt-2 border-t border-border pt-2">
                                            {companyDetails.subscription?.status === 'trial' ? `Trial Ends: ${new Date(companyDetails.subscription.trialEndDate).toLocaleDateString()}` : 'Billed Monthly'}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="bg-muted/30 border border-border rounded-2xl p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                          <Mail className="w-5 h-5 text-purple-500" />
                                          <h4 className="font-semibold">Owner Contact</h4>
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-sm font-semibold truncate">{companyDetails.owner?.fullName}</p>
                                          <p className="text-xs text-muted-foreground truncate">{companyDetails.owner?.email}</p>
                                          <button className="mt-4 text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                                            Send Admin Message <Activity className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Logs */}
                                    <div className="space-y-4">
                                      <h4 className="text-lg font-bold font-heading flex items-center gap-2">
                                        <Activity className="w-5 h-5" /> Recent Company Logs
                                      </h4>
                                      <div className="bg-background border border-border rounded-2xl overflow-hidden divide-y divide-border">
                                        {companyDetails.recentLogs.length > 0 ? (
                                          companyDetails.recentLogs.map((log: any, idx: number) => (
                                            <div key={idx} className="p-4 flex flex-col md:flex-row justify-between gap-2 hover:bg-muted/20 transition-colors">
                                              <div>
                                                <p className="text-sm font-medium">{log.action}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                  Performed by <span className="text-foreground">{log.user?.fullName}</span> ({log.user?.role})
                                                </p>
                                              </div>
                                              <span className="text-[10px] bg-muted px-2 py-1 rounded-full self-start md:self-center font-mono">
                                                {new Date(log.createdAt).toLocaleString()}
                                              </span>
                                            </div>
                                          ))
                                        ) : (
                                          <div className="p-8 text-center text-muted-foreground text-sm italic">
                                            No activity logs yet for this company.
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Drawer.Content>
                        </Drawer.Portal>
                      </Drawer.Root>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminCompanies;
