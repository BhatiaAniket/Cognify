import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  FolderKanban, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  MessageCircle, 
  Search,
  Loader2,
  ChevronRight,
  Filter,
  X,
  ExternalLink
} from 'lucide-react';
import { managerAPI } from '../../api/manager';
import { showToast } from '../../components/Toast';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  reviewed: 'bg-blue-100 text-blue-700',
  addressed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const priorityColors: Record<string, string> = {
  Low: 'text-green-500',
  Medium: 'text-amber-500',
  High: 'text-red-500',
  Critical: 'text-purple-500',
};

const ManagerClients: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [demands, setDemands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDemand, setSelectedDemand] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [comment, setComment] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [clientsRes, demandsRes] = await Promise.all([
        managerAPI.getClients(),
        managerAPI.getClientDemands()
      ]);
      setClients(clientsRes.data.data || []);
      setDemands(demandsRes.data.data || []);
    } catch (err) {
      showToast('Failed to load client data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateDemandStatus = async (id: string, status: string) => {
    try {
      setUpdating(true);
      await managerAPI.updateDemandStatus(id, { status, managerComment: comment });
      showToast(`Demand marked as ${status}`, 'success');
      setSelectedDemand(null);
      setComment('');
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update demand', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClientDemands = (clientId: string) => {
    return demands.filter(d => d.client?._id === clientId);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground font-medium">Loading clients & demands...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Client Management</h1>
          <p className="text-muted-foreground mt-1">Manage client relationships and project demands.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search clients or projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border focus:border-foreground transition-all outline-none text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredClients.length > 0 ? filteredClients.map((client, i) => {
          const clientDemands = getClientDemands(client._id);
          const pendingCount = clientDemands.filter(d => d.status === 'pending').length;

          return (
            <motion.div 
              key={client._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="p-6 flex flex-col lg:flex-row gap-8">
                {/* Client Info */}
                <div className="lg:w-1/3 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center text-xl font-bold border-2 border-background shadow-md">
                      {client.avatar ? <img src={client.avatar} className="w-full h-full object-cover rounded-full" /> : client.fullName?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{client.fullName}</h3>
                      <p className="text-xs text-muted-foreground">{client.email}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Assigned Project</p>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-bold text-foreground truncate">{client.projectName}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                       <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Collaboration</span>
                    </div>
                  </div>
                </div>

                {/* Demands Summary */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" /> Recent Demands {pendingCount > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingCount} New</span>}
                    </h4>
                    <button className="text-xs font-bold text-muted-foreground hover:text-foreground">View History</button>
                  </div>

                  <div className="space-y-3">
                    {clientDemands.slice(0, 3).map((demand) => (
                      <div 
                        key={demand._id}
                        onClick={() => setSelectedDemand(demand)}
                        className="p-4 bg-muted/20 border border-border rounded-xl flex items-center justify-between group hover:border-foreground/20 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${demand.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            <AlertCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold truncate group-hover:text-blue-500 transition-colors uppercase tracking-tight">{demand.title}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${demand.priority === 'High' ? 'text-red-500' : 'text-blue-500'}`}>{demand.priority} Priority</span>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">•</span>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{new Date(demand.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColors[demand.status]}`}>
                              {demand.status}
                           </span>
                           <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                    {clientDemands.length === 0 && (
                      <div className="py-8 text-center bg-muted/10 rounded-xl border border-dashed border-border">
                        <p className="text-xs text-muted-foreground">No recent demands for this client.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        }) : (
          <div className="py-20 text-center bg-card border border-border rounded-2xl">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">No clients assigned to your projects.</p>
          </div>
        )}
      </div>

      {/* Demand Detail Modal */}
      <AnimatePresence>
        {selectedDemand && (
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
              className="relative w-full max-w-xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                <div>
                   <h2 className="text-xl font-bold font-heading uppercase tracking-tight">{selectedDemand.title}</h2>
                   <p className="text-xs text-muted-foreground mt-1">Submitted by: <span className="font-bold text-foreground">{selectedDemand.client?.fullName}</span></p>
                </div>
                <button onClick={() => setSelectedDemand(null)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-3 bg-muted/30 rounded-xl">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Category</p>
                      <p className="text-sm font-bold">{selectedDemand.category}</p>
                   </div>
                   <div className="p-3 bg-muted/30 rounded-xl">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Priority</p>
                      <p className={`text-sm font-bold ${priorityColors[selectedDemand.priority]}`}>{selectedDemand.priority}</p>
                   </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Description</p>
                  <p className="text-sm leading-relaxed p-4 bg-muted/20 border border-border rounded-xl">
                    {selectedDemand.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Feedback / Comment</p>
                  <textarea 
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Provide a brief update to the client..."
                    className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border focus:border-foreground transition-all outline-none resize-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => handleUpdateDemandStatus(selectedDemand._id, 'reviewed')}
                    disabled={updating}
                    className="py-3 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs uppercase tracking-widest hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                    Mark Reviewed
                  </button>
                  <button 
                    onClick={() => handleUpdateDemandStatus(selectedDemand._id, 'addressed')}
                    disabled={updating}
                    className="py-3 rounded-xl bg-green-50 text-green-600 font-bold text-xs uppercase tracking-widest hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                  >
                    Mark Addressed
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

export default ManagerClients;
