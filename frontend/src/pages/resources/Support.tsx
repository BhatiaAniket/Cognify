import PageHero from "@/components/common/PageHero";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { motion } from "framer-motion";
import { 
  MessageSquare, 
  HelpCircle, 
  BookOpen, 
  Mail, 
  CheckCircle2, 
  Search,
  ArrowRight,
  ShieldQuestion,
  LifeBuoy
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ContactForm from "@/components/common/ContactForm";

const Support = () => {
  const quickLinks = [
    {
      icon: BookOpen,
      title: "Knowledge Base",
      desc: "Detailed guides and documentation.",
      link: "/documentation"
    },
    {
      icon: MessageSquare,
      title: "Community Forum",
      desc: "Discuss issues with other users.",
      link: "#"
    },
    {
      icon: ShieldQuestion,
      title: "Security Center",
      desc: "Learn about our safety protocols.",
      link: "/security"
    },
    {
      icon: LifeBuoy,
      title: "Live Chat",
      desc: "Chat with our support experts.",
      link: "#"
    }
  ];

  const categories = [
    {
      title: "General",
      items: ["What is CognifyPM?", "How to get started?", "Managing your company", "Role permissions"]
    },
    {
      title: "Billing",
      items: ["Subscription plans", "Invoicing & payments", "Canceling your plan", "Refund policy"]
    },
    {
      title: "Technical",
      items: ["API troubleshooting", "Integration setup", "Report generation", "Meeting issues"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="relative pt-32 pb-20 px-6 overflow-hidden text-center" style={{ background: "var(--hero-gradient)" }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`, backgroundSize: "80px 80px" }} />
        
        <div className="container mx-auto max-w-4xl relative z-10">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-6 text-xs font-medium text-muted-foreground uppercase tracking-widest">
             <LifeBuoy size={14} className="text-accent" />
             Support Center
           </div>
           <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-10">How can we help?</h1>
           
           <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input placeholder="Search for answers..." className="pl-16 py-8 rounded-full bg-background/50 border-border text-lg shadow-2xl focus:ring-accent" />
           </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
            {quickLinks.map((item, index) => (
              <motion.a
                key={item.title}
                href={item.link}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 rounded-2xl border border-border bg-card/30 flex flex-col items-center text-center group hover:border-accent hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                  <item.icon size={28} />
                </div>
                <h3 className="font-heading font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">{item.desc}</p>
                <div className="text-accent text-sm font-bold flex items-center gap-2 group-hover:gap-4 transition-all uppercase tracking-widest">
                   Explore <ArrowRight size={14} />
                </div>
              </motion.a>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-16">
             {/* Left: Popular articles */}
             <div className="lg:col-span-2">
                <h2 className="font-heading text-3xl font-bold mb-10">Popular Topics</h2>
                <div className="grid md:grid-cols-2 gap-8">
                   {categories.map((cat) => (
                      <div key={cat.title}>
                         <h3 className="font-heading text-xl font-bold mb-6 text-accent">{cat.title}</h3>
                         <ul className="space-y-4">
                            {cat.items.map((item) => (
                               <li key={item}>
                                  <a href="#" className="flex items-center gap-3 text-muted-foreground hover:text-foreground group transition-colors">
                                     <CheckCircle2 size={16} className="text-accent/50 group-hover:text-accent transition-colors" />
                                     <span>{item}</span>
                                  </a>
                               </li>
                            ))}
                         </ul>
                      </div>
                   ))}
                </div>
                
                <div className="mt-16 p-8 rounded-3xl bg-card border border-border overflow-hidden relative group">
                   <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="text-center md:text-left">
                        <h3 className="font-heading text-2xl font-bold mb-2">Can't find what you're looking for?</h3>
                        <p className="text-muted-foreground">Our support engineers are ready to assist you personally.</p>
                      </div>
                      <Button className="rounded-full px-8 py-6 bg-foreground text-background shrink-0">
                         Create a Ticket
                      </Button>
                   </div>
                   <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] rounded-full -mr-32 -mt-32" />
                </div>
             </div>

             {/* Right: Contact Support Form */}
             <div className="lg:col-span-1">
                <div className="sticky top-32">
                   <div className="p-8 rounded-3xl bg-foreground text-background mb-8">
                      <div className="flex items-center gap-4 mb-6">
                         <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center">
                            <Mail size={20} />
                         </div>
                         <h3 className="font-heading text-xl font-bold">Email Support</h3>
                      </div>
                      <p className="opacity-80 mb-8">Expect a response within 24 hours.</p>
                      <a href="mailto:support@cognifypm.com" className="block text-center py-4 rounded-xl bg-background text-foreground font-bold hover:bg-accent hover:text-accent-foreground transition-all">
                        support@cognifypm.com
                      </a>
                   </div>
                   
                   <div className="p-8 rounded-3xl border border-border bg-card/50">
                      <h4 className="font-heading font-bold mb-4 flex items-center gap-2">
                        <HelpCircle size={18} className="text-accent" />
                        Quick Contact
                      </h4>
                      <ContactForm />
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

export default Support;
