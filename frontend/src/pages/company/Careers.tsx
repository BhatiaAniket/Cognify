import PageHero from "@/components/common/PageHero";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  ArrowRight, 
  CheckCircle2,
  Heart,
  Globe,
  Zap,
  Coffee,
  Smile
} from "lucide-react";

const Careers = () => {
  const benefits = [
    { icon: Globe, title: "Remote-First", desc: "Work from anywhere in the world. We value output over seat time." },
    { icon: Heart, title: "Heath & Wellness", desc: "Premium health insurance, fitness stipends, and mental health support." },
    { icon: Zap, title: "Learning Fund", desc: "Annual budget for courses, books, and conferences to help you grow." },
    { icon: Coffee, title: "Modern Setup", desc: "Budget for your home office setup and the latest tech hardware." },
    { icon: Clock, title: "Flexible Time", desc: "Generous PTO, family leave, and flexible working hours." },
    { icon: Smile, title: "Great Culture", desc: "Regular team retreats, virtual social events, and a supportive community." }
  ];

  const positions = [
    {
      title: "Senior Full Stack Engineer",
      team: "Engineering",
      location: "Remote / Ahmedabad",
      type: "Full-time"
    },
    {
      title: "Product Designer (UI/UX)",
      team: "Design",
      location: "Remote",
      type: "Full-time"
    },
    {
      title: "DevOps Specialist",
      team: "Engineering",
      location: "Remote / Hybrid",
      type: "Full-time"
    },
    {
      title: "Customer Success Manager",
      team: "Operations",
      location: "Remote (Global)",
      type: "Full-time"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageHero 
        category="Opportunities"
        title="Join Our Team" 
        subtitle="Help us build the future of work collaboration. We're looking for passionate individuals to join our mission."
      />

      {/* Why Cognify Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">Why work with us?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We're a fast-growing team of innovators, dreamers, and doers, working together to solve real-world problems.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 rounded-2xl border border-border bg-card/50 hover:border-accent hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-6">
                  <benefit.icon size={24} />
                </div>
                <h3 className="font-heading text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-24 px-6 bg-card/20 border-y border-border">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-center md:text-left">Open Positions</h2>
            <div className="flex gap-4">
               {["All Teams", "Engineering", "Design", "Operations"].map((team) => (
                 <button key={team} className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                   {team}
                 </button>
               ))}
            </div>
          </div>
          
          <div className="space-y-4">
            {positions.map((job, index) => (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-8 rounded-2xl bg-background border border-border hover:border-accent hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
              >
                <div>
                  <h3 className="font-heading text-2xl font-bold mb-2 group-hover:text-accent transition-colors">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2"><Briefcase size={14} /> {job.team}</span>
                    <span className="flex items-center gap-2"><MapPin size={14} /> {job.location}</span>
                    <span className="flex items-center gap-2"><Clock size={14} /> {job.type}</span>
                  </div>
                </div>
                <Button className="rounded-full px-8 py-6 group-hover:bg-foreground group-hover:text-background transition-colors">
                  Apply Now <ArrowRight size={16} className="ml-2" />
                </Button>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-6">Don't see a perfect fit?</p>
            <Button variant="outline" className="rounded-full px-8 py-6">
              Send an Open Application
            </Button>
          </div>
        </div>
      </section>

      {/* Values/Culture */}
      <section className="py-24 px-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -mr-[250px] -mt-[250px]" />
         
         <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
               <motion.div
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 className="aspect-square rounded-3xl overflow-hidden bg-card border border-border flex items-center justify-center italic font-heading text-4xl text-center p-12"
               >
                 "We're looking for people who care about building something that matters."
               </motion.div>
               <div>
                  <h2 className="font-heading text-3xl md:text-5xl font-bold mb-8">Our Culture</h2>
                  <div className="space-y-6">
                     {[
                       "Radical transparency in all communications.",
                       "High autonomy and ownership for every team member.",
                       "A culture of continuous learning and experimentation.",
                       "Diversity and inclusion as a core strength, not a checkbox.",
                       "Data-driven decisions tempered by empathy."
                     ].map((item) => (
                       <div key={item} className="flex items-start gap-4">
                          <CheckCircle2 className="text-accent shrink-0 mt-1" size={20} />
                          <p className="text-muted-foreground text-lg leading-relaxed">{item}</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
