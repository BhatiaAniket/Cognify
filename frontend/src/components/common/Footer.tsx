import { Link } from "react-router-dom";

const Footer = () => {
  const getSlug = (label: string) => {
    const slugMap: Record<string, string> = {
      "Features": "/features",
      "Pricing": "/pricing",
      "Security": "/security",
      "Integrations": "/integrations",
      "About": "/about",
      "Blog": "/blog",
      "Careers": "/careers",
      "Contact": "/contact",
      "Documentation": "/documentation",
      "API Reference": "/api-reference",
      "Support": "/support",
      "Status": "/status",
      "Privacy": "/privacy",
      "Terms": "/terms",
      "Cookies": "/cookies"
    };
    return slugMap[label] || "#";
  };

  return (
    <footer className="border-t border-border py-16 px-6 bg-card/10">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="font-heading text-2xl font-bold text-foreground hover:text-accent transition-colors">CognifyPM</Link>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              AI-powered multi-company project management and collaboration platform.
            </p>
          </div>

          {/* Links */}
          {[
            {
              title: "Platform",
              links: ["Features", "Pricing", "Security", "Integrations"],
            },
            {
              title: "Company",
              links: ["About", "Blog", "Careers", "Contact"],
            },
            {
              title: "Resources",
              links: ["Documentation", "API Reference", "Support", "Status"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-heading font-semibold text-foreground text-sm tracking-wider uppercase mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link 
                      to={getSlug(link)} 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © 2026 CognifyPM. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <Link
                key={item}
                to={getSlug(item)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
