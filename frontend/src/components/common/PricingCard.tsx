import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  name: string;
  price: string;
  duration: string;
  features: PricingFeature[];
  buttonText: string;
  popular?: boolean;
  delay?: number;
}

const PricingCard = ({ 
  name, 
  price, 
  duration, 
  features, 
  buttonText, 
  popular = false,
  delay = 0 
}: PricingCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`relative flex flex-col h-full rounded-2xl border p-8 transition-all duration-500 hover:shadow-2xl ${
        popular 
          ? "border-accent bg-card shadow-xl scale-105 z-10" 
          : "border-border bg-card/50"
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold tracking-widest uppercase">
          Most Popular
        </div>
      )}
      
      <div className="mb-8">
        <h3 className="font-heading text-xl font-bold text-foreground mb-2">{name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold font-heading">{price}</span>
          <span className="text-muted-foreground text-sm">/ {duration}</span>
        </div>
      </div>
      
      <ul className="space-y-4 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-sm">
            {feature.included ? (
              <Check className="text-accent shrink-0 mt-0.5" size={16} />
            ) : (
              <X className="text-muted-foreground shrink-0 mt-0.5" size={16} />
            )}
            <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
      
      <Button 
        variant={popular ? "default" : "outline"} 
        className={`w-full rounded-full py-6 font-semibold transition-transform duration-300 hover:scale-[1.02] ${
          popular ? "bg-foreground text-background hover:bg-foreground/90" : ""
        }`}
      >
        {buttonText}
      </Button>
    </motion.div>
  );
};

export default PricingCard;
