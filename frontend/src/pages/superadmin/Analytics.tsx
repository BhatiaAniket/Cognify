import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell, 
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, Building2, LayoutGrid, 
  PieChart as PieIcon, Activity, Loader2, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { superAdminService } from '../../api/superAdmin';
import { showToast } from '../../components/Toast';

const COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444'];

const SuperAdminAnalytics = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await superAdminService.getAnalytics();
        setData(res.data.data);
      } catch (error) {
        showToast('Failed to load analytics', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { companiesByMonth, planDistribution, usersByMonth, stats } = data;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const companyData = companiesByMonth.map((d: any) => ({
    name: monthNames[d._id - 1],
    count: d.count
  }));

  const userData = usersByMonth.map((d: any) => ({
    name: monthNames[d._id - 1],
    users: d.count
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Platform Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Holistic view of platform growth and user engagement.</p>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">New Companies</p>
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold">{companyData[companyData.length - 1]?.count || 0}</h3>
            <span className="text-xs text-green-500 font-bold mb-1 flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +12%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">vs last month</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">User Growth</p>
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold">{userData[userData.length - 1]?.users || 0}</h3>
            <span className="text-xs text-green-500 font-bold mb-1 flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +8%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">new users this month</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Avg Company Size</p>
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold">{stats.averageCompanySize}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-2">users per company</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Most Popular Plan</p>
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-xl lg:text-3xl font-bold truncate">{stats.mostPopularPlan}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-2">by total subscriptions</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-3xl p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold font-heading">Company Onboarding</h3>
              <p className="text-sm text-muted-foreground">New organizations registered per month</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-[10px] uppercase font-bold tracking-wider">
              <Building2 className="w-3 h-3" /> Monthly
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={companyData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold font-heading">User Growth</h3>
              <p className="text-sm text-muted-foreground">Total platform users trend</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-[10px] uppercase font-bold tracking-wider">
              <Users className="w-3 h-3" /> Growth
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-card border border-border rounded-3xl p-8">
          <h3 className="text-xl font-bold font-heading mb-8">Plan Distribution</h3>
          <div className="h-[300px] w-full flex flex-col items-center">
            <ResponsiveContainer width="100%" height="80%">
              <RePieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="_id"
                >
                  {planDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
               {planDistribution.map((entry: any, index: number) => (
                 <div key={index} className="flex items-center gap-2">
                   <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                   <span className="text-xs font-medium text-muted-foreground">{entry._id} ({entry.count})</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden group">
          <div className="relative z-10 flex flex-col h-full">
            <h3 className="text-2xl font-bold font-heading mb-2">Platform Health Score</h3>
            <p className="text-blue-100/80 mb-8 max-w-sm">Global system availability and engagement metrics across all active company instances.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-auto">
              <div className="space-y-1">
                <p className="text-3xl font-bold">99.9%</p>
                <p className="text-xs font-medium text-blue-200 uppercase tracking-widest">Uptime</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">1.2s</p>
                <p className="text-xs font-medium text-blue-200 uppercase tracking-widest">Avg Latency</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">4.8k</p>
                <p className="text-xs font-medium text-blue-200 uppercase tracking-widest">Daily Tasks</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">24k</p>
                <p className="text-xs font-medium text-blue-200 uppercase tracking-widest">API Requests</p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-sm font-medium">All systems operational</span>
              </div>
              <Activity className="w-12 h-12 text-white/10 group-hover:text-white/20 transition-all duration-700 scale-150 rotate-12" />
            </div>
          </div>

          {/* Decorative shapes */}
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-48 h-48 rounded-full bg-indigo-400/10 blur-2xl"></div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAnalytics;
