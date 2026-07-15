import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Search, 
  ChevronRight, 
  Calendar, 
  User, 
  Clock,
  MessageSquare,
  FileCheck,
  Video,
  Download,
  ExternalLink,
  X,
  Loader2
} from 'lucide-react';
import { clientAPI } from '../../api/client';
import { showToast } from '../../components/Toast';

const ClientReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'summaries'>('daily');
  const [data, setData] = useState<any>({ reports: [], summaries: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSummary, setSelectedSummary] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);
  const [loadingReportDetails, setLoadingReportDetails] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reportsRes, summariesRes] = await Promise.all([
          clientAPI.getReports(),
          clientAPI.getSharedSummaries()
        ]);
        setData({
          reports: reportsRes.data.data?.reports || [],
          summaries: summariesRes.data.data || []
        });
      } catch (err) {
        showToast('Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownload = async (reportId: string) => {
    try {
      setDownloadingReport(reportId);
      const res = await clientAPI.downloadReport(reportId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      showToast('Failed to download report PDF', 'error');
    } finally {
      setDownloadingReport(null);
    }
  };

  const handleViewDetails = async (reportId: string) => {
    try {
      setLoadingReportDetails(reportId);
      const res = await clientAPI.getReportDetails(reportId);
      setSelectedReport(res.data.data);
    } catch (err) {
      showToast('Failed to load report details', 'error');
    } finally {
      setLoadingReportDetails(null);
    }
  };

  const filteredReports = data.reports.filter((r: any) => 
    r.task?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.employee?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSummaries = data.summaries.filter((s: any) => 
    s.meetingId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.sharedBy?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Reports & Summaries</h1>
          <p className="text-muted-foreground mt-1">Review project progress and meeting outcomes.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search reports or meetings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border focus:border-foreground transition-all outline-none text-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted/40 rounded-xl w-fit border border-border">
        <button 
          onClick={() => setActiveTab('daily')}
          className={`group flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'daily' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <FileText className={`w-4 h-4 ${activeTab === 'daily' ? 'text-blue-500' : 'text-muted-foreground group-hover:text-foreground'}`} />
          Daily Reports
        </button>
        <button 
          onClick={() => setActiveTab('summaries')}
          className={`group flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'summaries' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <MessageSquare className={`w-4 h-4 ${activeTab === 'summaries' ? 'text-purple-500' : 'text-muted-foreground group-hover:text-foreground'}`} />
          Meeting Summaries
        </button>
      </div>

      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          </div>
        ) : activeTab === 'daily' ? (
          <div className="space-y-4">
            {filteredReports.length > 0 ? filteredReports.map((report: any) => (
              <motion.div 
                key={report._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-foreground/20 transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-lg">{report.task?.title || 'General Update'}</h3>
                    </div>
                    
                    <div className="bg-muted/30 rounded-xl p-4">
                      <p className="text-sm leading-relaxed text-foreground/80">{report.workDone}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <User className="w-3.5 h-3.5" /> {report.employee?.fullName}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <Calendar className="w-3.5 h-3.5" /> {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5" /> {report.hoursSpent} hrs spent
                      </div>
                    </div>
                  </div>

                  {/* Right side for attachments or quick actions */}
                  <div className="lg:w-48 flex lg:flex-col justify-end gap-2 shrink-0">
                    <button 
                      onClick={() => handleDownload(report._id)}
                      disabled={downloadingReport === report._id}
                      className="flex-1 lg:w-full py-2.5 rounded-xl border border-border text-xs font-bold hover:bg-muted transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                       {downloadingReport === report._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} 
                       Download
                    </button>
                    <button 
                      onClick={() => handleViewDetails(report._id)}
                      disabled={loadingReportDetails === report._id}
                      className="flex-1 lg:w-full py-2.5 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                       {loadingReportDetails === report._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>View Details <ChevronRight className="w-3.5 h-3.5" /></>}
                    </button>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="py-20 text-center bg-muted/20 border border-dashed border-border rounded-2xl">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground font-medium">No shared daily reports found.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSummaries.length > 0 ? filteredSummaries.map((summary: any) => (
              <motion.div 
                key={summary._id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:border-foreground/20 transition-all flex flex-col group shadow-sm"
              >
                <div className="p-6 space-y-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Video className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-1 rounded">
                      Summary Shared
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg group-hover:text-blue-500 transition-colors leading-tight">
                    {summary.meetingId?.title || 'Shared Summary'}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {summary.summary || 'No summary text available.'}
                  </p>

                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5" /> Meeting Date: {new Date(summary.meetingId?.startTime || summary.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      <User className="w-3.5 h-3.5" /> Shared by: {summary.sharedBy?.fullName || 'Manager'}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 border-t border-border mt-auto">
                  <button 
                    onClick={() => setSelectedSummary(summary)}
                    className="w-full py-2.5 rounded-lg bg-foreground text-background text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center"
                  >
                    Read Full Summary
                  </button>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-20 text-center bg-muted/20 border border-dashed border-border rounded-2xl">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground font-medium">No shared meeting summaries found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Modal */}
      {selectedSummary && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card w-full max-w-2xl rounded-2xl border border-border flex flex-col max-h-[85vh] shadow-[0_0_40px_-15px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold font-heading">{selectedSummary.meetingId?.title || 'Shared Summary'}</h2>
                <p className="text-xs text-muted-foreground mt-1 font-bold uppercase tracking-wider flex items-center gap-2">
                   <Calendar className="w-3.5 h-3.5" /> {new Date(selectedSummary.meetingId?.startTime || selectedSummary.createdAt).toLocaleDateString()} 
                   <span className="w-1 h-1 bg-muted-foreground rounded-full mx-1"></span>
                   Shared by {selectedSummary.sharedBy?.fullName || 'Manager'}
                </p>
              </div>
              <button onClick={() => setSelectedSummary(null)} className="p-2 hover:bg-muted rounded-xl transition-colors shrink-0"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="text-sm leading-[1.8] text-foreground/90 whitespace-pre-wrap font-medium pb-4">
                {selectedSummary.summary || 'No summary text available.'}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card w-full max-w-2xl rounded-2xl border border-border flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
              <div>
                <h2 className="text-xl font-bold font-heading">{selectedReport.task?.title || 'Daily Report'}</h2>
                <p className="text-xs text-muted-foreground mt-1 font-bold uppercase tracking-wider flex items-center gap-2">
                   <Calendar className="w-3.5 h-3.5" /> {new Date(selectedReport.createdAt).toLocaleDateString()}
                   <span className="w-1 h-1 bg-muted-foreground rounded-full mx-1"></span>
                   {selectedReport.employee?.fullName || 'Manager'}
                </p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-muted rounded-xl transition-colors shrink-0"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-muted w-full p-4 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Hours Spent</p>
                    <p className="text-lg font-bold">{selectedReport.hoursSpent || 0} hrs</p>
                 </div>
                 <div className="bg-muted w-full p-4 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Task Status</p>
                    <p className="text-lg font-bold capitalize">{selectedReport.status || 'Active'}</p>
                 </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Work Done</h3>
                <div className="bg-muted/30 border border-border rounded-xl p-4 text-sm font-medium leading-relaxed">
                  {selectedReport.workDone || 'No description provided.'}
                </div>
              </div>

              {selectedReport.blockers && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Blockers</h3>
                  <div className="bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl p-4 text-sm font-medium leading-relaxed">
                    {selectedReport.blockers}
                  </div>
                </div>
              )}

              {selectedReport.managerFeedback && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Manager Feedback</h3>
                  <div className="bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-xl p-4 text-sm font-medium leading-relaxed">
                    {selectedReport.managerFeedback}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ClientReports;
