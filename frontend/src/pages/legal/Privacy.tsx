import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { motion } from "framer-motion";
import { FileText, ChevronRight, Shield, Lock, Eye, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  const sections = [
    { id: "collection", title: "1. Information We Collect", content: "We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This includes personal information (name, email, company) and usage data (login times, features used)." },
    { id: "usage", title: "2. How We Use Information", content: "We use the information to provide, maintain, and improve our services, including generating AI reports, facilitating video meetings, and providing customer support." },
    { id: "sharing", title: "3. Data Sharing", content: "We do NOT sell your personal data. We sharing information with third-party service providers (like Stripe for payments or AWS for hosting) only as necessary to provide our services." },
    { id: "security", title: "4. Data Security", content: "We implement enterprise-grade security measures, including TLS 1.3 encryption for data in transit and AES-256 for data at rest. Our multi-tenant architecture ensures complete data isolation." },
    { id: "cookies", title: "5. Cookies", content: "We use essential cookies for authentication and session management. You can control cookie settings through your browser, but disabling them may affect functionality." },
    { id: "rights", title: "6. Your Rights (GDPR)", content: "Under GDPR, you have the right to access, rectify, or erase your personal data. You also have the right to data portability and the right to object to certain processing." },
    { id: "retention", title: "7. Data Retention", content: "We retain account data as long as your account is active. Upon deletion, data is removed from active systems within 30 days and from backups within 90 days." },
    { id: "contact", title: "8. Contact Us", content: "If you have any questions about this Privacy Policy, please contact our privacy officer at privacy@cognifypm.com." }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6 border-b border-border bg-card/10">
        <div className="container mx-auto max-w-4xl text-center">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-6 text-xs font-medium text-accent uppercase tracking-widest">
             <Shield size={14} />
             Legal & Privacy
           </div>
           <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight mb-8">Privacy Policy</h1>
           <p className="text-xl text-muted-foreground leading-relaxed mb-4">
             Your privacy is important to us. This policy explains how we collect, use, and protect your data.
           </p>
           <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span>Last Updated: April 19, 2026</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>Version 1.2</span>
           </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
           <div className="grid lg:grid-cols-4 gap-12">
              {/* Sidebar TOC */}
              <aside className="hidden lg:block lg:col-span-1">
                 <div className="sticky top-32">
                    <h4 className="font-heading font-bold text-xs uppercase tracking-widest text-muted-foreground mb-6">Table of Contents</h4>
                    <nav className="space-y-4">
                       {sections.map((section) => (
                         <a 
                           key={section.id} 
                           href={`#${section.id}`}
                           className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-all group"
                         >
                           <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                           {section.title}
                         </a>
                       ))}
                    </nav>
                    
                    <div className="mt-12 pt-12 border-t border-border space-y-4">
                       <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors">
                          <Download size={16} /> Download PDF
                       </button>
                       <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors">
                          <Printer size={16} /> Print Version
                       </button>
                    </div>
                 </div>
              </aside>

              {/* Main Policy Content */}
              <div className="lg:col-span-3">
                 <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="text-lg text-muted-foreground leading-relaxed mb-16">
                      This Privacy Policy describes our practices regarding the collection, use, and disclosure of your information 
                      when you use the CognifyPM application and Website. By using the Service, you agree to the collection and use 
                      of information in accordance with this Privacy Policy.
                    </p>

                    {sections.map((section) => (
                      <motion.div 
                        key={section.id} 
                        id={section.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="mb-16 scroll-mt-32"
                      >
                        <h2 className="font-heading text-3xl font-bold mb-6 flex items-center gap-4">
                          {section.title}
                          <div className="h-px bg-border flex-grow" />
                        </h2>
                        <div className="text-muted-foreground leading-relaxed space-y-4">
                           <p>{section.content}</p>
                           {section.id === "security" && (
                             <ul className="list-disc pl-6 space-y-2 mt-4 text-sm marker:text-accent">
                                <li>End-to-end encryption for video meetings.</li>
                                <li>Multi-factor authentication support.</li>
                                <li>Regular security training for all staff.</li>
                                <li>Automated threat detection and logging.</li>
                             </ul>
                           )}
                        </div>
                      </motion.div>
                    ))}
                 </div>

                 {/* Disclaimer Card */}
                 <div className="mt-24 p-8 rounded-3xl bg-card/30 border border-border relative overflow-hidden group">
                    <div className="relative z-10">
                       <h3 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
                          <Eye className="text-accent" />
                          Transparency Report
                       </h3>
                       <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                         We publish an annual transparency report detailing any government requests for data. 
                         In 2025, CognifyPM received zero requests for user data.
                       </p>
                       <Button variant="link" className="p-0 text-accent font-bold h-auto uppercase tracking-widest text-xs">
                          View Latest Report →
                       </Button>
                    </div>
                    <Lock size={120} className="absolute bottom-0 right-10 -mb-10 opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500" />
                 </div>
              </div>
           </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;
