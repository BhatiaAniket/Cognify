import PageHero from "@/components/common/PageHero";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { motion } from "framer-motion";
import { 
  Search, 
  Rocket, 
  Users, 
  Settings, 
  Code, 
  Shield, 
  HelpCircle,
  FileText,
  ChevronRight,
  Book
} from "lucide-react";
import { Input } from "@/components/ui/input";

const Documentation = () => {
  const categories = [
    {
      icon: Rocket,
      title: "Getting Started",
      description: "Quick start guides and essential setup instructions for new users.",
      links: ["Platform Overview", "Creating your first project", "Inviting team members", "Setting up notifications"]
    },
    {
      icon: Users,
      title: "User Guides",
      description: "In-depth guides for each specific role within the CognifyPM ecosystem.",
      links: ["Company Admin Guide", "Manager Workflow", "Employee Dashboard", "Client Portal Access"]
    },
    {
      icon: Settings,
      title: "Core Features",
      description: "Detailed documentation on how to use every major feature of the platform.",
      links: ["Task Management", "Video Meetings", "Performance Reports", "File Collaboration"]
    },
    {
      icon: Code,
      title: "Integrations & API",
      description: "Guides on connecting favorite tools and using our REST API.",
      links: ["Slack Integration", "Google Drive Setup", "API Authentication", "Webhook Events"]
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Information on how we keep your data secure and respect your privacy.",
      links: ["Data Security", "Organization Isolation", "Privacy FAQ", "GDPR Compliance"]
    },
    {
      icon: HelpCircle,
      title: "Support",
      description: "Need help? Find answers to common questions or contact our support team.",
      links: ["Troubleshooting", "Error Codes", "Billing FAQ", "Contact Support"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="relative pt-32 pb-20 px-6 overflow-hidden text-center" style={{ background: "var(--hero-gradient)" }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`, backgroundSize: "80px 80px" }} />
        
        <div className="container mx-auto max-w-4xl relative z-10">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-6 text-xs font-medium text-muted-foreground uppercase tracking-widest">
             <Book size={14} className="text-accent" />
             Knowledge Base
           </div>
           <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-10">Documentation</h1>
           
           <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input placeholder="Search documentation, guides, and tutorials..." className="pl-16 py-8 rounded-full bg-background/50 border-border text-lg shadow-2xl focus:ring-accent" />
           </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 rounded-2xl border border-border bg-card/30 flex flex-col group hover:border-accent transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                  <cat.icon size={24} />
                </div>
                <h3 className="font-heading text-2xl font-bold mb-4">{cat.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-grow">{cat.description}</p>
                
                <ul className="space-y-3">
                  {cat.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="flex items-center gap-2 text-sm font-medium hover:text-accent group/link">
                        <ChevronRight size={14} className="text-muted-foreground group-hover/link:translate-x-1 transition-transform" />
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-24 px-6 border-t border-border bg-card/10">
         <div className="container mx-auto max-w-4xl">
            <h2 className="font-heading text-3xl font-bold mb-12 text-center">Popular Topics</h2>
            <div className="grid md:grid-cols-2 gap-6">
               {[
                 "How to setup custom roles?",
                 "Connecting Slack to your workspace",
                 "Exporting project reports as PDF",
                 "Troubleshooting video meeting issues",
                 "Managing company subscriptions",
                 "Understanding performance scores"
               ].map((topic) => (
                 <a key={topic} href="#" className="flex items-center justify-between p-6 rounded-xl border border-border bg-background hover:bg-card hover:border-accent transition-all group">
                    <span className="font-medium">{topic}</span>
                    <FileText size={18} className="text-muted-foreground group-hover:text-accent" />
                 </a>
               ))}
            </div>
         </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-6 text-center">
         <div className="container mx-auto max-w-4xl">
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">Still need help?</h2>
            <p className="text-muted-foreground text-lg mb-10">Our support team is available 24/7 to answer any specific questions.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <a href="/support" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-foreground text-background font-bold hover:scale-105 transition-transform">
                 Visit Support Center
               </a>
               <a href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-border font-bold hover:bg-secondary transition-colors">
                 Contact Us
               </a>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
};

export default Documentation;
