import PageHero from "@/components/common/PageHero";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { motion } from "framer-motion";
import { Target, Eye, Heart, Rocket, Shield, Zap } from "lucide-react";

const About = () => {
  const stats = [
    { value: "1,000+", label: "Companies" },
    { value: "50k+", label: "Active Users" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Global Support" }
  ];

  const values = [
    {
      icon: Rocket,
      title: "Innovation",
      description: "We constantly push the boundaries of what's possible in project management."
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description: "Your data's security is our highest priority, built into every layer of our platform."
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "We build features based on real feedback from teams like yours."
    },
    {
      icon: Zap,
      title: "Efficiency",
      description: "We believe in removing friction so you can focus on what matters most."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageHero 
        category="Our Story"
        title="About CognifyPM" 
        subtitle="We're on a mission to empower teams with intelligent collaboration tools that simplify complex projects."
      />

      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-heading text-3xl md:text-5xl font-bold mb-8 italic">"Modern teams struggle with fragmented tools and information silos."</h2>
              <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                <p>
                  At CognifyPM, we saw a recurring problem: companies were juggling dozens of platforms 
                  for task tracking, video meetings, chat, and reporting. Data was scattered, 
                  and true collaboration was suffering.
                </p>
                <p>
                  We built CognifyPM to be the one true source for projects. A centralized platform 
                  designed for multi-company collaboration, powered by AI to give you insights 
                  you can actually use.
                </p>
                <p className="font-bold text-foreground">
                  Today, we're proud to support thousands of teams across the globe, helping them 
                  build the future, one project at a time.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square rounded-3xl overflow-hidden bg-card border border-border group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent transition-opacity group-hover:opacity-40" />
              {/* Optional: Add a real team image here if available */}
              <div className="absolute inset-0 flex items-center justify-center p-12">
                <div className="text-center leading-[0.85]">
                  <span className="block font-heading text-[6rem] sm:text-[8rem] xl:text-[9rem] font-bold opacity-5 select-none">Cognify</span>
                  <span className="block font-heading text-[6rem] sm:text-[8rem] xl:text-[9rem] font-bold opacity-5 select-none">PM</span>
                </div>
              </div>
              <div className="absolute bottom-10 left-10 right-10">
                <div className="p-6 rounded-2xl bg-background/80 backdrop-blur-md border border-border">
                  <p className="font-heading font-bold text-xl mb-1">Built for Scale</p>
                  <p className="text-sm text-muted-foreground">From 5-person startups to global corporations.</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-8 rounded-2xl border border-border bg-card/30"
              >
                <div className="font-heading text-4xl md:text-6xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Mission/Vision */}
          <div className="grid md:grid-cols-2 gap-12 mb-32">
             <div className="p-12 rounded-3xl bg-foreground text-background">
               <div className="w-12 h-12 rounded-full bg-background/10 flex items-center justify-center mb-8">
                 <Target className="text-background" size={24} />
               </div>
               <h3 className="font-heading text-3xl font-bold mb-6">Our Mission</h3>
               <p className="text-xl leading-relaxed opacity-90">
                 To empower teams with intelligent, unified collaboration tools that turn vision into reality with zero friction.
               </p>
             </div>
             <div className="p-12 rounded-3xl bg-accent text-accent-foreground">
               <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center mb-8">
                 <Eye className="text-accent-foreground" size={24} />
               </div>
               <h3 className="font-heading text-3xl font-bold mb-6">Our Vision</h3>
               <p className="text-xl leading-relaxed opacity-90">
                 A world where every team works seamlessly across company lines, boosted by intelligent insights.
               </p>
             </div>
          </div>

          {/* Values Grid */}
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">Our Values</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              These shared principles guide everything we do, from engineering to customer success.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 rounded-2xl border border-border bg-card/50 text-center flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-6">
                  <value.icon size={32} />
                </div>
                <h3 className="font-heading font-bold text-xl mb-4">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join us CTA */}
      <section className="py-24 px-6 bg-card/20 border-t border-border">
         <div className="container mx-auto max-w-4xl text-center">
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">Join our journey</h2>
            <p className="text-muted-foreground text-lg mb-10">
              We're always looking for passionate people to help us build the future of work.
            </p>
            <a 
              href="/careers" 
              className="inline-flex items-center gap-2 font-bold text-xl text-foreground hover:gap-4 transition-all"
            >
              See Open Positions <Rocket size={20} />
            </a>
         </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
