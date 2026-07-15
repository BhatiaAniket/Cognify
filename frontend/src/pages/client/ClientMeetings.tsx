import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Video, 
  MoreHorizontal, 
  Plus, 
  X, 
  Info,
  ChevronRight,
  User,
  CheckCircle2,
  Timer,
  Sparkles,
  Loader2,
  Bell
} from 'lucide-react';
import { clientAPI } from '../../api/client';
import { useSocket } from '../../context/SocketContext';
import { showToast } from '../../components/Toast';

const ClientMeetings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scheduled' | 'requests'>('scheduled');
  const [meetings, setMeetings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    subject: '',
    preferredDate: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState<string | null>(null);
  const [meetingSummaries, setMeetingSummaries] = useState<Record<string, string>>({});
  const [expandedSummaries, setExpandedSummaries] = useState<Record<string, boolean>>({});
  const { socket } = useSocket();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await clientAPI.getMeetings();
      setMeetings(res.data.data.meetings || []);
      setRequests(res.data.data.requests || []);
    } catch (err) {
      showToast('Failed to load meetings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (socket) {
      socket.on('summary-shared', (data: { meetingId: string, title: string }) => {
        showToast(`Manager shared a summary for: ${data.title}`, 'info');
        fetchData();
      });
    }

    return () => {
      if (socket) socket.off('summary-shared');
    };
  }, [socket]);

  const formatSummary = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      let content: React.ReactNode = line;
      const boldMatch = line.match(/\*\*(.*?)\*\*/g);
      if (boldMatch) {
        let parts = line.split(/\*\*(.*?)\*\*/g);
        content = parts.map((part, index) => index % 2 === 1 ? <strong key={index} className="text-foreground font-bold">{part}</strong> : part);
      }
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return <li key={i} className="ml-4 list-disc mb-1 pl-1 text-[11px]">{content}</li>;
      }
      return <p key={i} className="mb-2 last:mb-0 text-[11px]">{content}</p>;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.preferredDate) {
      return showToast('Please fill in all required fields', 'warning');
    }
    
    try {
      setSubmitting(true);
      await clientAPI.requestMeeting(formData);
      showToast('Meeting request submitted successfully', 'success');
      setFormData({ subject: '', preferredDate: '', message: '' });
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to submit request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetSummary = async (meetingId: string) => {
    setLoadingSummary(meetingId);
    try {
      const res = await clientAPI.summarizeMeeting(meetingId);
      setMeetingSummaries(prev => ({
        ...prev,
        [meetingId]: res.data.summary
      }));
      showToast("Summary generated!", "success");
      fetchData(); // Refresh to get saved summary
    } catch (err) {
      showToast("Failed to generate summary", "error");
    } finally {
      setLoadingSummary(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Meetings & Collaboration</h1>
          <p className="text-muted-foreground mt-1">Manage your consultations and sync-ups.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-bold text-sm transition-all hover:opacity-90 active:scale-95 shadow-md"
        >
          <Plus className="w-4 h-4" /> Request a Meeting
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted/40 rounded-xl w-fit border border-border">
        <button 
          onClick={() => setActiveTab('scheduled')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'scheduled' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Scheduled ({meetings.length})
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'requests' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          My Requests ({requests.length})
        </button>
      </div>

      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          </div>
        ) : activeTab === 'scheduled' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings.length > 0 ? meetings.map((meeting) => (
              <motion.div 
                key={meeting._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-foreground/20 transition-all flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${meeting.status === 'scheduled' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                    {meeting.status}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg mb-2 truncate">{meeting.title}</h3>
                
                <div className="space-y-3 mt-auto">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(meeting.startTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>With {meeting.createdBy?.fullName || 'Project Manager'}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <button onClick={() => window.location.href = `/client/meetings/${meeting.roomId || meeting._id}`} className="text-sm font-bold text-blue-500 hover:underline">Join Meeting</button>
                  <button className="p-1 hover:bg-muted rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {meeting.sharedWithClient && meeting.summary && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-500/80">Meeting Summary</span>
                      </div>
                      <button 
                        onClick={() => setExpandedSummaries(prev => ({ ...prev, [meeting._id]: !prev[meeting._id] }))}
                        className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {expandedSummaries[meeting._id] ? 'Hide' : 'View AI Summary'}
                      </button>
                    </div>
                    
                    <AnimatePresence>
                      {expandedSummaries[meeting._id] && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-blue-500/5 rounded-xl p-4 mt-2 border border-blue-500/10">
                            <div className="text-muted-foreground leading-relaxed">
                              {formatSummary(meeting.summary)}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )) : (
              <div className="col-span-full py-20 text-center bg-muted/20 border border-dashed border-border rounded-2xl">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground font-medium">No scheduled meetings found.</p>
              </div>
            )}
          </div>
        ) : (
          /* Meeting Requests Table/List */
          <div className="space-y-4">
            {requests.length > 0 ? requests.map((req) => (
              <motion.div 
                key={req._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card border border-border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${req.status === 'accepted' ? 'bg-green-100 text-green-600' : req.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    {req.status === 'accepted' ? <CheckCircle2 className="w-5 h-5" /> : req.status === 'rejected' ? <X className="w-5 h-5" /> : <Timer className="w-5 h-5 font-bold" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-base">{req.subject}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Preferred: {new Date(req.preferredDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                    <span className={`text-xs font-bold uppercase tracking-widest ${req.status === 'accepted' ? 'text-green-600' : req.status === 'rejected' ? 'text-red-600' : 'text-amber-600'}`}>
                      {req.status}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </motion.div>
            )) : (
              <div className="py-20 text-center bg-muted/20 border border-dashed border-border rounded-2xl">
                <p className="text-muted-foreground font-medium">You haven't made any meeting requests yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Request Meeting Modal */}
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
              className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                <h2 className="text-xl font-bold font-heading">Request a Meeting</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Subject <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="e.g. Project Phase 2 Sync"
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-foreground transition-all outline-none"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Preferred Date <span className="text-red-500">*</span></label>
                    <input 
                      type="date" 
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-foreground transition-all outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Message / Agenda</label>
                    <textarea 
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Briefly describe what you'd like to discuss..."
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-foreground transition-all outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-blue-700">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-relaxed">
                    Your project manager will be notified and will schedule a time that works for everyone.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3.5 rounded-xl border border-border font-bold text-sm hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3.5 rounded-xl bg-foreground text-background font-bold text-sm hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Request'}
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

export default ClientMeetings;
