import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, LogOut, User as UserIcon, ChevronDown, Check, 
  Clock, Calendar, FileText, Layout, Info, Loader2, Sparkles,
  MessageSquare, AlertTriangle, ShieldCheck
} from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { companyAPI } from '../../api/company';
import { employeeAPI } from '../../api/employee';

const DashboardNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isConnected, socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const isEmployee = user?.role === 'employee';

  const fetchUnread = async () => {
    try {
      const res = isEmployee 
        ? await employeeAPI.getUnreadCount()
        : await companyAPI.getUnreadCount();
      
      setUnreadCount(res.data.data.count);
    } catch (e) { /* ignore */ }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user?.role]);

  useEffect(() => {
    if (!socket) return;
    const handleNewNotif = () => fetchUnread();
    socket.on('notification', handleNewNotif);
    socket.on('notification:broadcast', handleNewNotif);
    return () => {
      socket.off('notification', handleNewNotif);
      socket.off('notification:broadcast', handleNewNotif);
    };
  }, [socket]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotifClick = async () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) {
      setNotifLoading(true);
      try {
        const res = isEmployee
          ? await employeeAPI.getNotifications()
          : await companyAPI.listNotifications({ limit: 5 });
        
        // Employee API returns { notifications: [...] } inside data.data
        // Company API returns { notifications: [...] } inside data.data
        const notifs = res.data.data.notifications || res.data.data || [];
        setNotifications(Array.isArray(notifs) ? notifs.slice(0, 5) : []);
      } catch (e) { 
        setNotifications([]);
      } finally {
        setNotifLoading(false);
      }
    }
  };

  const markAsRead = async (id: string, link?: string) => {
    try {
      if (isEmployee) {
        await employeeAPI.markNotificationRead(id);
      } else {
        await companyAPI.markAsRead(id);
      }
      fetchUnread();
      if (link) navigate(link);
      setNotifOpen(false);
    } catch (e) { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      if (isEmployee) {
        await employeeAPI.markAllNotificationsRead();
      } else {
        await companyAPI.markAllAsRead();
      }
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) { /* ignore */ }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${diffDay}d ago`;
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
      case 'task_updated':
        return <Layout className="w-4 h-4 text-blue-500" />;
      case 'meeting_starting':
      case 'meeting_request':
      case 'meeting_request_accepted':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'performance_report':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'new_message':
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'deadline_approaching':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'announcement':
        return <ShieldCheck className="w-4 h-4 text-primary" />;
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const initials = user?.fullName
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'CA';

  const getNotifRoute = () => {
    if (user?.role === 'manager') return '/manager/notifications';
    if (user?.role === 'client') return '/client/notifications';
    if (user?.role === 'employee') return '/employee/notifications';
    return '/company/notifications';
  };

  const getProfileRoute = () => {
    if (user?.role === 'manager') return '/manager/profile';
    if (user?.role === 'client') return '/client/settings';
    if (user?.role === 'employee') return '/employee/profile';
    return '/company/settings';
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
          <span className="text-sm font-medium text-muted-foreground hidden md:inline">
            {user?.companyName || 'CognifyPM'}
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleNotifClick}
            className="relative p-2.5 rounded-xl hover:bg-muted/60 transition-colors group"
          >
            <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-[9px] font-black text-white rounded-full flex items-center justify-center border-2 border-card">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 top-full mt-2 w-80 rounded-[24px] border border-border bg-card shadow-2xl overflow-hidden z-50 origin-top-right"
              >
                <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
                  <h3 className="text-sm font-bold">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[10px] font-black uppercase tracking-tight text-primary hover:opacity-80 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                  {notifLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Fetching...</span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-12 px-6 text-center space-y-2">
                       <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                         <Bell className="w-5 h-5 text-muted-foreground/50" />
                       </div>
                       <p className="text-sm font-bold">All caught up!</p>
                       <p className="text-xs text-muted-foreground">No new notifications at the moment.</p>
                    </div>
                  ) : (
                    notifications.map((n: any) => (
                      <div
                        key={n._id}
                        onClick={() => markAsRead(n._id, n.link)}
                        className={`px-4 py-4 border-b border-border last:border-0 hover:bg-muted/40 transition-all cursor-pointer group relative ${!n.isRead ? 'bg-primary/5' : ''}`}
                      >
                        {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-card shadow-sm border border-border' : 'bg-muted/50'}`}>
                            {getNotifIcon(n.type)}
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <p className={`text-sm leading-tight transition-colors ${!n.isRead ? 'font-bold' : 'text-muted-foreground font-medium'}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{n.message}</p>
                            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(n.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <button
                  onClick={() => { navigate(getNotifRoute()); setNotifOpen(false); }}
                  className="w-full py-3 bg-muted/30 hover:bg-muted/50 text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-all border-t border-border"
                >
                  View full history
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-muted/60 transition-all active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-foreground text-background flex items-center justify-center text-xs font-black shadow-lg">
              {initials}
            </div>
            <span className="text-sm font-bold hidden md:inline">{user?.fullName?.split(' ')[0]}</span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground hidden md:inline transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-48 rounded-[20px] border border-border bg-card shadow-2xl overflow-hidden z-50 origin-top-right"
              >
                <div className="px-4 py-3 bg-muted/20 border-b border-border">
                   <p className="text-xs font-black uppercase tracking-widest text-muted-foreground truncate">{user?.fullName}</p>
                   <p className="text-[10px] font-medium text-muted-foreground/60 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => { navigate(getProfileRoute()); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-muted/40 transition-colors flex items-center gap-3"
                >
                  <UserIcon className="w-4 h-4" /> Profile
                </button>
                <div className="h-px bg-border" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-red-500/10 transition-colors flex items-center gap-3 text-red-500"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
