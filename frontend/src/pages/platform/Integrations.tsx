import PageHero from "@/components/common/PageHero";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  MessageCircle, 
  Slack, 
  Github, 
  DraftingCompass, 
  Cloud, 
  CreditCard,
  Mail,
  Box,
  Cpu,
  Workflow
} from "lucide-react";

const Integrations = () => {
  const categories = [
    {
      name: "Communication",
      integrations: [
        { name: "Slack", icon: Slack, desc: "Sync tasks and get instant notifications." },
        { name: "MS Teams", icon: MessageCircle, desc: "Collaborate directly from your Teams channels." },
        { name: "Discord", icon: MessageCircle, desc: "Stay connected with your dev community." }
      ]
    },
    {
      name: "Cloud Storage",
      integrations: [
        { name: "Google Drive", icon: Cloud, desc: "Attach documents directly to projects." },
        { name: "Dropbox", icon: Cloud, desc: "Seamless file sharing across your team." },
        { name: "OneDrive", icon: Cloud, desc: "Enterprise-grade storage integration." }
      ]
    },
    {
      name: "Development",
      integrations: [
        { name: "GitHub", icon: Github, desc: "Link commits and PRs to your tasks." },
        { name: "GitLab", icon: Github, desc: "Automate workflows with GitLab issues." },
        { name: "Jira", icon: Box, desc: "Import and sync Jira tickets effortlessly." }
      ]
    },
    {
      name: "AI & Automation",
      integrations: [
        { name: "Llama 3.1 (Groq)", icon: Cpu, desc: "Generate intelligent reports and summaries." },
        { name: "Google AI", icon: Cpu, desc: "Advanced predictive analytics for timelines." },
        { name: "Zapier", icon: Workflow, desc: "Connect with 5000+ other apps." }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageHero 
        category="Integrations"
        title="Connect Your Workflow" 
        subtitle="CognifyPM works seamlessly with the tools you already use every day. Boost your productivity with our growing ecosystem."
      />

      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          {categories.map((category, catIndex) => (
            <div key={category.name} className="mb-20 last:mb-0">
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-10 flex items-center gap-4">
                {category.name}
                <div className="h-px bg-border flex-grow" />
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.integrations.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: (catIndex * 3 + index) * 0.05 }}
                    className="p-8 rounded-2xl border border-border bg-card/50 hover:bg-card hover:border-accent group transition-all duration-300"
                  >
                    <div className="w-14 h-14 rounded-xl bg-background border border-border flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent/5 transition-all duration-300">
                      <item.icon size={28} className="text-foreground group-hover:text-accent" />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-foreground mb-3">{item.name}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                      {item.desc}
                    </p>
                    <Button variant="link" className="p-0 text-accent font-semibold group-hover:translate-x-1 transition-transform">
                      Explore Integration →
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-24 px-6 bg-card/10 border-y border-border overflow-hidden">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="font-heading text-3xl font-bold mb-16 uppercase tracking-widest">Coming Soon</h2>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale">
            {["Notion", "Asana", "Trello", "Monday.com", "Salesforce", "Zendesk"].map((tool) => (
              <span key={tool} className="font-heading text-2xl md:text-3xl font-bold">{tool}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-6 relative">
         {/* Background blob */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 blur-[100px] rounded-full pointer-events-none" />
         
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">Don't see your tool?</h2>
          <p className="text-muted-foreground text-lg mb-10">
            We're constantly adding new integrations. Tell us what you'd like to see next.
          </p>
          <Button className="rounded-full px-10 py-7 text-lg bg-foreground text-background hover:bg-foreground/90 shadow-2xl transition-transform hover:scale-105">
            Request an Integration
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Integrations;
