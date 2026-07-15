import { Layout, MessageSquare, Video, LineChart, Shield, Zap, Users, ShieldCheck } from "lucide-react";
import PageHero from "@/components/common/PageHero";
import FeatureCard from "@/components/common/FeatureCard";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Button } from "@/components/ui/button";

const Features = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Real-Time Collaboration",
      description: "Work together seamlessly with live updates, team chat, and shared workspaces.",
      points: ["Instant messaging", "Live status updates", "Threaded conversations", "File attachments"]
    },
    {
      icon: LineChart,
      title: "AI-Powered Reports",
      description: "Get intelligent insights with automated performance analysis and predictive analytics.",
      points: ["Performance scoring", "Predictive deadlines", "Automated summaries", "Custom dashboards"]
    },
    {
      icon: Layout,
      title: "Project Management",
      description: "Comprehensive tools for planning, executing, and tracking any project of any size.",
      points: ["Gantt charts", "Kanban boards", "Task dependencies", "Milestone tracking"]
    },
    {
      icon: Video,
      title: "Video Meetings",
      description: "High-quality WebRTC video conferencing built directly into your project workflow.",
      points: ["Screen sharing", "Meeting recording", "Encrypted streaming", "Low latency"]
    },
    {
      icon: Zap,
      title: "Task Tracking",
      description: "Never lose track of a task again with our granular tracking and notification system.",
      points: ["Personal task lists", "Priority levels", "Deadline reminders", "Time tracking"]
    },
    {
      icon: ShieldCheck,
      title: "Role-Based Access",
      description: "Granular permissions for company admin, managers, employees, and clients.",
      points: ["Secure login", "JWT authentication", "Permission sets", "Activity logs"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageHero 
        category="Features"
        title="Powerful Features for Modern Teams" 
        subtitle="Everything you need to manage projects, collaborate in real-time, and boost productivity with AI-driven insights."
      />
      
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
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

      {/* Bottom CTA */}
      <section className="py-24 px-6 bg-card/30 border-y border-border">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">Ready to boost your productivity?</h2>
          <p className="text-muted-foreground text-lg mb-10">
            Join thousands of teams already using CognifyPM to streamline their workflows.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="rounded-full px-8 py-6 text-lg bg-foreground text-background hover:bg-foreground/90">
              Start Free Trial
            </Button>
            <Button variant="outline" className="rounded-full px-8 py-6 text-lg">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;
