import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, Mail, Phone, MapPin, Briefcase, Calendar, Shield, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/Toast';

export default function EmployeeProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    position: user?.role === 'employee' ? 'Software Engineer' : user?.role,
    department: user?.department || 'Engineering'
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        position: user.position || (user.role === 'employee' ? 'Software Engineer' : user.role || ''),
        department: user.department || 'Engineering'
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      showToast('Profile updated successfully', 'success');
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-heading text-foreground">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Quick View */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/20 to-primary/5" />
            <div className="relative z-10">
              <div className="relative inline-block mb-4 group">
                <div className="h-32 w-32 rounded-3xl bg-zinc-800 flex items-center justify-center text-5xl font-bold border-4 border-card shadow-xl overflow-hidden">
                  {user?.avatar ? <img src={user.avatar} className="h-full w-full object-cover" /> : user?.fullName?.charAt(0)}
                </div>
                <button className="absolute -bottom-2 -right-2 p-2.5 bg-foreground text-background rounded-xl shadow-lg hover:scale-110 transition-transform">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h2 className="text-2xl font-bold font-heading mt-2">{user?.fullName}</h2>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">{user?.role?.replace('_', ' ')}</p>
              
              <div className="mt-8 pt-8 border-t border-border flex flex-col gap-4 text-left">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" /> {user?.email}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" /> Software Engineer
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" /> Joined Oct 2023
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
             <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-2">Account Status</h3>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Shield className="h-4 w-4 text-green-500" />
                   <span className="text-sm font-medium">Verified Account</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-green-500" />
             </div>
          </div>
        </div>

        {/* Right: Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold font-heading">Personal Information</h2>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-foreground text-background rounded-xl text-sm font-bold hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : <><Save className="h-4 w-4" /> Save Changes</>}
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                   <input 
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:outline-none focus:border-foreground"
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                   <input 
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:outline-none focus:border-foreground"
                    value={formData.email}
                    readOnly
                   />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                    <input 
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-foreground"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Position</label>
                    <input 
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-foreground"
                      value={formData.position}
                      onChange={e => setFormData({...formData, position: e.target.value})}
                    />
                </div>
                <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Short Bio</label>
                    <textarea 
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-foreground h-32 resize-none"
                      placeholder="Tell us about yourself..."
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                    />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
