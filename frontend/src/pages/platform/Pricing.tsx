import { useState } from "react";
import PageHero from "@/components/common/PageHero";
import PricingCard from "@/components/common/PricingCard";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Free Trial",
      price: isYearly ? "₹0" : "₹0",
      duration: isYearly ? "year" : "month",
      buttonText: "Start Free Trial",
      features: [
        { text: "Up to 10 users", included: true },
        { text: "Basic project management", included: true },
        { text: "Task tracking", included: true },
        { text: "Team chat", included: true },
        { text: "5GB storage", included: true },
        { text: "AI reports", included: false },
        { text: "Video meetings", included: false },
        { text: "Role-based access", included: false },
      ]
    },
    {
      name: "Professional",
      price: isYearly ? "₹29,990" : "₹2,999",
      duration: isYearly ? "year" : "month",
      buttonText: "Get Started",
      popular: true,
      features: [
        { text: "Unlimited users", included: true },
        { text: "AI-powered reports", included: true },
        { text: "Video meetings", included: true },
        { text: "Unlimited projects", included: true },
        { text: "100GB storage", included: true },
        { text: "Priority support", included: true },
        { text: "Role-based access", included: true },
        { text: "Custom domains", included: false },
      ]
    },
    {
      name: "Enterprise",
      price: "Custom",
      duration: "quote",
      buttonText: "Contact Sales",
      features: [
        { text: "Everything in Professional", included: true },
        { text: "Advanced security (SAML/SSO)", included: true },
        { text: "Dedicated account manager", included: true },
        { text: "Custom reporting", included: true },
        { text: "White-labeling", included: true },
        { text: "99.99% Uptime SLA", included: true },
        { text: "Unlimited storage", included: true },
        { text: "Custom AI training", included: true },
      ]
    }
  ];

  const faqs = [
    {
      q: "How does the 5-6 month free trial work?",
      a: "New companies can sign up and use all professional features for up to 6 months without any credit card. We want you to see the value before you pay."
    },
    {
      q: "Can I cancel my subscription anytime?",
      a: "Yes, you can cancel your subscription at any time from your settings page. You will retain access until the end of your billing cycle."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit cards, debit cards, and UPI via Stripe. For Enterprise plans, we also support bank transfers and invoicing."
    },
    {
      q: "Do you offer discounts for non-profits?",
      a: "Yes, we offer special pricing for registered non-profit organizations and educational institutions. Contact our sales team for more info."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageHero 
        category="Pricing"
        title="Simple, Transparent Pricing" 
        subtitle="Start free for 5-6 months. No credit card required. Upgrade when you're ready to scale."
      />

      <section className="py-24 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={`text-sm ${!isYearly ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="w-14 h-7 rounded-full bg-muted border border-border p-1 relative transition-colors duration-300"
            >
              <div className={`w-5 h-5 rounded-full bg-accent transition-all duration-300 ${isYearly ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm ${isYearly ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>Yearly</span>
            <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider">Save 20%</span>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            {plans.map((plan, index) => (
              <PricingCard 
                key={index}
                {...plan}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-card/20 border-t border-border">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-12 text-center text-balance">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                <AccordionTrigger className="text-left font-heading text-lg hover:no-underline">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Trust Logos */}
      <section className="py-16 border-t border-border bg-background">
        <div className="container mx-auto max-w-6xl px-6 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-10">Trusted payment partners</p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             <span className="font-bold text-2xl">Stripe</span>
             <span className="font-bold text-2xl">Visa</span>
             <span className="font-bold text-2xl">Mastercard</span>
             <span className="font-bold text-2xl">Paypal</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
