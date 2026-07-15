import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { 
  Building2, Users, CreditCard, LayoutGrid, 
  PlusCircle, AlertTriangle, Activity, Loader2,
  TrendingUp, BarChart3, PieChart
} from 'lucide-react';
import { superAdminService } from '../../api/superAdmin';
import { showToast } from '../../components/Toast';

const SuperAdminOverview = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await superAdminService.getOverview();
        setData(res.data.data);
      } catch (error) {
        console.error('Error fetching superadmin overview:', error);
        showToast('Failed to load overview data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentActivity = data?.recentActivity || [];

  const statCards = [
    { label: 'Total Companies', value: stats.totalCompanies, icon: Building2, color: 'blue' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'purple' },
    { label: 'Active Subscriptions', value: stats.activeSubscriptions, icon: CreditCard, color: 'green' },
    { label: 'New This Month', value: stats.newCompaniesThisMonth, icon: PlusCircle, color: 'orange' },
    { label: 'Expiring Trials', value: stats.expiringTrials, icon: AlertTriangle, color: 'red', warning: stats.expiringTrials > 0 },
    { label: 'Active Companies', value: stats.activeCompanies, icon: Activity, color: 'teal' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-border/50 rounded-2xl p-6"
      >
        <h1 className="text-3xl font-bold font-heading mb-2">Platform Overview</h1>
        <p className="text-muted-foreground">Global statistics and platform health metrics.</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-card border border-border rounded-2xl p-5 hover:border-${stat.color}-500/50 transition-all duration-300 hover:translate-y-[-2px] relative overflow-hidden`}
          >
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30 text-${stat.color}-600 dark:text-${stat.color}-400 flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold font-heading">
              <CountUp end={stat.value} duration={2} />
            </p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            {stat.warning && (
              <div className="absolute top-4 right-4 animate-pulse">
                <span className="flex h-2 w-2 rounded-full bg-red-500"></span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2 bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <Activity className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                  <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${
                    activity.action.includes('Suspended') ? 'bg-red-100 text-red-600' :
                    activity.action.includes('Activated') ? 'bg-green-100 text-green-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Company: <span className="text-foreground">{activity.targetCompany?.name || 'Platform'}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-2 font-mono">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No platform activity recorded yet.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-6">System Health</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Companies</span>
                <span className="font-medium">{stats.activeCompanies} / {stats.totalCompanies}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${(stats.activeCompanies / (stats.totalCompanies || 1)) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Platform shortcuts</h4>
              <div className="grid grid-cols-1 gap-3">
                <button className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:bg-muted transition-colors text-left text-sm font-medium">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  Manage Companies
                </button>
                <button className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:bg-muted transition-colors text-left text-sm font-medium">
                  <CreditCard className="w-4 h-4 text-purple-500" />
                  View Subscriptions
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SuperAdminOverview;
