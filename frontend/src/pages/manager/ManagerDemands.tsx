import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Search,
  Filter,
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  MessageCircle,
  Paperclip,
  User,
  FolderOpen
} from 'lucide-react';
import { managerAPI } from '../../api/manager';
import { showToast } from '../../components/Toast';

const ManagerDemands: React.FC = () => {
  const [demands, setDemands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'Submitted' | 'Under Review' | 'Accepted' | 'Rejected'>('all');

  // Modal state
  const [selectedDemand, setSelectedDemand] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'Under Review' | 'Accepted' | 'Rejected' | null>(null);
  const [managerComment, setManagerComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDemands = async () => {
    try {
      setLoading(true);
      const res = await managerAPI.getClientDemands();
      setDemands(res.data.data || []);
    } catch (err) {
      showToast('Failed to load demands', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  const handleAction = async () => {
    if (!selectedDemand || !actionType) return;

    if ((actionType === 'Rejected' || actionType === 'Under Review' || actionType === 'Accepted') && !managerComment.trim() && actionType !== 'Accepted') {
      // if we want to enforce comments for certain actions
    }

    try {
      setSubmitting(true);
      await managerAPI.updateDemandStatus(selectedDemand._id, {
        status: actionType,
        managerComment: managerComment || ''
      });
      showToast(`Demand marked as ${actionType}`, 'success');
      setSelectedDemand(null);
      setActionType(null);
      setManagerComment('');
      fetchDemands();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update demand', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDemands = demands.filter(d => filter === 'all' || d.status === filter);

  const statusColors: Record<string, string> = {
    'Submitted': 'bg-amber-100 text-amber-700 border-amber-200',
    'Under Review': 'bg-blue-100 text-blue-700 border-blue-200',
    'Accepted': 'bg-green-100 text-green-700 border-green-200',
    'Rejected': 'bg-red-100 text-red-700 border-red-200',
  };

  const priorityColors: Record<string, string> = {
    Low: 'text-blue-500 bg-blue-500/10 border border-blue-500/20',
    Medium: 'text-amber-500 bg-amber-500/10 border border-amber-500/20',
    High: 'text-red-500 bg-red-500/10 border border-red-500/20',
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Client Demands</h1>
          <p className="text-muted-foreground mt-1">Review and manage client requests, bugs, and requirements.</p>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="flex gap-1 p-1 bg-muted/40 rounded-xl border border-border">
          {['all', 'Submitted', 'Under Review', 'Accepted', 'Rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${filter === f ? 'bg-foreground text-background shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="ml-auto text-sm text-muted-foreground font-medium flex items-center gap-2">
          <Filter className="w-4 h-4" /> Showing {filteredDemands.length} demands
        </div>
      </div>

      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          </div>
        ) : filteredDemands.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredDemands.map((demand) => (
              <motion.div
                key={demand._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all group"
              >
                <div className="p-6 flex flex-col items-start gap-4">
                  <div className="flex w-full items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusColors[demand.status]}`}>
                        {demand.status}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-1 rounded-md">
                        {demand.category}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${priorityColors[demand.priority]}`}>
                        {demand.priority} Priority
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                      <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-md">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                        {demand.client?.fullName || 'Unknown Client'}
                      </div>
                      <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-md">
                        <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                        {demand.project?.name || 'Unknown Project'}
                      </div>
                    </div>
                  </div>

                  <div className="w-full">
                    <h3 className="text-xl font-bold group-hover:text-amber-500 transition-colors uppercase tracking-tight mb-2">
                      {demand.title}
                    </h3>

                    <p className="text-sm text-foreground/80 leading-relaxed max-w-4xl bg-muted/20 p-4 rounded-xl border border-border/50">
                      {demand.description}
                    </p>
                  </div>

                  {demand.managerComment && (
                    <div className="w-full bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                      <MessageCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Your Feedback</p>
                        <p className="text-sm text-foreground/80 font-medium">{demand.managerComment}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col w-full pt-4 border-t border-border mt-2 gap-4">
                     {demand.attachments?.length > 0 && (
                        <div className="w-full flex flex-wrap gap-2">
                           {demand.attachments.map((att: any, i: number) => {
                              const url = (att.url?.startsWith('http') || att.url?.startsWith('blob:')) 
                                  ? att.url 
                                  : `${import.meta.env.VITE_API_URL?.replace('/api', '') || (import.meta.env.DEV ? 'http://localhost:5000' : '')}${att.url?.startsWith('/') ? '' : '/'}${att.url}`;
                              return (
                                 <a 
                                    key={i} 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-lg text-xs font-semibold border border-border transition-colors group/att"
                                 >
                                    <Paperclip className="w-3.5 h-3.5 text-muted-foreground group-hover/att:text-foreground transition-colors" />
                                    <span className="truncate max-w-[150px]">{att.fileName}</span>
                                 </a>
                              );
                           })}
                        </div>
                     )}

                     <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                           <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(demand.createdAt).toLocaleDateString()}</span>
                        </div>

                    {demand.status === 'Submitted' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedDemand(demand); setActionType('Under Review'); setManagerComment(demand.managerComment); }}
                          className="px-4 py-2 rounded-lg bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition-colors"
                        >
                          Mark as Under Review
                        </button>
                      </div>
                    )}
                    {demand.status === 'Under Review' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedDemand(demand); setActionType('Accepted'); setManagerComment(demand.managerComment); }}
                          className="px-4 py-2 rounded-lg bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => { setSelectedDemand(demand); setActionType('Rejected'); setManagerComment(demand.managerComment); }}
                          className="px-4 py-2 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-card border border-dashed border-border rounded-2xl flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <CheckSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-1">No demands found</h3>
            <p className="text-sm text-muted-foreground font-medium">You're all caught up with client requests.</p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {selectedDemand && actionType && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDemand(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                <h2 className="text-xl font-bold font-heading">
                  {actionType === 'Under Review' ? 'Review Demand' : actionType === 'Accepted' ? 'Accept Demand' : 'Reject Demand'}
                </h2>
                <button onClick={() => setSelectedDemand(null)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Client Request</p>
                  <p className="text-sm font-semibold">{selectedDemand.title}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Feedback to Client {actionType !== 'Accepted' ? '<span className="text-red-500">*</span>' : '(Optional)'}
                  </label>
                  <textarea
                    rows={4}
                    value={managerComment}
                    onChange={(e) => setManagerComment(e.target.value)}
                    placeholder="Provide an explanation for the client..."
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-foreground transition-all outline-none resize-none text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSelectedDemand(null)}
                    className="flex-1 py-3.5 rounded-xl border border-border font-bold text-sm hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAction}
                    disabled={submitting}
                    className="flex-1 py-3.5 rounded-xl bg-foreground text-background font-bold text-sm hover:opacity-95 transition-opacity disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : `Confirm ${actionType}`}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManagerDemands;
