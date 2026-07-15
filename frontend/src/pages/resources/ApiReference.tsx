import PageHero from "@/components/common/PageHero";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { motion } from "framer-motion";
import { 
  Code, 
  Terminal, 
  Lock, 
  Database, 
  Zap, 
  Copy, 
  Check,
  ChevronRight,
  ExternalLink,
  Cpu
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ApiReference = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const endpoints = [
    {
      group: "Authentication",
      items: [
        { method: "POST", path: "/auth/login", desc: "Authenticate a user and get a JWT token." },
        { method: "POST", path: "/auth/register", desc: "Register a new company and admin user." },
        { method: "POST", path: "/auth/refresh", desc: "Refresh an expired access token." }
      ]
    },
    {
      group: "Projects",
      items: [
        { method: "GET", path: "/projects", desc: "List all projects in your organization." },
        { method: "POST", path: "/projects", desc: "Create a new project." },
        { method: "GET", path: "/projects/:id", desc: "Get detailed information for a project." }
      ]
    },
    {
      group: "Tasks",
      items: [
        { method: "GET", path: "/tasks", desc: "Fetch tasks across all projects." },
        { method: "POST", path: "/tasks", desc: "Add a new task to a project." },
        { method: "PUT", path: "/tasks/:id", desc: "Update task status or details." }
      ]
    }
  ];

  const curlExample = `curl -X POST https://api.cognifypm.com/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@company.com",
    "password": "yourpassword"
  }'`;

  const nodeExample = `const response = await fetch('https://api.cognifypm.com/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@company.com',
    password: 'yourpassword'
  })
});

const data = await response.json();`;

  const pythonExample = `import requests

url = "https://api.cognifypm.com/v1/auth/login"
payload = {"email": "admin@company.com", "password": "yourpassword"}

response = requests.post(url, json=payload)
data = response.json()`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <section className="relative pt-32 pb-20 px-6 border-b border-border bg-card/10">
        <div className="container mx-auto max-w-6xl">
           <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-6 text-xs font-medium text-accent uppercase tracking-widest">
                   <Terminal size={14} />
                   API v1.0.0
                 </div>
                 <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight mb-8">API Reference</h1>
                 <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                   Build custom integrations, automate your workflows, and connect your existing tools to the CognifyPM ecosystem.
                 </p>
                 <div className="flex flex-wrap gap-4">
                    <Button className="rounded-full px-8 py-6 font-bold bg-foreground text-background">Download OpenAPI Spec</Button>
                    <Button variant="outline" className="rounded-full px-8 py-6 font-bold">API Status</Button>
                 </div>
              </div>
              
              <div className="rounded-2xl border border-border bg-black p-6 shadow-2xl overflow-hidden hidden lg:block">
                 <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-red-500" />
                       <div className="w-3 h-3 rounded-full bg-yellow-500" />
                       <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs text-white/40 font-mono tracking-widest">终端</span>
                 </div>
                 <pre className="font-mono text-xs md:text-sm text-green-400 overflow-x-auto">
                    <code>{curlExample}</code>
                 </pre>
              </div>
           </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
           <div className="grid lg:grid-cols-4 gap-12">
              {/* Sidebar */}
              <aside className="hidden lg:block lg:col-span-1 border-r border-border pr-8">
                 <div className="sticky top-32 space-y-8">
                    {endpoints.map((group) => (
                      <div key={group.group}>
                         <h4 className="font-heading font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4">{group.group}</h4>
                         <ul className="space-y-3">
                            {group.items.map((item) => (
                              <li key={item.path}>
                                 <a href={`#${item.path}`} className="text-sm hover:text-accent transition-colors flex items-center gap-2 group">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.method === 'GET' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                                       {item.method}
                                    </span>
                                    <span className="truncate">{item.path}</span>
                                 </a>
                              </li>
                            ))}
                         </ul>
                      </div>
                    ))}
                 </div>
              </aside>

              {/* Main Content */}
              <div className="lg:col-span-3">
                 <div className="mb-20">
                    <h2 className="font-heading text-3xl font-bold mb-6">Authentication</h2>
                    <p className="text-muted-foreground mb-8 text-lg">
                       All API requests require a valid JWT (JSON Web Token) to be passed in the Authorization header.
                       Use the <code>/auth/login</code> endpoint to obtain a token using your company credentials.
                    </p>
                    <div className="p-6 rounded-2xl bg-card/50 border border-border font-mono text-sm">
                       Authorization: Bearer YOUR_JWT_TOKEN
                    </div>
                 </div>

                 {endpoints.map((group) => (
                   <div key={group.group} className="mb-20">
                      <h2 className="font-heading text-3xl font-bold mb-10 border-b border-border pb-4">{group.group}</h2>
                      <div className="space-y-12">
                         {group.items.map((item) => (
                           <div key={item.path} id={item.path} className="group">
                              <div className="flex items-center gap-4 mb-4">
                                 <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.method === 'GET' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                                    {item.method}
                                 </span>
                                 <h3 className="font-mono font-bold text-xl">{item.path}</h3>
                              </div>
                              <p className="text-muted-foreground mb-6 leading-relaxed">
                                 {item.desc} Each request must include the <code>companyId</code> in the body or query parameters depending on the endpoint type.
                              </p>
                              
                              <Tabs defaultValue="curl" className="w-full">
                                 <div className="flex items-center justify-between mb-2">
                                    <TabsList className="bg-muted/50 p-1 h-auto">
                                       <TabsTrigger value="curl" className="text-[10px] uppercase font-bold py-1 px-3">cURL</TabsTrigger>
                                       <TabsTrigger value="node" className="text-[10px] uppercase font-bold py-1 px-3">Node.js</TabsTrigger>
                                       <TabsTrigger value="python" className="text-[10px] uppercase font-bold py-1 px-3">Python</TabsTrigger>
                                    </TabsList>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-muted-foreground hover:text-accent h-auto py-1"
                                      onClick={() => copyToClipboard(curlExample, item.path)}
                                    >
                                       {copied === item.path ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
                                       {copied === item.path ? "Copied" : "Copy"}
                                    </Button>
                                 </div>
                                 <TabsContent value="curl" className="mt-0">
                                    <pre className="p-6 rounded-xl bg-black text-white/80 font-mono text-xs overflow-x-auto border border-white/10">{curlExample}</pre>
                                 </TabsContent>
                                 <TabsContent value="node" className="mt-0">
                                    <pre className="p-6 rounded-xl bg-black text-white/80 font-mono text-xs overflow-x-auto border border-white/10">{nodeExample}</pre>
                                 </TabsContent>
                                 <TabsContent value="python" className="mt-0">
                                    <pre className="p-6 rounded-xl bg-black text-white/80 font-mono text-xs overflow-x-auto border border-white/10">{pythonExample}</pre>
                                 </TabsContent>
                              </Tabs>
                           </div>
                         ))}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* API Stats */}
      <section className="py-24 px-6 border-y border-border bg-card/10">
         <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-3 gap-12">
               <div className="text-center">
                  <div className="text-4xl font-mono font-bold text-foreground mb-2">1,000/hr</div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Rate Limit</p>
               </div>
               <div className="text-center">
                  <div className="text-4xl font-mono font-bold text-foreground mb-2">256MB</div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Max Payload</p>
               </div>
               <div className="text-center">
                  <div className="text-4xl font-mono font-bold text-foreground mb-2">JSON</div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Response Format</p>
               </div>
            </div>
         </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
         <div className="container mx-auto max-w-4xl">
            <h2 className="font-heading text-3xl font-bold mb-6">Need more help building?</h2>
            <p className="text-muted-foreground text-lg mb-10">Join our developer community or contact our technical support team.</p>
            <div className="flex items-center justify-center gap-4">
               <Button className="rounded-full px-8 py-6 font-bold bg-foreground text-background">Join Slack Community</Button>
               <Button variant="outline" className="rounded-full px-8 py-6 font-bold">Contact Dev Support</Button>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
};

export default ApiReference;
