import { Lock, Shield, ShieldCheck, Database, RefreshCw, Server, FileCheck, Globe } from "lucide-react";
import PageHero from "@/components/common/PageHero";
import FeatureCard from "@/components/common/FeatureCard";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Button } from "@/components/ui/button";

const Security = () => {
  const securityFeatures = [
    {
      icon: Lock,
      title: "Data Encryption",
      description: "All data is encrypted in transit using TLS 1.3 and at rest using enterprise-grade AES-256 encryption.",
      points: ["TLS 1.3 protocols", "AES-256 for databases", "Encrypted backups", "Secure key management"]
    },
    {
      icon: ShieldCheck,
      title: "Role-Based Access Control",
      description: "Granular permissions system ensuring users only access the data they are authorized to see.",
      points: ["Custom roles", "Permission inheritance", "Audit logging", "Session monitoring"]
    },
    {
      icon: Database,
      title: "Multi-Tenant Architecture",
      description: "Complete data isolation between different companies, ensuring no data leaks or cross-contamination.",
      points: ["Logical data isolation", "Independent schemas", "Secure silos", "Isolated caching"]
    },
    {
      icon: Shield,
      title: "Secure Authentication",
      description: "Robust authentication using JWT tokens, secure cookies, and salted bcrypt password hashing.",
      points: ["JWT with expiry", "Bcrypt hashing", "Secure session cookies", "MFA readiness"]
    },
    {
      icon: RefreshCw,
      title: "Backup & Recovery",
      description: "Real-time database backups and multi-region disaster recovery to ensure 99.9% uptime.",
      points: ["Hourly backups", "Multi-region redundancy", "15-min RTO", "Point-in-time recovery"]
    },
    {
      icon: FileCheck,
      title: "Compliance & Audits",
      description: "Regular third-party security audits and adherence to international data privacy standards.",
      points: ["GDPR compliant", "SOC 2 Type II ready", "ISO 27001 standards", "Regular pentesting"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageHero 
        category="Security"
        title="Enterprise-Grade Security" 
        subtitle="Your data is protected with bank-level encryption, multi-tenant isolation, and 24/7 monitoring."
      />

      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <FeatureCard 
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                points={feature.points}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-24 px-6 bg-card/20 border-y border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">Our Certifications</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We hold ourselves to the highest global standards to ensure your business remains secure.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "ISO 27001", desc: "Information Security" },
              { label: "SOC 2 Type II", desc: "Trust & Transparency" },
              { label: "GDPR", desc: "Data Privacy" },
              { label: "HIPAA", desc: "Health Information" }
            ].map((cert) => (
              <div key={cert.label} className="p-8 rounded-2xl border border-border bg-background text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4">
                  <FileCheck size={32} />
                </div>
                <h3 className="font-heading font-bold text-xl mb-1">{cert.label}</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent mb-8">
            <Shield size={24} />
          </div>
          <h2 className="font-heading text-2xl md:text-4xl font-bold italic mb-8 leading-tight">
            "At CognifyPM, security isn't just a feature—it's the foundation of everything we build. We protect your projects as if they were our own."
          </h2>
          <div className="flex flex-col items-center">
            <div className="font-bold text-lg">Head of Security</div>
            <div className="text-muted-foreground">CognifyPM Engineering Team</div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-6 bg-foreground text-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">Questions about security?</h2>
          <p className="text-background/80 text-lg mb-10">
            Our security team is here to answer any detailed technical questions you may have.
          </p>
          <Button className="rounded-full px-8 py-6 text-lg bg-background text-foreground hover:bg-background/90" asChild>
            <a href="/contact">Contact Security Team</a>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Security;
