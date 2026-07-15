import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderKanban, 
  BarChart, 
  Clock, 
  Calendar, 
  Activity, 
  ArrowRight,
  Plus
} from 'lucide-react';
import { clientAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/Toast';
import { useNavigate } from 'react-router-dom';

const ClientOverview: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await clientAPI.getOverview();
        setData(res.data.data);
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to load dashboard data';
        showToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-3">
             <div className="h-8 w-64 bg-muted rounded-lg" />
             <div className="h-4 w-48 bg-muted rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[1,2,3,4].map(i => <div key={i} className="h-32 bg-card border border-border rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 h-96 bg-card border border-border rounded-2xl" />
           <div className="h-96 bg-card border border-border rounded-2xl" />
        </div>
      </div>
    );
  }

  if (data?.assigned === false || !data?.hasProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-12 bg-card border border-border rounded-[2.5rem] shadow-sm">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-8">
           <FolderKanban className="w-12 h-12 text-muted-foreground opacity-20" />
        </div>
        <h2 className="text-3xl font-bold font-heading mb-4 tracking-tight">No Project Assigned Yet</h2>
        <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed text-lg">
          Your account is currently active, but you haven't been linked to a specific project roadmap yet.
        </p>
        <div className="mt-10 p-6 bg-muted/30 rounded-2xl border border-border/50">
           <p className="text-sm font-medium">Please contact your account manager to complete the setup.</p>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      label: 'Project Status', 
      value: data.projectStatus.replace('_', ' '), 
      icon: FolderKanban, 
      color: 'bg-blue-100 text-blue-600',
      badge: true,
      badgeColor: data.projectStatus === 'in_progress' ? 'bg-green-100 text-green-600 border-green-200' : 'bg-amber-100 text-amber-600 border-amber-200'
    },
    { 
      label: 'Overall Progress', 
      value: `${data.progress}%`, 
      icon: BarChart, 
      color: 'bg-green-100 text-green-600',
      progress: data.progress
    },
    { 
      label: 'Next Deadline', 
      value: data.deadline ? new Date(data.deadline).toLocaleDateString() : 'N/A', 
      icon: Clock, 
      color: 'bg-amber-100 text-amber-600'
    },
    { 
      label: 'Next Meeting', 
      value: data.nextMeeting ? new Date(data.nextMeeting.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'None scheduled', 
      icon: Calendar, 
      color: 'bg-purple-100 text-purple-600'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">
            Welcome, {user?.fullName?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Tracking progress for: <span className="font-semibold text-foreground">{data.projectName}</span>
          </p>
        </div>
        <button 
          onClick={() => navigate('/client/meetings')}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-bold text-sm transition-transform hover:scale-105 active:scale-95"
        >
          Request a Meeting <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-foreground/20 transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {stat.badge ? (
                <span className={`self-start px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-widest ${stat.badgeColor}`}>
                  {stat.value}
                </span>
              ) : (
                <span className="text-2xl font-bold font-heading">
                  {stat.value}
                </span>
              )}
              {stat.progress !== undefined && (
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-1000"
                    style={{ width: `${stat.progress}%` }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-bold font-heading flex items-center gap-2">
              <Activity className="w-5 h-5" /> Recent Activity
            </h3>
            <button 
              onClick={() => navigate('/client/notifications')}
              className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            {data.activityFeed.length > 0 ? (
              data.activityFeed.map((activity: any, i: number) => (
                <div key={i} className="flex gap-4 group">
                  <div className="relative flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-foreground mt-2" />
                    {i !== data.activityFeed.length - 1 && (
                      <div className="w-px flex-1 bg-border my-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium group-hover:text-foreground transition-colors">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground">No recent activity to show.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Help / Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <div className="bg-foreground text-background rounded-2xl p-6">
            <h3 className="text-lg font-bold font-heading mb-3">Project Hub</h3>
            <p className="text-sm opacity-80 mb-6 font-medium leading-relaxed">
              Track your project's milestones, view reports, and collaborate with your manager in real-time.
            </p>
            <button 
              onClick={() => navigate('/client/project')}
              className="w-full py-3 rounded-xl bg-background text-foreground font-bold text-sm transition-all hover:bg-background/90"
            >
              Go to My Project
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Support</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Need assistance? Connect with your assigned manager or visit settings for help.
            </p>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                ?
              </div>
              <div>
                <p className="text-xs font-bold">Help Center</p>
                <p className="text-[10px] text-muted-foreground">Guides & FAQs</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientOverview;
