import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

const BlogPost = () => {
  const { slug } = useParams();

  // Mock data for the specific post
  const post = {
    title: "10 Ways AI is Transforming Project Management",
    category: "AI & Tech",
    author: "Rahul Sharma",
    date: "April 15, 2026",
    content: `
      <p>The landscape of project management is shifting rapidly. In 2026, AI is no longer a futuristic concept but a core component of how high-performing teams operate. At CognifyPM, we've integrated these advancements to help you work smarter.</p>
      
      <h2>1. Predictive Timelines</h2>
      <p>Gone are the days of manual estimations based on gut feeling. Modern AI analyzes past project performance, team capacity, and historical blockers to predict realistic deadlines with up to 95% accuracy.</p>
      
      <h2>2. Automated Resource Allocation</h2>
      <p>AI can now identify which team members are over-burdened and automatically suggest redistribution of tasks to ensure no one burns out while maintaining peak velocity.</p>
      
      <h2>3. Intelligent Risk Detection</h2>
      <p>By monitoring project indicators in real-time, AI can spot potential risks—like scope creep or communication gaps—weeks before they become critical issues.</p>
      
      <blockquote>
        "The future of project management isn't about replacing managers with machines, but about augmenting their capabilities with intelligent data."
      </blockquote>
      
      <p>As we continue to develop CognifyPM, we're focused on making these tools accessible to everyone, from small startups to global enterprises. The goal is simple: less time spent on administration, more time spent on innovation.</p>
    `
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <article className="pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-3xl">
          {/* Back Link */}
          <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-12 group transition-colors">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider">{post.category}</span>
              <span className="text-muted-foreground text-sm flex items-center gap-1"><Calendar size={14} /> {post.date}</span>
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-10 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center justify-between pb-10 border-b border-border mb-12">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 border border-border flex items-center justify-center font-bold text-accent text-lg">
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold">{post.author}</div>
                    <div className="text-sm text-muted-foreground">Product Specialist</div>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                 <Button variant="outline" size="icon" className="rounded-full"><Twitter size={18} /></Button>
                 <Button variant="outline" size="icon" className="rounded-full"><Linkedin size={18} /></Button>
                 <Button variant="outline" size="icon" className="rounded-full"><Share2 size={18} /></Button>
               </div>
            </div>
            
            {/* Post Content */}
            <div 
              className="prose prose-lg dark:prose-invert max-w-none 
                prose-headings:font-heading prose-headings:font-bold prose-headings:tracking-tight
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-card/30 prose-blockquote:py-2 prose-blockquote:px-8 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-foreground
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              "
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </motion.div>
          
          {/* Bottom Share */}
          <div className="mt-20 pt-10 border-t border-border">
             <div className="flex flex-col items-center justify-center">
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Share this article</p>
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="rounded-full px-8 py-6 flex items-center gap-2">
                    <Twitter size={18} /> Twitter
                  </Button>
                  <Button variant="outline" className="rounded-full px-8 py-6 flex items-center gap-2">
                    <Linkedin size={18} /> LinkedIn
                  </Button>
                </div>
             </div>
          </div>
        </div>
      </article>

      {/* Suggested Posts */}
      <section className="py-24 px-6 bg-card/20 border-t border-border">
        <div className="container mx-auto max-w-6xl">
           <h2 className="font-heading text-3xl font-bold mb-12 text-center">More from the blog</h2>
           <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: "How to Run Effective Remote Team Meetings", date: "April 10, 2026", cat: "Best Practices", author: "Priya Patel" },
                { title: "Introducing CognifyPM: Our Journey", date: "April 5, 2026", cat: "Company News", author: "Aditya Mehta" }
              ].map((p) => (
                <div key={p.title} className="p-8 rounded-2xl border border-border bg-background hover:border-accent hover:shadow-xl transition-all group">
                   <div className="text-accent text-[10px] font-bold uppercase tracking-widest mb-3">{p.cat}</div>
                   <h3 className="font-heading text-xl font-bold mb-4 group-hover:text-accent transition-colors">{p.title}</h3>
                   <div className="flex items-center justify-between text-muted-foreground text-xs uppercase tracking-widest py-4 border-t border-border/50">
                      <span>{p.date}</span>
                      <span>By {p.author}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPost;
