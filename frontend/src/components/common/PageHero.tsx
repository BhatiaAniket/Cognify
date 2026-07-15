import { motion } from "framer-motion";

interface PageHeroProps {
  title: string;
  subtitle: string;
  category?: string;
  centered?: boolean;
}

const PageHero = ({ title, subtitle, category, centered = true }: PageHeroProps) => {
  return (
    <section 
      className={`relative pt-32 pb-20 px-6 overflow-hidden ${centered ? 'text-center' : ''}`}
      style={{ background: "var(--hero-gradient)" }}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {category && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-6 text-xs font-medium text-muted-foreground tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              {category}
            </div>
          )}
          
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            {title}
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PageHero;
