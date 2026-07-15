import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Plus,
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  MessageCircle,
  Paperclip,
  Upload,
  Loader2,
  ChevronRight,
  Filter
} from 'lucide-react';
import { clientAPI } from '../../api/client';
import { filesAPI } from '../../api/files';
import { showToast } from '../../components/Toast';
import { useRef } from 'react';

const ClientDemands: React.FC = () => {
  const [demands, setDemands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'Submitted' | 'Under Review' | 'Accepted' | 'Rejected'>('all');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Feature Request',
    priority: 'Medium',
    description: '',
    attachments: [] as { fileName: string; url: string }[]
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await clientAPI.getDemands();
      setDemands(res.data.data || []);
    } catch (err) {
      showToast('Failed to load demands', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      return showToast('Please fill in required fields', 'warning');
    }

    try {
      setSubmitting(true);
      await clientAPI.submitDemand(formData);
      showToast('Demand submitted successfully', 'success');
      setFormData({ title: '', category: 'Change Request', priority: 'Medium', description: '', attachments: [] });
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to submit demand', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAttachment(true);
      const form = new FormData();
      form.append('file', file);
      const res = await filesAPI.uploadFile(form);
      const newAttachment = {
        fileName: res.data.data.fileName,
        url: res.data.data.url
      };
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, newAttachment]
      }));
    } catch (err) {
      showToast('Failed to upload file. Ensure it is under 10MB.', 'error');
    } finally {
      setUploadingAttachment(false);
      if (e.target) e.target.value = '';
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
    Low: 'text-blue-500',
    Medium: 'text-amber-500',
    High: 'text-red-500',
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Demands & Requests</h1>
          <p className="text-muted-foreground mt-1">Submit bug reports, change requests, or new feature ideas.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-bold text-sm transition-all hover:opacity-90 active:scale-95 shadow-md"
        >
          <Plus className="w-4 h-4" /> New Demand
        </button>
      </div>

      {/* Stats & Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-1 p-1 bg-muted/40 rounded-xl border border-border">
          {['all', 'Submitted', 'Under Review', 'Accepted', 'Rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${filter === f ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {f}
            </button>
          ))}
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
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:border-foreground/20 transition-all shadow-sm group"
              >
                <div className="p-6 flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[demand.status]}`}>
                          {demand.status}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-1 rounded">
                          {demand.category}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs font-bold ${priorityColors[demand.priority]}`}>
                        <AlertCircle className="w-3.5 h-3.5" /> {demand.priority} Priority
                      </div>
                    </div>

                    <h3 className="text-lg font-bold group-hover:text-blue-500 transition-colors uppercase tracking-tight">
                      {demand.title}
                    </h3>

                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {demand.description}
                    </p>

                    <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-2">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Submitted {new Date(demand.createdAt).toLocaleDateString()}</span>
                      {demand.attachments?.length > 0 && (
                        <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" /> {demand.attachments.length} Attachments</span>
                      )}
                    </div>
                  </div>

                  {/* Manager Feedback Section */}
                  <div className="md:w-72 bg-muted/20 border-l border-border md:p-6 p-4 -m-6 md:m-0 flex flex-col justify-center">
                    {demand.managerComment ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          <MessageCircle className="w-3.5 h-3.5" /> Manager Feedback
                        </div>
                        <p className="text-sm italic text-foreground/70 leading-relaxed border-l-2 border-blue-500 pl-3">
                          "{demand.managerComment}"
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center opacity-40">
                        <Clock className="w-6 h-6 mb-2" />
                        <p className="text-xs font-bold uppercase tracking-widest">Awaiting Review</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-card border border-dashed border-border rounded-2xl">
            <CheckSquare className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">No demands found. Have a request? Submit one below.</p>
          </div>
        )}
      </div>

      {/* New Demand Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                <h2 className="text-xl font-bold font-heading">Submit New Demand</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Headline <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Summarize your request in a few words"
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-foreground transition-all outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Category <span className="text-red-500">*</span></label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-foreground transition-all outline-none appearance-none"
                    >
                      <option>UI Change</option>
                      <option>Feature Request</option>
                      <option>Bug Report</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Priority <span className="text-red-500">*</span></label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-foreground transition-all outline-none appearance-none"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Detailed Description <span className="text-red-500">*</span></label>
                    <textarea
                      rows={5}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Explain the reason for this demand, desired outcome, or steps to reproduce if it's a bug."
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-foreground transition-all outline-none resize-none"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Attachments</label>
                    <div
                      onClick={() => !uploadingAttachment && fileInputRef.current?.click()}
                      className={`border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center hover:bg-muted/30 transition-all cursor-pointer group ${uploadingAttachment ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {uploadingAttachment ? (
                        <Loader2 className="w-8 h-8 text-muted-foreground mb-2 animate-spin" />
                      ) : (
                        <Upload className="w-8 h-8 text-muted-foreground mb-2 group-hover:text-foreground transition-colors" />
                      )}
                      <p className="text-sm font-bold">{uploadingAttachment ? 'Uploading...' : 'Click to upload or drag & drop'}</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF up to 10MB</p>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {formData.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {formData.attachments.map((att, i) => (
                          <div key={i} className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg border border-border/50 text-sm">
                            <Paperclip className="w-4 h-4 text-muted-foreground" />
                            <span className="truncate flex-1">{att.fileName}</span>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, idx) => idx !== i) }))}
                              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3.5 rounded-xl border border-border font-bold text-sm hover:bg-muted transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3.5 rounded-xl bg-foreground text-background font-bold text-sm hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Demand'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientDemands;
