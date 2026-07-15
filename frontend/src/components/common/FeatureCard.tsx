import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  points?: string[];
  delay?: number;
}

const FeatureCard = ({ icon: Icon, title, description, points, delay = 0 }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="feature-card h-full flex flex-col group"
    >
      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 text-accent group-hover:scale-110 transition-transform duration-300">
        <Icon size={24} />
      </div>
      
      <h3 className="font-heading text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">
        {description}
      </p>
      
      {points && points.length > 0 && (
        <ul className="space-y-2 mt-auto">
          {points.map((point, index) => (
            <li key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-1 h-1 rounded-full bg-accent" />
              {point}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default FeatureCard;
