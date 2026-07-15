import PageHero from "@/components/common/PageHero";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Blog = () => {
  const posts = [
    {
      slug: "ai-transforming-pm",
      title: "10 Ways AI is Transforming Project Management",
      excerpt: "From predictive deadlines to automated summaries, explore how artificial intelligence is changing the game for PMs.",
      category: "AI & Tech",
      author: "Rahul Sharma",
      date: "April 15, 2026",
      featured: true
    },
    {
      slug: "remote-team-meetings",
      title: "How to Run Effective Remote Team Meetings",
      excerpt: "Remote meetings don't have to be a drag. Learn the secrets to keeping your team engaged and productive.",
      category: "Best Practices",
      author: "Priya Patel",
      date: "April 10, 2026"
    },
    {
      slug: "introducing-cognify-pm",
      title: "Introducing CognifyPM: Our Journey",
      excerpt: "The story behind how we built the ultimate multi-company platform for modern teams.",
      category: "Company News",
      author: "Aditya Mehta",
      date: "April 5, 2026"
    },
    {
      slug: "security-best-practices",
      title: "Security Best Practices for Multi-Company Platforms",
      excerpt: "Deep dive into how we handle data isolation and encryption across complex tenant structures.",
      category: "Security",
      author: "Siddharth Raj",
      date: "March 28, 2026"
    },
    {
      slug: "productivity-tips-managers",
      title: "5 Productivity Tips for Managers in 2026",
      excerpt: "Simple habits that can save you hours every week and help your team deliver faster.",
      category: "Productivity",
      author: "Ananya Iyer",
      date: "March 20, 2026"
    },
    {
      slug: "future-of-work-collaboration",
      title: "The Future of Work is Collaborative",
      excerpt: "Why fixed structures are dying and how flexible internal platforms are taking over.",
      category: "Industry",
      author: "Vikram Sethi",
      date: "March 15, 2026"
    }
  ];

  const featuredPost = posts.find(p => p.featured);
  const recentPosts = posts.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageHero 
        category="Blog"
        title="CognifyPM Blog" 
        subtitle="Insights on productivity, project management, and the future of collaborative work."
      />

      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Featured Post */}
          {featuredPost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-20"
            >
              <Link to={`/blog/${featuredPost.slug}`} className="group grid lg:grid-cols-2 gap-12 items-center">
                <div className="relative aspect-video rounded-3xl overflow-hidden bg-card border border-border">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center font-heading text-4xl opacity-5 select-none">FEATURED</div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider">{featuredPost.category}</span>
                    <span className="text-muted-foreground text-sm flex items-center gap-1"><Calendar size={14} /> {featuredPost.date}</span>
                  </div>
                  <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6 group-hover:text-accent transition-colors leading-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 border border-border flex items-center justify-center font-bold text-accent">
                      {featuredPost.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{featuredPost.author}</div>
                      <div className="text-xs text-muted-foreground">Author</div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Search & Categories */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 pb-8 border-b border-border">
             <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input placeholder="Search articles..." className="pl-12 rounded-full py-6 bg-card/50" />
             </div>
             <div className="flex flex-wrap items-center gap-4">
                {["All", "Product Updates", "Best Practices", "AI & Tech", "Company News"].map((cat) => (
                  <Button 
                    key={cat} 
                    variant={cat === "All" ? "default" : "outline"} 
                    className="rounded-full px-5 py-2 h-auto text-xs font-bold uppercase tracking-wide"
                  >
                    {cat}
                  </Button>
                ))}
             </div>
          </div>

          {/* Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {recentPosts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={`/blog/${post.slug}`} className="group flex flex-col h-full bg-card/30 rounded-3xl border border-border overflow-hidden hover:border-accent hover:shadow-2xl transition-all duration-300">
                  <div className="aspect-video bg-muted/30 relative">
                    <div className="absolute inset-0 flex items-center justify-center font-heading text-2xl opacity-5 select-none uppercase">{post.category}</div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-accent text-[10px] font-bold uppercase tracking-widest">{post.category}</span>
                      <span className="text-muted-foreground text-[10px] uppercase tracking-widest">{post.date}</span>
                    </div>
                    <h3 className="font-heading text-xl font-bold mb-4 group-hover:text-accent transition-colors leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-grow">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 pt-6 border-t border-border mt-auto">
                      <div className="w-8 h-8 rounded-full bg-accent/5 flex items-center justify-center font-bold text-xs text-accent uppercase">
                        {post.author.charAt(0)}
                      </div>
                      <span className="text-xs font-medium">{post.author}</span>
                      <ArrowRight className="ml-auto text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" size={16} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-24 flex items-center justify-center gap-4">
             <Button variant="outline" className="rounded-full px-8 py-6 disabled:opacity-30" disabled>Previous</Button>
             <div className="px-6 py-2 rounded-full bg-card border border-border font-bold">1</div>
             <Button variant="outline" className="rounded-full px-8 py-6">Next</Button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 px-6 bg-card/20 border-y border-border">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">Stay updated</h2>
            <p className="text-muted-foreground text-lg mb-10">
              Get the latest PM insights and product updates delivered straight to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
               <Input placeholder="Enter your email" className="rounded-full py-7 px-8 bg-background shadow-inner" />
               <Button className="rounded-full py-7 px-10 bg-foreground text-background hover:bg-foreground/90 font-bold shrink-0">Subscribe</Button>
            </form>
            <p className="text-xs text-muted-foreground mt-6">We respect your privacy. Unsubscribe at any time.</p>
          </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
