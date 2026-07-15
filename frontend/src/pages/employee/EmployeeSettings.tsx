import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Lock, Bell, Eye, Monitor, Globe, Shield, LogOut } from 'lucide-react';
import { showToast } from '../../components/Toast';

export default function EmployeeSettings() {
  const [activeTab, setActiveTab] = useState('security');
  
  const handleUpdate = () => {
    showToast('Settings updated successfully', 'success');
  };

  const tabs = [
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Eye },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-heading text-foreground">Settings</h1>
        <p className="text-muted-foreground">Customize your account and experience</p>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[500px]">
        {/* Navigation */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border p-4 bg-muted/20">
           <div className="space-y-1">
              {tabs.map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-foreground text-background shadow-lg' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                >
                  <tab.icon className="h-4 w-4" /> {tab.label}
                </button>
              ))}
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 bg-card">
           {activeTab === 'security' && (
             <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div>
                   <h3 className="text-xl font-bold font-heading mb-2">Security Settings</h3>
                   <p className="text-sm text-muted-foreground">Manage your password and authentication</p>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-foreground" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-foreground" />
                   </div>
                   <button onClick={handleUpdate} className="px-6 py-2.5 bg-foreground text-background rounded-xl text-sm font-bold hover:scale-[1.02] transition-transform">Update Password</button>
                </div>

                <div className="pt-8 border-t border-border">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Monitor className="h-5 w-5" /></div>
                         <div>
                            <p className="text-sm font-bold">Two-Factor Authentication</p>
                            <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                         </div>
                      </div>
                      <div className="w-12 h-6 bg-muted rounded-full relative p-1 cursor-pointer">
                         <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                   </div>
                </div>
             </motion.div>
           )}

           {activeTab === 'notifications' && (
             <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div>
                   <h3 className="text-xl font-bold font-heading mb-2">Notification Preferences</h3>
                   <p className="text-sm text-muted-foreground">How you want to be notified</p>
                </div>

                <div className="space-y-4">
                   {[
                     { label: 'Email Notifications', desc: 'Receive updates via email' },
                     { label: 'Meeting Reminders', desc: 'Alerts before meetings start' },
                     { label: 'Task Assignments', desc: 'When you are added to a task' },
                     { label: 'Chat Messages', desc: 'Real-time message alerts' },
                   ].map((item) => (
                     <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl border border-border hover:border-foreground/10 transition-colors">
                        <div>
                           <p className="text-sm font-bold">{item.label}</p>
                           <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <div className="w-12 h-6 bg-foreground rounded-full relative p-1 cursor-pointer">
                           <div className="w-4 h-4 bg-background rounded-full shadow-sm ml-auto" />
                        </div>
                     </div>
                   ))}
                </div>
             </motion.div>
           )}

           {activeTab === 'appearance' && (
             <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div>
                   <h3 className="text-xl font-bold font-heading mb-2">Appearance Settings</h3>
                   <p className="text-sm text-muted-foreground">Customize how CognifyPM looks</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-4 rounded-2xl border-2 border-foreground bg-card cursor-pointer">
                      <div className="aspect-video bg-muted rounded-lg mb-3" />
                      <p className="text-sm font-bold text-center">System Default</p>
                   </div>
                   <div className="p-4 rounded-2xl border border-border bg-zinc-900 cursor-pointer hover:border-foreground/20">
                      <div className="aspect-video bg-black rounded-lg mb-3" />
                      <p className="text-sm font-bold text-center text-white">Dark Mode</p>
                   </div>
                </div>
             </motion.div>
           )}
        </div>
      </div>
    </div>
  );
}
