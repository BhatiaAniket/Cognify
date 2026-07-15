import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, Calendar, MessageSquare, Info, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { employeeAPI } from '../../api/employee';
import { showToast } from '../../components/Toast';

export default function EmployeeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { socket } = useSocket();

  const fetchNotifications = async () => {
    try {
      const res = await employeeAPI.getNotifications();
      console.log('--- NOTIFICATIONS API RESPONSE ---', res.data);
      if (res.data && res.data.data) {
        if (Array.isArray(res.data.data.notifications)) {
           console.log('Setting via res.data.data.notifications', res.data.data.notifications);
           setNotifications(res.data.data.notifications);
        } else if (Array.isArray(res.data.data)) {
           console.log('Setting via res.data.data', res.data.data);
           setNotifications(res.data.data);
        } else {
           console.log('Setting empty array fallback. Data:', res.data.data);
           setNotifications([]);
        }
      } else {
        console.log('Setting empty because res.data or res.data.data is undefined', res);
        setNotifications([]);
      }
    } catch (err) {
      console.error('FETCH NOTIFICATIONS ERROR', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (socket) {
      socket.on('notification:new', (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
        showToast(newNotif.title, 'info');
      });
    }
    return () => { socket?.off('notification:new'); };
  }, [socket]);

  const markAsRead = async (id: string) => {
    try {
      await employeeAPI.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await employeeAPI.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showToast('All marked as read');
    } catch (err) { /* ignore */ }
  };

  const deleteNotif = async (id: string) => {
    try {
      await employeeAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) { /* ignore */ }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your latest activities</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={markAllRead}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-foreground text-background hover:scale-[1.02] transition-transform"
          >
            Mark all as read
          </button>
        </div>
      </div>

      <div className="flex bg-card/60 backdrop-blur-md border border-border rounded-xl p-1 w-fit">
        <button onClick={() => setFilter('all')} className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${filter === 'all' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>All</button>
        <button onClick={() => setFilter('unread')} className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${filter === 'unread' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>Unread</button>
      </div>

      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-24 bg-card/50 animate-pulse rounded-2xl border border-border/50" />)
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No notifications found</p>
          </div>
        ) : (
          filtered.map((n) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={n._id}
              className={`group flex items-start gap-4 p-5 rounded-2xl border transition-all ${n.isRead ? 'bg-card/40 border-border/50' : 'bg-card border-foreground/10 shadow-sm ring-1 ring-foreground/5'}`}
            >
              <div className={`mt-1 p-2.5 rounded-xl ${
                n.type?.startsWith('meeting') ? 'bg-blue-500/10 text-blue-500' : 
                n.type === 'message' ? 'bg-green-500/10 text-green-500' : 
                'bg-orange-500/10 text-orange-500'
              }`}>
                {n.type?.startsWith('meeting') ? <Calendar className="h-5 w-5" /> : 
                 n.type === 'message' ? <MessageSquare className="h-5 w-5" /> : 
                 <Info className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-bold text-sm ${n.isRead ? 'text-foreground/70' : 'text-foreground'}`}>{n.title}</h3>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter opacity-70">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">{n.message}</p>
                
                <div className="flex items-center gap-3">
                  {!n.isRead && (
                    <button onClick={() => markAsRead(n._id)} className="text-[10px] font-bold uppercase tracking-widest text-foreground hover:underline">Mark read</button>
                  )}
                  <button onClick={() => deleteNotif(n._id)} className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:underline">Delete</button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
