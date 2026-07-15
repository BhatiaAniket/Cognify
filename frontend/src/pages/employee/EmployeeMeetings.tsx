import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { employeeAPI } from '../../api/employee';
import { useSocket } from '../../context/SocketContext';
import { showToast } from '../../components/Toast';
import { 
  Calendar, Video, Clock, Loader2, Send, Sparkles, 
  CheckCircle2, AlertCircle, TrendingUp, Users, History,
  Info, ExternalLink, X
} from 'lucide-react';

const EmployeeMeetings = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'insights' | 'request'>('upcoming');
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [pastMeetings, setPastMeetings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [colleagues, setColleagues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null); // For summary modal
  const { socket } = useSocket();

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    recipientId: ''
  });

  const fetchData = useCallback(async () => {
    try {
      const [meetingsRes, reqRes, colRes] = await Promise.all([
        employeeAPI.getMeetings(),
        employeeAPI.getMeetingRequests(),
        employeeAPI.getColleagues()
      ]);
      
      const { upcoming, past } = meetingsRes.data.data;
      setUpcomingMeetings(upcoming || []);
      setPastMeetings(past || []);

      // combine requests sent and responses
      const history = [...(reqRes.data.data?.requests || []), ...(reqRes.data.data?.responses || [])]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRequests(history);

      const managers = colRes.data.data?.filter((c: any) => c.role === 'manager' || c.role === 'company_admin') || [];
      setColleagues(managers);
    } catch (e) {
      console.error(e);
      showToast('Failed to load meeting data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!socket) return;
    socket.on('meeting:scheduled', fetchData);
    socket.on('notification', fetchData);
    return () => {
      socket.off('meeting:scheduled', fetchData);
      socket.off('notification', fetchData);
    }
  }, [socket, fetchData]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.recipientId) return showToast('Please fill all required fields', 'error');
    setSubmitLoading(true);
    try {
      await employeeAPI.requestMeeting({
        title: form.title,
        description: form.description,
        date: form.date,
        recipientId: form.recipientId
      });
      showToast('Meeting request sent!', 'success');
      setForm({ title: '', description: '', date: '', recipientId: '' });
      fetchData();
    } catch (e) {
      showToast('Failed to send request', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleGetSummary = async (meetingId: string) => {
    setLoadingSummary(meetingId);
    try {
      const res = await employeeAPI.summarizeMeeting(meetingId);
      showToast("Summary generated!", "success");
      fetchData();
      // If the current tab is Insights, or if we want to open it immediately:
      // setSelectedMeeting(res.data.data); 
    } catch (err) {
      showToast("Failed to generate summary", "error");
    } finally {
      setLoadingSummary(null);
    }
  };

  // Stats for AI Insights
  const stats = useMemo(() => {
    const totalAttended = pastMeetings.length;
    const thisMonth = pastMeetings.filter(m => {
      const mDate = new Date(m.startTime);
      const now = new Date();
      return mDate.getMonth() === now.getMonth() && mDate.getFullYear() === now.getFullYear();
    }).length;
    
    const typesCount = pastMeetings.reduce((acc: any, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {});
    
    let mostFrequentType = 'N/A';
    let max = 0;
    Object.entries(typesCount).forEach(([type, count]: [any, any]) => {
      if (count > max) {
        max = count;
        mostFrequentType = type;
      }
    });

    return { totalAttended, thisMonth, mostFrequentType };
  }, [pastMeetings]);

  // Join Button logic
  const getJoinButtonProps = (startTime: string, durationMin: number, roomId: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(start.getTime() + (durationMin || 30) * 60000);
    const joinWindow = new Date(start.getTime() - 10 * 60000);
    
    // Active if within 10 min of start OR already started and not ended
    const isActive = now >= joinWindow && now <= end;
    
    if (isActive) {
      return {
        label: 'Join Meeting',
        disabled: false,
        onClick: () => window.location.href = `/employee/meetings/${roomId}`
      };
    } else if (now > end) {
      return {
        label: 'Meeting Ended',
        disabled: true,
        onClick: () => {}
      };
    } else {
      const timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        label: `Starts at ${timeStr}`,
        disabled: true,
        onClick: () => {}
      };
    }
  };

  if (loading) return <div className="flex justify-center items-center py-24"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading">Meetings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your schedule and access AI-powered insights.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'upcoming', label: 'Upcoming Meetings', icon: Calendar },
          { id: 'past', label: 'Past Meetings', icon: History },
          { id: 'insights', label: 'AI Insights', icon: Sparkles },
          { id: 'request', label: 'Request a Meeting', icon: Send },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 border ${activeTab === tab.id ? 'bg-foreground text-background border-foreground shadow-lg' : 'bg-background text-muted-foreground border-border hover:border-foreground/20'}`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-background' : 'text-muted-foreground'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'upcoming' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingMeetings.length > 0 ? upcomingMeetings.map((m, i) => {
              const { label, disabled, onClick } = getJoinButtonProps(m.startTime, m.durationMinutes, m.roomId || m._id);
              return (
                <motion.div 
                  key={m._id} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.05 }} 
                  className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-sm line-clamp-1">{m.title}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">{m.type}</span>
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center"><Calendar className="w-3 h-3" /></div>
                        <span>{new Date(m.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center"><Clock className="w-3 h-3" /></div>
                        <span>{new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {m.durationMinutes} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center"><Users className="w-3 h-3" /></div>
                        <span>Organizer: {m.createdBy?.fullName || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={disabled}
                    onClick={onClick}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${disabled ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-foreground text-background hover:opacity-90 active:scale-[0.98]'}`}
                  >
                    {!disabled && <Video className="w-4 h-4" />}
                    {label}
                  </button>
                </motion.div>
              );
            }) : (
              <div className="col-span-full py-20 bg-muted/20 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4"><Calendar className="w-6 h-6 text-muted-foreground" /></div>
                <h3 className="font-semibold">No upcoming meetings</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">You don't have any upcoming meetings scheduled. Check back later or request one.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'past' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pastMeetings.length > 0 ? pastMeetings.map((m, i) => (
              <motion.div 
                key={m._id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.05 }} 
                className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-sm line-clamp-1">{m.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">{m.type}</span>
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-lg bg-muted/50 flex items-center justify-center"><Calendar className="w-3 h-3" /></div>
                       <span>{new Date(m.startTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-lg bg-muted/50 flex items-center justify-center"><Clock className="w-3 h-3" /></div>
                       <span>{new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-lg bg-muted/50 flex items-center justify-center"><Users className="w-3 h-3" /></div>
                       <span>Organized by {m.createdBy?.fullName || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  {m.summary ? (
                    <button
                      onClick={() => setSelectedMeeting(m)}
                      className="flex-1 py-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      View AI Summary
                    </button>
                  ) : (
                    <button
                      disabled={loadingSummary === m._id}
                      onClick={() => handleGetSummary(m._id)}
                      className="flex-1 py-2 rounded-xl bg-muted text-muted-foreground text-xs font-bold hover:text-foreground transition-all flex items-center justify-center gap-2"
                    >
                      {loadingSummary === m._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      Generate Summary
                    </button>
                  )}
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-20 bg-muted/20 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4"><History className="w-6 h-6 text-muted-foreground" /></div>
                <h3 className="font-semibold">No past meetings</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">You haven't attended any meetings yet. Summaries will appear here once they end.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-8 -mt-8" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Attended</span>
                  <span className="text-3xl font-black">{stats.totalAttended}</span>
                  <div className="flex items-center gap-1 mt-3">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-[10px] font-bold text-green-500 uppercase">Lifetime</span>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -mr-8 -mt-8" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">This Month</span>
                  <span className="text-3xl font-black">{stats.thisMonth}</span>
                  <div className="flex items-center gap-1 mt-3">
                    <CheckCircle2 className="w-3 h-3 text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-500 uppercase">April 2026</span>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden relative text-white bg-foreground dark:bg-muted/40 dark:text-foreground">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full -mr-8 -mt-8" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Top Type</span>
                  <span className="text-3xl font-black capitalize">{stats.mostFrequentType.replace('-', ' ')}</span>
                  <div className="flex items-center gap-1 mt-3">
                    <Users className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase">Primary Mode</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insight Cards */}
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Meeting Deep Dives
              </h2>
              <div className="grid grid-cols-1 gap-4">
              {pastMeetings.filter(m => m.summary).length > 0 ? pastMeetings.filter(m => m.summary).map((m, i) => (
                <motion.div 
                  key={m._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/40 transition-colors cursor-pointer group shadow-sm"
                  onClick={() => setSelectedMeeting(m)}
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base group-hover:text-primary transition-colors">{m.title}</h3>
                        <p className="text-xs text-muted-foreground">{new Date(m.startTime).toLocaleDateString()} • AI Summary Generated</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 pl-[52px]">
                      {m.summary}
                    </p>
                  </div>
                  <button className="md:px-6 py-3 rounded-2xl bg-muted font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white transition-all whitespace-nowrap">
                    Read Full Insight <ExternalLink className="w-3 h-3" />
                  </button>
                </motion.div>
              )) : (
                <div className="py-16 bg-muted/10 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4"><Info className="w-6 h-6 text-muted-foreground" /></div>
                  <h3 className="font-semibold">Insights will appear here</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">Once you have past meetings with AI summaries, they will show up as insight cards here.</p>
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'request' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-in zoom-in-95 duration-300">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <h2 className="text-lg font-bold mb-6">Schedule New Request</h2>
              <form onSubmit={handleSubmitRequest} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Title *</label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3.5 rounded-2xl border border-border bg-muted/30 focus:bg-background text-sm transition-all focus:outline-none focus:ring-2 ring-primary/20" placeholder="e.g. 1:1 Performance Review" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Recipient (Manager/Admin) *</label>
                  <select required value={form.recipientId} onChange={e => setForm({ ...form, recipientId: e.target.value })} className="w-full px-4 py-3.5 rounded-2xl border border-border bg-muted/30 focus:bg-background text-sm focus:outline-none focus:ring-2 ring-primary/20 appearance-none">
                    <option value="">Select recipient...</option>
                    {colleagues.map(c => <option key={c._id} value={c._id}>{c.fullName} ({c.role.replace('_', ' ')})</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Preferred Date & Time *</label>
                  <input type="datetime-local" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-3.5 rounded-2xl border border-border bg-muted/30 focus:bg-background text-sm focus:outline-none focus:ring-2 ring-primary/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Purpose / Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3.5 rounded-2xl border border-border bg-muted/30 focus:bg-background text-sm focus:outline-none focus:ring-2 ring-primary/20 min-h-[100px] resize-none" placeholder="Briefly describe the purpose of the meeting" />
                </div>
                <button disabled={submitLoading} className="w-full py-4 mt-2 rounded-2xl bg-foreground text-background font-black text-xs uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg">
                  {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send Request</>}
                </button>
              </form>
            </motion.div>

            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Request History</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {requests.length > 0 ? requests.map((req, i) => (
                  <div key={req._id} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/20 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <p className="font-bold text-sm">{req.title.includes('Request') ? req.metadata?.originalRequest?.title || 'Meeting Request' : req.title}</p>
                       <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                        req.title.includes('Accepted') ? 'bg-green-500/10 text-green-600 border-green-200' :
                        req.title.includes('Declined') ? 'bg-red-500/10 text-red-600 border-red-200' : 
                        'bg-yellow-500/10 text-yellow-600 border-yellow-200'
                       }`}>
                        {req.title.includes('Accepted') ? 'Accepted' : req.title.includes('Declined') ? 'Declined' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{req.message}</p>
                    <div className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                       <Clock className="w-3 h-3" />
                       {new Date(req.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )) : (
                  <div className="py-12 bg-muted/10 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center">
                    <History className="w-6 h-6 text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">No history found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Modal */}
      <AnimatePresence>
        {selectedMeeting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedMeeting(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-border rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 pb-0">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">AI Meeting Insight</span>
                    </div>
                    <h2 className="text-2xl font-black">{selectedMeeting.title}</h2>
                    <p className="text-sm text-muted-foreground">{new Date(selectedMeeting.startTime).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
                  </div>
                  <button onClick={() => setSelectedMeeting(null)} className="p-2 rounded-xl hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-muted/30 rounded-2xl p-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Duration</span>
                    <span className="font-bold text-sm">{selectedMeeting.durationMinutes} Minutes</span>
                  </div>
                  <div className="bg-muted/30 rounded-2xl p-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Participants</span>
                    <span className="font-bold text-sm">{selectedMeeting.participants?.length || 0} People</span>
                  </div>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto px-8 pb-8 custom-scrollbar">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                       Summary
                    </h3>
                    <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                      <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {selectedMeeting.summary}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Participants</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMeeting.participants?.map((p: any) => (
                        <div key={p._id} className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded-xl border border-border">
                          <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                            {p.fullName?.[0]}
                          </div>
                          <span className="text-xs font-medium">{p.fullName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 pt-0 flex justify-end">
                <button 
                  onClick={() => setSelectedMeeting(null)}
                  className="px-8 py-3 rounded-2xl bg-foreground text-background font-black text-xs uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeMeetings;
