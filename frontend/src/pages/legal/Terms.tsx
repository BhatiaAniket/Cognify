import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { motion } from "framer-motion";
import { Gavel, ChevronRight, FileText, Scale, UserCheck, AlertTriangle } from "lucide-react";

const Terms = () => {
  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms", content: "By accessing or using the CognifyPM platform, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services." },
    { id: "service", title: "2. Description of Service", content: "CognifyPM provides a SaaS platform for multi-company project management, including task tracking, video meetings, and AI-powered reporting." },
    { id: "accounts", title: "3. User Accounts", content: "You must provide accurate information when creating an account. You are responsible for maintaining the security of your account and password." },
    { id: "payments", title: "4. Subscriptions & Payments", content: "Paid plans are billed in advance on a monthly or yearly basis. Free trials are subject to the specific terms provided at the time of signup." },
    { id: "conduct", title: "5. Prohibited Conduct", content: "You agree not to misuse the service, including but not limited to hacking, reverse engineering, or using the service for any illegal activities." },
    { id: "ip", title: "6. Intellectual Property", content: "All content, features, and functionality are the exclusive property of CognifyPM and its licensors. You retain ownership of the data you upload." },
    { id: "termination", title: "7. Termination", content: "We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including breach of these Terms." },
    { id: "liability", title: "8. Limitation of Liability", content: "To the maximum extent permitted by law, CognifyPM shall not be liable for any indirect, incidental, or consequential damages." }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6 border-b border-border bg-card/10">
        <div className="container mx-auto max-w-4xl text-center">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-6 text-xs font-medium text-accent uppercase tracking-widest">
             <Gavel size={14} />
             Legal Agreement
           </div>
           <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight mb-8">Terms of Service</h1>
           <p className="text-xl text-muted-foreground leading-relaxed mb-4">
             Please read these terms carefully before using our platform. By using CognifyPM, you agree to these rules.
           </p>
           <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span>Last Updated: April 19, 2026</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>Version 2.0</span>
           </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
           <div className="grid lg:grid-cols-4 gap-12">
              {/* Sidebar TOC */}
              <aside className="hidden lg:block lg:col-span-1">
                 <div className="sticky top-32">
                    <h4 className="font-heading font-bold text-xs uppercase tracking-widest text-muted-foreground mb-6">Agreement Sections</h4>
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
                 </div>
              </aside>

              {/* Main Terms Content */}
              <div className="lg:col-span-3">
                 <div className="prose prose-lg dark:prose-invert max-w-none">
                    {sections.map((section) => (
                      <motion.div 
                        key={section.id} 
                        id={section.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="mb-16 scroll-mt-32"
                      >
                        <h2 className="font-heading text-3xl font-bold mb-6 flex items-center gap-4 text-foreground">
                          {section.title}
                          <div className="h-px bg-border flex-grow" />
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                      </motion.div>
                    ))}
                 </div>

                 {/* Important Notice */}
                 <div className="mt-24 p-8 rounded-3xl bg-accent/5 border border-accent/20 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                       <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                          <AlertTriangle size={32} />
                       </div>
                       <div>
                          <h3 className="font-heading text-xl font-bold mb-2">Legal Disclaimer</h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            These terms constitute a legally binding agreement. We recommend that you consult with your local legal counsel if you have specific questions about compliance in your jurisdiction.
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
