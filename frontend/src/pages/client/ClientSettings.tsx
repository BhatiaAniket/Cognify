import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  LogOut, 
  Camera,
  ChevronRight,
  Loader2,
  Mail,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/Toast';

const ClientSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [loading, setLoading] = useState(false);

  // Profile Form
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    contactNumber: user?.contactNumber || ''
  });

  // Security Form
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Profile updated successfully', 'success');
    }, 1000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return showToast('Passwords do not match', 'error');
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Password updated successfully', 'success');
      setPasswords({ current: '', new: '', confirm: '' });
    }, 1000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'security', label: 'Security & Password', icon: Lock },
    { id: 'notifications', label: 'Notification Preferences', icon: Bell },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <h1 className="text-3xl font-bold font-heading mb-8">Settings & Account</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-72 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-foreground text-background shadow-md' : 'text-muted-foreground hover:bg-muted/60'}`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-border">
             <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
             >
                <LogOut className="w-5 h-5" />
                Sign Out
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-3xl p-8 shadow-sm"
          >
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                   <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-foreground text-background flex items-center justify-center text-2xl font-bold border-4 border-background shadow-lg overflow-hidden">
                         {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user?.fullName?.charAt(0)}
                      </div>
                      <button className="absolute bottom-0 right-0 p-2 bg-background border border-border rounded-full shadow-md hover:bg-muted transition-colors">
                         <Camera className="w-4 h-4" />
                      </button>
                   </div>
                   <div className="text-center sm:text-left">
                      <h2 className="text-xl font-bold">{user?.fullName}</h2>
                      <p className="text-sm text-muted-foreground mt-1">Client Profile • {user?.companyName}</p>
                   </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Full Name</label>
                         <div className="relative">
                            <input 
                               type="text" 
                               value={profileData.fullName}
                               onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                               className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border focus:border-foreground transition-all outline-none"
                            />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email Address</label>
                         <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input 
                               type="email" 
                               value={profileData.email}
                               disabled
                               className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/20 border border-border text-muted-foreground cursor-not-allowed"
                            />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Phone Number</label>
                         <div className="relative">
                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input 
                               type="tel" 
                               value={profileData.contactNumber}
                               onChange={(e) => setProfileData({...profileData, contactNumber: e.target.value})}
                               className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/40 border border-border focus:border-foreground transition-all outline-none"
                            />
                         </div>
                      </div>
                   </div>
                   <button 
                      type="submit" 
                      disabled={loading}
                      className="px-8 py-3 bg-foreground text-background rounded-full font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                   >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />} Save Changes
                   </button>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Shield className="w-6 h-6" />
                   </div>
                   <div>
                      <h2 className="text-xl font-bold">Account Security</h2>
                      <p className="text-sm text-muted-foreground mt-1">Update your password to keep your account safe.</p>
                   </div>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-md">
                   <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Password</label>
                         <input 
                            type="password" 
                            value={passwords.current}
                            onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border focus:border-foreground transition-all outline-none"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">New Password</label>
                         <input 
                            type="password" 
                            value={passwords.new}
                            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border focus:border-foreground transition-all outline-none"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Confirm New Password</label>
                         <input 
                            type="password" 
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border focus:border-foreground transition-all outline-none"
                         />
                      </div>
                   </div>
                   <button 
                      type="submit" 
                      disabled={loading}
                      className="px-8 py-3 bg-foreground text-background rounded-full font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                   >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />} Update Password
                   </button>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
               <div className="space-y-8">
                  <div>
                     <h2 className="text-xl font-bold">Notification Preferences</h2>
                     <p className="text-sm text-muted-foreground mt-1">Choose how you want to be notified about project updates.</p>
                  </div>
                  
                  <div className="space-y-4">
                     {[
                        { title: 'Project Milestones', desc: 'Get notified when a new phase is completed.' },
                        { title: 'Meeting Reminders', desc: 'Receive alerts 30 minutes before every scheduled meeting.' },
                        { title: 'Daily Reports', desc: 'Notifications when a new daily report is shared with you.' },
                        { title: 'Security Alerts', desc: 'Immediate alerts about login attempts and password changes.' }
                     ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-2xl group hover:border-foreground/10 transition-all">
                           <div>
                              <p className="text-sm font-bold group-hover:text-foreground transition-colors">{item.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                           </div>
                           <div className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked className="sr-only peer" />
                              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ClientSettings;
