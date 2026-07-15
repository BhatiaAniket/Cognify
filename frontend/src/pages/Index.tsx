import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import MouseBlob from "@/components/MouseBlob";
import Navbar from "@/components/common/Navbar";
import Hero from "@/components/common/Hero";

import AboutSection from "@/components/AboutSection";
import FeaturesSection from "@/components/FeaturesSection";
import RolesSection from "@/components/RolesSection";
import TechStackSection from "@/components/TechStackSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/common/Footer";

const Index = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [hash]);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <MouseBlob />
      <Navbar />
      <Hero />
      
      <AboutSection />
      <FeaturesSection />
      <RolesSection />
      <TechStackSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
