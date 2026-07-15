import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Mail, 
  Calendar,
  AlertCircle,
  Video,
  FileText
} from 'lucide-react';
import { clientAPI } from '../../api/client';
import { showToast } from '../../components/Toast';

const ClientNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await clientAPI.getNotifications();
      setNotifications(res.data.data || []);
    } catch (err) {
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await clientAPI.markNotificationRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      showToast('Failed to mark as read', 'error');
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'meeting_scheduled': return <Video className="w-4 h-4 text-blue-500" />;
      case 'report_shared': return <FileText className="w-4 h-4 text-purple-500" />;
      case 'demand_updated': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default: return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated with your project activities.</p>
        </div>
        <button 
          onClick={() => setNotifications(notifications.map(n => ({...n, isRead: true})))}
          className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          Mark all as read
        </button>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-border">
            {notifications.map((n, i) => (
              <motion.div 
                key={n._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-6 flex items-start gap-4 hover:bg-muted/30 transition-all cursor-pointer ${!n.isRead ? 'bg-blue-50/10' : ''}`}
                onClick={() => !n.isRead && markAsRead(n._id)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-blue-100' : 'bg-muted'}`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-sm font-bold truncate ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {n.title}
                    </h3>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {n.message}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0 animate-pulse" />
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <Bell className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground font-medium">No notifications yet.</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 p-4 bg-muted/20 border border-dashed border-border rounded-2xl">
        <Mail className="w-4 h-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground font-medium">
          You are also receiving email alerts for critical updates. 
          <button className="text-foreground ml-1 underline decoration-dotted">Emails Settings</button>
        </p>
      </div>
    </div>
  );
};

export default ClientNotifications;
