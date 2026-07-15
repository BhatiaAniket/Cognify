import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  X, 
  Loader2,
  FolderKanban,
  Mail,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { companyAPI } from '../../api/company';
import { showToast } from '../../components/Toast';

const CompanyClients: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [assigning, setAssigning] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [peopleRes, projectsRes] = await Promise.all([
        companyAPI.listPeople({ role: 'client' }),
        companyAPI.listProjects()
      ]);
      setClients(peopleRes.data.data.people || []);
      setProjects(projectsRes.data.data.projects || []);
    } catch (err) {
      showToast('Failed to load clients', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async () => {
    if (!selectedProjectId) return showToast('Please select a project', 'warning');
    
    try {
      setAssigning(true);
      await companyAPI.assignClient(selectedProjectId, selectedClient._id);
      showToast('Client assigned to project successfully', 'success');
      setShowAssignModal(false);
      setSelectedClient(null);
      setSelectedProjectId('');
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to assign client', 'error');
    } finally {
      setAssigning(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Client Directory</h1>
          <p className="text-muted-foreground mt-1">Manage and assign clients to active projects.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                 type="text" 
                 placeholder="Search clients..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 rounded-xl bg-card border border-border focus:border-foreground transition-all outline-none text-sm"
              />
           </div>
           <button className="p-2 rounded-xl border border-border bg-card hover:bg-muted transition-colors">
              <Filter className="w-5 h-5 text-muted-foreground" />
           </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredClients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Client Information</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assigned Project</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredClients.map((client) => (
                  <tr key={client._id} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-foreground text-background flex items-center justify-center text-lg font-bold shadow-soft border-2 border-background">
                          {client.avatar ? <img src={client.avatar} className="w-full h-full object-cover rounded-2xl" /> : client.fullName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{client.fullName}</p>
                          <div className="flex items-center gap-3 mt-1 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                             <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {client.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {client.assignedProject ? (
                         <div className="flex items-center gap-2">
                            <span className="bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                               {client.assignedProject?.name || 'Loading...'}
                            </span>
                         </div>
                      ) : (
                         <span className="text-xs italic text-muted-foreground">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {client.status === 'active' ? (
                           <span className="flex items-center gap-1.5 text-green-600 text-[10px] font-black uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full border border-green-200">
                              <ShieldCheck className="w-3.5 h-3.5" /> ACTIVE
                           </span>
                        ) : (
                           <span className="flex items-center gap-1.5 text-amber-500 text-[10px] font-black uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                              <Clock className="w-3.5 h-3.5" /> PENDING
                           </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={() => { setSelectedClient(client); setShowAssignModal(true); }}
                            className="px-4 py-2 rounded-xl bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-soft"
                         >
                            Assign Project
                         </button>
                         <button className="p-2 rounded-xl border border-border hover:bg-muted transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-24 text-center">
            <Users className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
            <h3 className="text-xl font-bold font-heading">No Clients Found</h3>
            <p className="text-muted-foreground text-sm mt-1">Add clients from the People management page.</p>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAssignModal(false); setSelectedClient(null); }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-[2.5rem] shadow-premium overflow-hidden"
            >
              <div className="p-8 border-b border-border flex items-center justify-between bg-muted/30">
                <div>
                   <h2 className="text-2xl font-bold font-heading tracking-tight uppercase">Link Project</h2>
                   <p className="text-xs text-muted-foreground mt-1">Assigning <span className="text-foreground font-bold">{selectedClient?.fullName}</span> to a project</p>
                </div>
                <button onClick={() => { setShowAssignModal(false); setSelectedClient(null); }} className="p-3 hover:bg-muted rounded-2xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-10 space-y-8">
                <div className="space-y-4">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Select Active Project</p>
                   <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {projects.filter(p => p.manager).length > 0 ? (
                        projects.filter(p => p.manager).map((project) => (
                          <button
                             key={project._id}
                             onClick={() => setSelectedProjectId(project._id)}
                             className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${selectedProjectId === project._id ? 'border-foreground bg-foreground/5' : 'border-transparent bg-muted/20 hover:border-border'}`}
                          >
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedProjectId === project._id ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>
                                <FolderKanban className="w-5 h-5" />
                             </div>
                             <div className="text-left">
                                <p className="text-sm font-bold uppercase tracking-tight">{project.name}</p>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{project.progress}% Complete</p>
                             </div>
                             {selectedProjectId === project._id && (
                                <CheckCircle2 className="w-5 h-5 text-foreground ml-auto" />
                             )}
                          </button>
                        ))
                      ) : (
                        <div className="p-8 text-center bg-muted/20 rounded-2xl border border-dashed border-border">
                           <p className="text-xs text-muted-foreground">No active projects with assigned managers available.</p>
                        </div>
                      )}
                   </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => { setShowAssignModal(false); setSelectedClient(null); }}
                    className="flex-1 py-4 rounded-2xl border-2 border-border font-black text-xs uppercase tracking-widest hover:bg-muted transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAssign}
                    disabled={assigning || !selectedProjectId}
                    className="flex-1 py-4 rounded-2xl bg-foreground text-background font-black text-xs uppercase tracking-widest hover:shadow-premium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Assignment'}
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

export default CompanyClients;
