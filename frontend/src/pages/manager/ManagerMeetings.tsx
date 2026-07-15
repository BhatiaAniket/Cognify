import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Video, Calendar as CalendarIcon, Clock, Users, X, Loader2, Send, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { managerAPI } from '../../api/manager';
import { companyAPI } from '../../api/company';
import { showToast } from '../../components/Toast';

export default function ManagerMeetings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'requests' | 'employee_requests' | 'client_requests'>('upcoming');
  const [meetings, setMeetings] = useState<any[]>([]);
  const [employeeRequests, setEmployeeRequests] = useState<any[]>([]);
  const [clientRequests, setClientRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState<string | null>(null);
  const [meetingSummaries, setMeetingSummaries] = useState<Record<string, string>>({});
  const [expandedSummaries, setExpandedSummaries] = useState<Record<string, boolean>>({});
  const [sharingLoading, setSharingLoading] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [shareClientIds, setShareClientIds] = useState<string[]>([]);
  const [clientsForShare, setClientsForShare] = useState<any[]>([]);

  // Users for participants dropdown
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Create Meeting state
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    startDate: '',
    startTime: '',
    duration: '30',
    type: 'team',
    agenda: '',
    participants: [] as string[]
  });

  // Admin Request state
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestForm, setRequestForm] = useState({
    subject: '',
    date: '',
    reason: ''
  });

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const res = await companyAPI.listMeetings();
      setMeetings(res.data.data.all || res.data.data.meetings || []);
    } catch { setMeetings([]); }
    finally { setLoading(false); }
  };

  const fetchEmployeeRequests = async () => {
    try {
      // Get meeting requests using the unified managerAPI
      const res = await managerAPI.getMeetingRequests();
      // Filter out client requests (or keep them separate logic)
      // Usually employee requests have requesterRole: 'employee'
      setEmployeeRequests(res.data.data.filter((r: any) => r.requesterRole === 'employee') || []);
    } catch { /* ignore */ }
  };

  const fetchClientRequests = async () => {
    try {
      const res = await managerAPI.getMeetingRequests();
      // Filter for client requests
      setClientRequests(res.data.data.filter((r: any) => r.requesterRole === 'client') || []);
    } catch { /* ignore */ }
  };

  const fetchTeam = async () => {
    try {
      const [empRes, cliRes, peopleRes] = await Promise.all([
        managerAPI.getEmployees().catch(() => ({ data: { data: [] } })),
        managerAPI.getClients().catch(() => ({ data: { data: [] } })),
        companyAPI.listPeople({ limit: 100 }).catch(() => ({ data: { data: { people: [] } } }))
      ]);
      
      const employees = empRes.data?.data || [];
      const clients = cliRes.data?.data || [];
      const others = peopleRes.data?.data?.people || [];
      
      const allPeople = [...employees, ...clients, ...others];
      const uniquePeople = Array.from(new Map(allPeople.map(p => [p._id, p])).values());
      
      setTeamMembers(uniquePeople);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchMeetings();
    fetchTeam();
    fetchEmployeeRequests();
    fetchClientRequests();
    const fetchClientsForShare = async () => {
      try {
        const res = await managerAPI.getClients();
        setClientsForShare(res.data.data);
      } catch (err) {}
    };
    fetchClientsForShare();
  }, []);

  const handleShareSummarySubmit = async () => {
    if (!showShareModal || shareClientIds.length === 0) return;
    setSharingLoading(showShareModal);
    try {
      await managerAPI.shareMeetingSummary(showShareModal, { clientIds: shareClientIds });
      setMeetings(meetings.map(m => m._id === showShareModal ? { ...m, sharedWithClient: true } : m));
      showToast('Summary shared with clients!', 'success');
      setShowShareModal(null);
      setShareClientIds([]);
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Failed to share summary', 'error');
    } finally {
      setSharingLoading(null);
    }
  };

  const formatSummary = (text: string) => {
    if (!text) return null;
    
    // Simple markdown-to-JSX converter
    return text.split('\n').map((line, i) => {
      let content: React.ReactNode = line;
      
      // Handle Bold **text**
      const boldMatch = line.match(/\*\*(.*?)\*\*/g);
      if (boldMatch) {
        let parts = line.split(/\*\*(.*?)\*\*/g);
        content = parts.map((part, index) => 
          index % 2 === 1 ? <strong key={index} className="text-foreground font-bold">{part}</strong> : part
        );
      }

      // Handle Bullet Points - or *
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const bulletText = line.trim().substring(2);
        return (
          <li key={i} className="ml-4 list-disc mb-1 pl-1">
            {content}
          </li>
        );
      }
      
      return <p key={i} className="mb-2 last:mb-0">{content}</p>;
    });
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingForm.title || !meetingForm.startDate || !meetingForm.startTime) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    if (meetingForm.participants.length === 0) {
      showToast('Please select at least one participant from the list (Hold Ctrl/Cmd to select)', 'error');
      return;
    }

    setCreateLoading(true);
    try {
      const datetime = new Date(`${meetingForm.startDate}T${meetingForm.startTime}`);

      const payload = {
        title: meetingForm.title,
        startTime: datetime.toISOString(),
        durationMinutes: parseInt(meetingForm.duration),
        type: meetingForm.type,
        agenda: meetingForm.agenda,
        participants: meetingForm.participants
      };

      await companyAPI.createMeeting(payload);
      showToast('Meeting scheduled successfully', 'success');
      setShowCreate(false);
      setMeetingForm({ title: '', startDate: '', startTime: '', duration: '30', type: 'team', agenda: '', participants: [] });
      fetchMeetings();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to schedule meeting', 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAdminRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestLoading(true);
    try {
      await companyAPI.requestAdminMeeting(requestForm);
      showToast('Request sent to Admin!', 'success');
      setRequestForm({ subject: '', date: '', reason: '' });
      setActiveTab('upcoming');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to send request', 'error');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleEmployeeRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      await managerAPI.handleMeetingRequest({
        notificationId: requestId,
        action
      });
      showToast(`Meeting ${action === 'accept' ? 'accepted' : 'declined'}`, 'success');
      fetchEmployeeRequests();
      fetchClientRequests();
      fetchMeetings();
    } catch (err) {
      showToast('Failed to process request', 'error');
    }
  };

  const handleGetSummary = async (meetingId: string) => {
    setLoadingSummary(meetingId);
    try {
      const res = await managerAPI.summarizeMeeting(meetingId);
      setMeetingSummaries(prev => ({
        ...prev,
        [meetingId]: res.data.summary
      }));
      showToast("Summary generated!", "success");
      fetchMeetings();
    } catch (err) {
      showToast("Failed to generate summary", "error");
    } finally {
      setLoadingSummary(null);
    }
  };

  const isMeetingActive = (startTime: string, durationMin: number) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationMin * 60000);
    const joinWindow = new Date(start.getTime() - 10 * 60000);
    return now >= joinWindow && now <= end;
  };

  const isMeetingPast = (startTime: string, durationMin: number) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationMin * 60000);
    return now > end;
  };

  const upcomingMeetings = meetings.filter(m => !isMeetingPast(m.startTime, m.durationMinutes));
  const pastMeetings = meetings.filter(m => isMeetingPast(m.startTime, m.durationMinutes));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Meetings</h1>
          <p className="text-sm text-muted-foreground mt-1">Schedule and manage team syncs</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-foreground text-background text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Schedule Meeting
        </button>
      </div>

      <div className="flex border-b border-border gap-6">
        <button onClick={() => setActiveTab('upcoming')} className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'upcoming' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Upcoming ({upcomingMeetings.length})
        </button>
        <button onClick={() => setActiveTab('past')} className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'past' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Past ({pastMeetings.length})
        </button>
        <button onClick={() => setActiveTab('requests')} className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'requests' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Requests to Admin
        </button>
        <button onClick={() => setActiveTab('employee_requests')} className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'employee_requests' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Employee Requests ({employeeRequests.length})
        </button>
        <button onClick={() => setActiveTab('client_requests')} className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'client_requests' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Client Requests ({clientRequests.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : activeTab === 'upcoming' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingMeetings.length === 0 ? (
            <p className="col-span-full py-8 text-center text-muted-foreground">No upcoming meetings scheduled.</p>
          ) : upcomingMeetings.map(m => {
            const active = isMeetingActive(m.startTime, m.durationMinutes);
            return (
              <div key={m._id} className="bg-card border border-border rounded-2xl p-5 hover:border-accent/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{m.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${m.type === 'team' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {m.type}
                  </span>
                </div>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarIcon className="w-4 h-4" /> {new Date(m.startTime).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" /> {new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({m.durationMinutes} min)
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" /> {m.participants.length} participants
                  </div>
                </div>
                {active ? (
                  <button
                    onClick={() => navigate(`/manager/meetings/${m.roomId || m._id}`)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-lg hover:shadow-xl active:scale-[0.98]"
                  >
                    <Video className="w-4 h-4" /> Join Now
                  </button>
                ) : (
                  <button disabled className="w-full py-2.5 rounded-xl bg-muted text-muted-foreground font-medium cursor-not-allowed border border-border flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" /> Starts at {new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : activeTab === 'past' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pastMeetings.length === 0 ? (
            <p className="col-span-full py-8 text-center text-muted-foreground">No past meetings.</p>
          ) : pastMeetings.map(m => (
            <div key={m._id} className="bg-muted border border-border rounded-2xl p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{m.title}</h3>
                <span className="text-[10px] bg-background px-2.5 py-1 rounded-full uppercase tracking-wider font-bold border border-border opacity-70">Completed</span>
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
                <CalendarIcon className="w-4 h-4" /> {new Date(m.startTime).toLocaleDateString()}
              </div>
              
              {(m.summary || meetingSummaries[m._id]) ? (
                <div className="mt-2 pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-accent/80">Meeting Recap</span>
                    </div>
                    <button 
                      onClick={() => setExpandedSummaries(prev => ({ ...prev, [m._id]: !prev[m._id] }))}
                      className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      {expandedSummaries[m._id] ? 'Hide' : 'View AI Summary'}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {expandedSummaries[m._id] && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-background/40 rounded-xl p-4 mt-2 border border-border/50">
                          <div className="text-xs text-muted-foreground leading-relaxed mb-4">
                            {formatSummary(m.summary || meetingSummaries[m._id])}
                          </div>
                          
                          <button 
                            onClick={() => setShowShareModal(m._id)}
                            disabled={m.sharedWithClient || sharingLoading === m._id}
                            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                              m.sharedWithClient 
                                ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-default' 
                                : 'bg-foreground text-background hover:opacity-90'
                            }`}
                          >
                            {sharingLoading === m._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            {m.sharedWithClient ? 'Shared' : 'Share Summary with Client'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button 
                  onClick={() => handleGetSummary(m._id)}
                  disabled={loadingSummary === m._id}
                  className="w-full mt-4 py-2 rounded-xl bg-accent/10 text-accent text-xs font-bold hover:bg-accent/20 transition-all flex items-center justify-center gap-2"
                >
                  {loadingSummary === m._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Get AI Summary
                </button>
              )}
            </div>
          ))}
        </div>
      ) : activeTab === 'employee_requests' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {employeeRequests.length === 0 ? (
            <p className="col-span-full py-8 text-center text-muted-foreground">No pending meeting requests from employees.</p>
          ) : employeeRequests.map(req => (
            <div key={req._id} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg">{req.subject || 'Meeting Request'}</h3>
                <span className="px-2 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-orange-100 text-orange-700">
                  Request
                </span>
              </div>
              {req.requestedBy && (
                <p className="text-sm font-medium mb-1">From: {req.requestedBy.fullName}</p>
              )}
              {req.preferredDate && (
                <p className="text-xs text-muted-foreground mb-1">
                  Preferred Date: {new Date(req.preferredDate).toLocaleDateString()}
                </p>
              )}
              {req.agenda && (
                <p className="text-sm text-muted-foreground mb-4 mt-2">Agenda: {req.agenda}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEmployeeRequest(req._id, 'decline')}
                  className="flex-1 py-2 px-4 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleEmployeeRequest(req._id, 'accept')}
                  className="flex-1 py-2 px-4 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition"
                >
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'client_requests' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clientRequests.length === 0 ? (
            <p className="col-span-full py-8 text-center text-muted-foreground">No pending meeting requests from clients.</p>
          ) : clientRequests.map(req => (
            <div key={req._id} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg">{req.subject || 'Client Meeting Request'}</h3>
                <span className="px-2 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-blue-100 text-blue-700">
                  Client Request
                </span>
              </div>
              {req.requestedBy && (
                <p className="text-sm font-medium mb-1">From: {req.requestedBy.fullName}</p>
              )}
              {req.preferredDate && (
                <p className="text-xs text-muted-foreground mb-1">
                  Preferred Date: {new Date(req.preferredDate).toLocaleDateString()}
                </p>
              )}
              {req.agenda && (
                <p className="text-sm text-muted-foreground mb-4 mt-2">Agenda: {req.agenda}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEmployeeRequest(req._id, 'decline')}
                  className="flex-1 py-2 px-4 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleEmployeeRequest(req._id, 'accept')}
                  className="flex-1 py-2 px-4 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition"
                >
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-6 max-w-lg mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold font-heading">Request Meeting with Admin</h2>
            <p className="text-sm text-muted-foreground mt-1">Submit a direct request for a 1-on-1 with the company admin.</p>
          </div>
          <form onSubmit={handleAdminRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input type="text" required value={requestForm.subject} onChange={e => setRequestForm({ ...requestForm, subject: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-border bg-background outline-none focus:border-foreground" placeholder="Brief subject" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Preferred Date</label>
              <input type="date" required value={requestForm.date} onChange={e => setRequestForm({ ...requestForm, date: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-border bg-background outline-none focus:border-foreground" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reason / Agenda</label>
              <textarea required value={requestForm.reason} onChange={e => setRequestForm({ ...requestForm, reason: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-border bg-background outline-none focus:border-foreground h-24 resize-none" placeholder="Provide context for this request..."></textarea>
            </div>
            <button disabled={requestLoading} type="submit" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-foreground text-background font-medium hover:scale-[1.02] transition-transform">
              {requestLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Send Request</>}
            </button>
          </form>
        </div>
      )}

      {/* Create Meeting Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-heading">Schedule Meeting</h2>
                <button onClick={() => setShowCreate(false)}><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateMeeting} className="space-y-4">
                <input placeholder="Meeting Title" required value={meetingForm.title} onChange={e => setMeetingForm({ ...meetingForm, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-foreground" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" required value={meetingForm.startDate} onChange={e => setMeetingForm({ ...meetingForm, startDate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-foreground" />
                  <input type="time" required value={meetingForm.startTime} onChange={e => setMeetingForm({ ...meetingForm, startTime: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select value={meetingForm.duration} onChange={e => setMeetingForm({ ...meetingForm, duration: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-foreground">
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">1 Hour</option>
                  </select>
                  <select value={meetingForm.type} onChange={e => setMeetingForm({ ...meetingForm, type: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-foreground">
                    <option value="one-on-one">1-on-1</option>
                    <option value="team">Team Sync</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground ml-1">Participants</label>
                  <div className="max-h-32 overflow-y-auto space-y-1 border border-border rounded-xl p-2 bg-background">
                    {teamMembers.map((p) => (
                      <label key={p._id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/40 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={meetingForm.participants.includes(p._id)}
                          onChange={() => {
                            setMeetingForm(prev => ({
                              ...prev,
                              participants: prev.participants.includes(p._id)
                                ? prev.participants.filter(id => id !== p._id)
                                : [...prev.participants, p._id]
                            }));
                          }}
                          className="rounded"
                        />
                        {p.fullName} <span className="text-xs text-muted-foreground capitalize">({p.role?.replace('_', ' ') || 'Unknown'})</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={createLoading} className="w-full py-3 rounded-xl bg-foreground text-background font-medium hover:scale-[1.02] transition-transform">
                  {createLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Schedule'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Summary Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-heading">Share Summary</h2>
                <button onClick={() => setShowShareModal(null)}><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Select clients to share this summary with:</p>
                
                <div className="flex gap-2 mb-2">
                   <button 
                      onClick={() => setShareClientIds(clientsForShare.map(c => c._id))}
                      className="px-3 py-1 rounded bg-muted text-xs font-semibold hover:bg-muted/80"
                   >
                     Select All
                   </button>
                   <button 
                      onClick={() => setShareClientIds([])}
                      className="px-3 py-1 rounded bg-muted text-xs font-semibold hover:bg-muted/80"
                   >
                     Deselect All
                   </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-xl p-2 bg-background custom-scrollbar">
                  {clientsForShare.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No clients found in company.</p>
                  ) : clientsForShare.map((c) => (
                    <label key={c._id} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted/40 cursor-pointer text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={shareClientIds.includes(c._id)}
                        onChange={() => {
                          setShareClientIds(prev => prev.includes(c._id)
                            ? prev.filter(id => id !== c._id)
                            : [...prev, c._id]
                          );
                        }}
                        className="rounded cursor-pointer w-4 h-4"
                      />
                      {c.fullName} <span className="text-[10px] text-muted-foreground uppercase opacity-70">({c.clientCompany || 'Client'})</span>
                    </label>
                  ))}
                </div>

                <button 
                  onClick={handleShareSummarySubmit} 
                  disabled={shareClientIds.length === 0 || sharingLoading === showShareModal} 
                  className="w-full py-3 rounded-xl bg-foreground text-background font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {sharingLoading === showShareModal ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Share Summary</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
