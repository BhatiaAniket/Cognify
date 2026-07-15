import PageHero from "@/components/common/PageHero";
import ContactForm from "@/components/common/ContactForm";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Twitter, 
  Linkedin, 
  Github,
  MessageSquare,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";

const Contact = () => {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: ["support@cognifypm.com", "sales@cognifypm.com"],
      link: "mailto:support@cognifypm.com"
    },
    {
      icon: Phone,
      title: "Phone",
      details: ["+91 (800) 123-4567", "+1 (555) 987-6543"],
      link: "tel:+918001234567"
    },
    {
      icon: MapPin,
      title: "Office",
      details: ["123 Tech Park, Satellite Road", "Ahmedabad, Gujarat, India - 380015"],
      link: "https://maps.google.com"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageHero 
        category="Contact Us"
        title="Get in Touch" 
        subtitle="Have questions? We'd love to hear from you. Our team is here to help you get the most out of CognifyPM."
      />

      <section className="py-24 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left: Contact Form */}
            <div>
              <h2 className="font-heading text-3xl font-bold mb-8">Send us a message</h2>
              <ContactForm />
            </div>

            {/* Right: Contact details */}
            <div className="lg:pl-10">
              <h2 className="font-heading text-3xl font-bold mb-8">Other ways to connect</h2>
              
              <div className="grid sm:grid-cols-1 gap-8 mb-12">
                {contactInfo.map((info, index) => (
                  <motion.a
                    key={info.title}
                    href={info.link}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-6 p-6 rounded-2xl border border-border bg-card/30 hover:border-accent hover:shadow-lg transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                      <info.icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold mb-2">{info.title}</h3>
                      {info.details.map((detail, dIndex) => (
                        <p key={dIndex} className="text-muted-foreground">{detail}</p>
                      ))}
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* Social Channels */}
              <div className="p-8 rounded-2xl bg-foreground text-background">
                 <h3 className="font-heading text-xl font-bold mb-6">Social Channels</h3>
                 <div className="flex gap-4">
                    {[
                      { icon: Twitter, label: "Twitter" },
                      { icon: Linkedin, label: "LinkedIn" },
                      { icon: Github, label: "GitHub" },
                      { icon: MessageSquare, label: "Slack" }
                    ].map((social) => (
                      <button 
                        key={social.label}
                        className="w-12 h-12 rounded-full bg-background/10 flex items-center justify-center text-background hover:bg-accent transition-colors"
                        aria-label={social.label}
                      >
                        <social.icon size={20} />
                      </button>
                    ))}
                 </div>
              </div>

              <div className="mt-12 flex items-center gap-4 text-muted-foreground p-6 rounded-2xl border border-dashed border-border">
                 <Clock className="text-accent" />
                 <p className="text-sm">We typically respond to all inquiries within 24 hours during business days.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section Placeholder */}
      <section className="h-[400px] w-full bg-muted/30 border-y border-border relative overflow-hidden">
         <div className="absolute inset-0 flex items-center justify-center grayscale opacity-10">
            <MapPin size={120} />
         </div>
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
               <span className="px-4 py-2 rounded-full border border-border bg-card/50 backdrop-blur-md text-sm font-bold uppercase tracking-widest">Map View Unavailable</span>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
