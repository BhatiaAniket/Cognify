import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Target, Star, BarChart3, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { employeeAPI } from '../../api/employee';
import { showToast } from '../../components/Toast';

export default function EmployeePerformance() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await employeeAPI.getPerformance();
        setStats(res.data.data);
      } catch (err) {
        showToast('Error loading performance data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  const performanceMetrics = [
    { label: 'Tasks Completed', value: stats?.completedTasks || 0, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Overall Score', value: `${stats?.score || 0}%`, icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Avg Feedback', value: stats?.avgFeedback || '4.8/5', icon: Award, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Pending Tasks', value: stats?.pendingTasks || 0, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-heading text-foreground">My Performance</h1>
        <p className="text-muted-foreground">Track your growth and achievements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((m, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={m.label} 
            className="bg-card border border-border rounded-3xl p-6 shadow-sm group hover:border-foreground/20 transition-all"
          >
            <div className={`w-12 h-12 rounded-2xl ${m.bg} ${m.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <m.icon className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">{m.label}</p>
            <h3 className="text-2xl font-bold font-heading">{m.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Growth Chart Placeholder */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold font-heading flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Monthly Progress
            </h2>
          </div>
          <div className="h-64 flex items-end justify-between gap-4 px-2">
            {[45, 60, 55, 75, 85, 95].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className="w-full bg-gradient-to-t from-primary/20 to-primary rounded-t-xl" 
                />
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Month {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Goals / Targets */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold font-heading flex items-center gap-2 mb-8">
            <Target className="h-5 w-5 text-primary" /> Current Goals
          </h2>
          <div className="space-y-6">
            {[
              { name: 'UI Refactoring', progress: 85, deadline: 'Tomorrow' },
              { name: 'API Integration', progress: 40, deadline: '3 days left' },
              { name: 'Documentation', progress: 0, deadline: 'Next week' },
            ].map((goal, i) => (
              <div key={goal.name}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-sm tracking-tight">{goal.name}</h4>
                  <span className="text-xs text-muted-foreground">{goal.deadline}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    className="h-full bg-foreground rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
