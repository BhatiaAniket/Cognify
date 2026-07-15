import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { motion } from "framer-motion";
import { Cookie, ShieldAlert, Cpu, Settings, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const CookiesPolicy = () => {
  const cookieDetails = [
    { name: "auth_token", type: "Essential", purpose: "Authentication & Security", duration: "Session" },
    { name: "theme_pref", type: "Functional", purpose: "Remembering theme choice", duration: "1 year" },
    { name: "_ga", type: "Analytics", purpose: "Usage statistics", duration: "2 years" },
    { name: "stripe_id", type: "Essential", purpose: "Payment processing", duration: "1 year" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6 border-b border-border bg-card/10">
        <div className="container mx-auto max-w-4xl text-center">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-6 text-xs font-medium text-accent uppercase tracking-widest">
             <Cookie size={14} />
             Cookie Settings
           </div>
           <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight mb-8">Cookie Policy</h1>
           <p className="text-xl text-muted-foreground leading-relaxed mb-4">
             We use cookies to improve your experience. Learn how we use them and how you can control them.
           </p>
           <div className="text-sm text-muted-foreground">
              Last Updated: April 19, 2026
           </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
           <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="font-heading text-3xl font-bold mb-8 flex items-center gap-3">
                 <ShieldAlert className="text-accent" />
                 What are cookies?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-12">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
                They are widely used to make websites work more efficiently, as well as to provide information to the 
                owners of the site.
              </p>

              <h2 className="font-heading text-3xl font-bold mb-8 flex items-center gap-3">
                 <Cpu className="text-accent" />
                 How we use them
              </h2>
              <div className="grid md:grid-cols-2 gap-8 mb-16">
                 <div className="p-8 rounded-2xl bg-card/30 border border-border">
                    <h3 className="font-heading font-bold text-xl mb-4 text-foreground">Essential Cookies</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                       These are required for the website to function. They handle authentication, security, and session management. 
                       Without these cookies, you won't be able to stay logged in or process payments.
                    </p>
                 </div>
                 <div className="p-8 rounded-2xl bg-card/30 border border-border">
                    <h3 className="font-heading font-bold text-xl mb-4 text-foreground">Analytics Cookies</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                       We use these to understand how visitors interact with our website, helping us improve performance and user experience. 
                       All data is anonymized.
                    </p>
                 </div>
              </div>

              <h2 className="font-heading text-3xl font-bold mb-8">Cookie Details</h2>
              <div className="rounded-2xl border border-border overflow-hidden mb-16">
                 <Table>
                    <TableHeader className="bg-muted/50">
                       <TableRow>
                          <TableHead className="font-heading font-bold uppercase tracking-widest text-xs">Name</TableHead>
                          <TableHead className="font-heading font-bold uppercase tracking-widest text-xs">Type</TableHead>
                          <TableHead className="font-heading font-bold uppercase tracking-widest text-xs">Purpose</TableHead>
                          <TableHead className="font-heading font-bold uppercase tracking-widest text-xs">Duration</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {cookieDetails.map((cookie) => (
                         <TableRow key={cookie.name}>
                            <TableCell className="font-mono text-sm">{cookie.name}</TableCell>
                            <TableCell>
                               <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${cookie.type === 'Essential' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
                                  {cookie.type}
                               </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{cookie.purpose}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{cookie.duration}</TableCell>
                         </TableRow>
                       ))}
                    </TableBody>
                 </Table>
              </div>

              <h2 className="font-heading text-3xl font-bold mb-8 flex items-center gap-3">
                 <Settings className="text-accent" />
                 How to manage cookies
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Most web browsers allow you to control cookies through their settings. You can delete existing cookies 
                and block new ones. Please note that disabling essential cookies may impact the usability of CognifyPM.
              </p>
              
              <ul className="space-y-4 mb-16">
                 {["Google Chrome", "Mozilla Firefox", "Apple Safari", "Microsoft Edge"].map((browser) => (
                   <li key={browser} className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent group cursor-pointer">
                      <ChevronRight size={14} className="text-accent group-hover:translate-x-1 transition-transform" />
                      How to manage cookies in {browser}
                   </li>
                 ))}
              </ul>
           </div>

           {/* Preference Tool Placeholder */}
           <div className="p-12 rounded-3xl bg-foreground text-background text-center">
              <h3 className="font-heading text-2xl font-bold mb-4">Manage Preferences</h3>
              <p className="opacity-80 mb-8 max-w-md mx-auto">Want to change your cookie settings right now? Use our interactive preference center.</p>
              <Button className="rounded-full px-10 py-6 bg-background text-foreground font-bold hover:scale-105 transition-transform">
                 Open Preference Center
              </Button>
           </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CookiesPolicy;
