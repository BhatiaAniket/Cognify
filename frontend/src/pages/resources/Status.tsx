import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Clock, BarChart, Bell, RefreshCw, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

const Status = () => {
  const systems = [
    { name: "API Services", status: "Operational", color: "text-green-500" },
    { name: "Web Application", status: "Operational", color: "text-green-500" },
    { name: "Video Meetings (WebRTC)", status: "Operational", color: "text-green-500" },
    { name: "File Storage & CDN", status: "Operational", color: "text-green-500" },
    { name: "Database Clusters", status: "Operational", color: "text-green-500" },
    { name: "Authentication Service", status: "Operational", color: "text-green-500" },
    { name: "Email & Notifications", status: "Operational", color: "text-green-500" },
    { name: "AI Report Generation", status: "Operational", color: "text-green-500" }
  ];

  const incidents = [
    { title: "Slow API Response Times", date: "April 18, 2026", duration: "2 hours", status: "Resolved", detail: "We experienced increased latency due to a DDoS attempt. Mitigation systems successfully blocked the traffic." },
    { title: "Scheduled Database Maintenance", date: "April 10, 2026", duration: "1 hour", status: "Completed", detail: "Regular index optimization and schema updates." }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Main Status Indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-10 rounded-3xl bg-green-500/10 border border-green-500/20 text-center mb-16 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 text-green-500 mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h1 className="font-heading text-4xl font-bold mb-4">All Systems Operational</h1>
            <p className="text-green-500/80 font-medium">Last updated: {new Date().toLocaleString()} (GMT+5:30)</p>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/5 blur-[80px] rounded-full pointer-events-none" />
          </motion.div>

          {/* System list */}
          <div className="mb-24">
             <div className="flex items-center justify-between mb-8">
                <h2 className="font-heading text-2xl font-bold">System Status</h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border px-3 py-1 rounded-full">
                   <RefreshCw size={12} className="animate-spin-slow" /> Auto-refreshing
                </div>
             </div>
             
             <div className="grid gap-4">
                {systems.map((system, index) => (
                  <motion.div
                    key={system.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-6 rounded-2xl bg-card/30 border border-border hover:bg-card/50 transition-all"
                  >
                    <span className="font-medium">{system.name}</span>
                    <div className="flex items-center gap-2">
                       <span className={`text-sm font-bold uppercase tracking-widest ${system.color}`}>{system.status}</span>
                       <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ color: "hsl(155 50% 45%)" }} />
                    </div>
                  </motion.div>
                ))}
             </div>
          </div>

          {/* Uptime Chart Placeholders */}
          <div className="grid md:grid-cols-2 gap-8 mb-24">
             <div className="p-8 rounded-3xl border border-border bg-card/30">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="font-heading font-bold flex items-center gap-2">
                      <BarChart size={18} className="text-accent" />
                      Uptime (30 Days)
                   </h3>
                   <span className="text-2xl font-bold font-heading">99.98%</span>
                </div>
                {/* Visual bars */}
                <div className="flex items-end gap-1 h-20">
                   {[...Array(30)].map((_, i) => (
                     <div 
                        key={i} 
                        className={`flex-grow h-full bg-green-500/40 rounded-sm hover:bg-green-500 transition-all ${i === 12 ? 'h-[60%] opacity-50' : 'h-full'}`}
                        title={i === 12 ? "99.2% Uptime" : "100% Uptime"}
                     />
                   ))}
                </div>
             </div>
             
             <div className="p-8 rounded-3xl border border-border bg-card/30">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="font-heading font-bold flex items-center gap-2">
                      <Activity size={18} className="text-accent" />
                      Global Latency
                   </h3>
                   <span className="text-2xl font-bold font-heading text-accent">42ms</span>
                </div>
                {/* Visual line */}
                <div className="h-20 flex items-center justify-center p-4">
                   <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <polyline
                        fill="none"
                        stroke="hsl(var(--accent))"
                        strokeWidth="2"
                        points="0,30 10,25 20,32 30,28 40,25 50,30 60,35 70,28 80,30 90,25 100,28"
                        className="animate-fade-in"
                      />
                   </svg>
                </div>
             </div>
          </div>

          {/* Incident History */}
          <div className="mb-24">
             <h2 className="font-heading text-2xl font-bold mb-8 flex items-center gap-3">
                <Clock size={24} className="text-muted-foreground" />
                Incident History
             </h2>
             <div className="space-y-8 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-px before:bg-border">
                {incidents.map((incident, index) => (
                  <div key={index} className="relative pl-16">
                     <div className="absolute left-4 top-1 w-4 h-4 rounded-full bg-background border-2 border-accent z-10" />
                     <div className="p-8 rounded-2xl bg-card/30 border border-border">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                           <h3 className="font-heading text-xl font-bold">{incident.title}</h3>
                           <div className="flex items-center gap-3 text-sm">
                              <span className="text-muted-foreground font-mono">{incident.date}</span>
                              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent font-bold text-[10px] uppercase tracking-widest">{incident.status}</span>
                           </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed italic">{incident.detail}</p>
                        <div className="mt-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Duration: {incident.duration}</div>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Subscription */}
          <div className="p-12 rounded-3xl bg-foreground text-background text-center relative overflow-hidden">
             <div className="relative z-10">
                <h2 className="font-heading text-3xl font-bold mb-6">Stay informed</h2>
                <p className="opacity-80 mb-8 max-w-xl mx-auto">Subscribe to get real-time email notifications whenever CognifyPM creates, updates or resolves an incident.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                   <input 
                     type="email" 
                     placeholder="your@email.com" 
                     className="w-full rounded-full py-4 px-6 bg-background/10 border border-background/20 text-background placeholder:text-background/50 focus:outline-none focus:ring-2 focus:ring-accent"
                   />
                   <Button className="rounded-full px-8 py-4 bg-background text-foreground font-bold hover:bg-accent hover:text-accent-foreground shrink-0 border-none">
                      Subscribe
                   </Button>
                </div>
             </div>
             <Bell size={120} className="absolute bottom-0 right-10 -mb-10 opacity-5 -rotate-12" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Status;
