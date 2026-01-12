"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link"; 
import { motion, AnimatePresence } from "framer-motion"; 
import { ArrowRight, Loader2, ChevronUp, Facebook, Instagram, Linkedin } from "lucide-react"; 
import { db } from "@/lib/firebase"; 
// Idinagdag ang 'limit' sa import
import { collection, query, orderBy, onSnapshot, limit, where } from "firebase/firestore";

// Inayos ang parenthesis dito
export default function BlogPage() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
     const LOGO_WHITE = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-white-scaled.png";
    // FETCH REAL BLOGS FROM FIREBASE
    useEffect(() => {
        const q = query(
            collection(db, "blogs"), 
            orderBy("createdAt", "desc"), 
            where("website", "==", "Disruptive"),
            limit(6) // Ginawa nating 6 para mas marami makita sa listahan
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedBlogs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setBlogs(fetchedBlogs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

      const socials = [
    { icon: Facebook, href: "#", color: "hover:bg-[#1877F2]" },
    { icon: Instagram, href: "#", color: "hover:bg-[#E4405F]" },
    { icon: Linkedin, href: "#", color: "hover:bg-[#0A66C2]" },
  ];

    const footerLinks = [
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact Us", href: "/contact-us" },
  ];

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-[#d11a2a]" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-[#d11a2a]/10 selection:text-[#d11a2a] overflow-x-hidden">
            
            {/* --- SIMPLE NAV FOR BLOG PAGE --- */}
            <nav className="fixed top-0 left-0 w-full z-[1000] py-6 bg-white/80 backdrop-blur-md border-b border-gray-50">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <Link href="/">
                        <span className="font-black uppercase italic tracking-tighter text-2xl">
                            Disruptive <span className="text-[#d11a2a]">Blog</span>
                        </span>
                    </Link>
                    <Link href="/" className="text-[10px] font-black uppercase tracking-widest hover:text-[#d11a2a] transition-colors">
                        Back to Home
                    </Link>
                </div>
            </nav>

            <section className="relative pt-48 pb-32 px-6">
                {/* Engineering Grid Background */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.3]"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                    }}
                />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="mb-24">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <span className="text-[#d11a2a] text-[10px] font-black uppercase tracking-[0.5em] mb-4 block italic">Knowledge Base</span>
                            <h1 className="text-6xl md:text-7xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                                OUR DISRUPTIVE<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d11a2a] to-gray-400">BLOGS</span>
                            </h1>
                        </motion.div>
                    </div>
{/* DYNAMIC BLOG GRID */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-4 md:px-10">
    {blogs.map((blog) => (
        <Link href={`/blog/${blog.slug || blog.id}`} key={blog.id} className="group">
            {/* BOX DESIGN: Sharp corners (rounded-none) at walang shadow lift para sa steady look */}
            <div className="bg-white rounded-none overflow-hidden shadow-md border border-gray-100 flex flex-col h-full transition-all duration-300 hover:shadow-xl">
                
                {/* --- UPPER SECTION: IMAGE CONTAINER --- */}
                {/* Tinanggal ang bg color para walang "red" na sumisilip kung transparent ang image */}
                <div className="relative h-64 bg-white overflow-hidden flex items-center justify-center">
                    
                    {/* IMAGE FIX: Gamit ang object-contain para HINDI PUTOL ang image */}
                    {blog.coverImage ? (
                        <img 
                            src={blog.coverImage} 
                            alt={blog.title} 
                            /* object-contain para siguradong kita ang buong image */
                            /* w-full h-full para sakop ang buong box area */
                            className="w-full h-full object-contain p-2" 
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold uppercase italic">
                            No Image
                        </div>
                    )}
                </div>

                {/* --- LOWER SECTION: CONTENT --- */}
                <div className="p-8 flex flex-col flex-grow bg-white border-t border-gray-50">
                    {/* Category Label with Star */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-orange-500 text-xs">★</span>
                        <span className="text-[#d11a2a] text-[10px] font-black uppercase tracking-[0.2em]">
                            {blog.category || "INDUSTRY NEWS"}
                        </span>
                    </div>

                    {/* Title Style: PABLO STYLE (Bold, Italic, Red) */}
                    <h3 className="text-2xl font-black text-[#d11a2a] mb-4 uppercase italic tracking-tighter leading-tight">
                        {blog.title}
                    </h3>

                    {/* Short Description */}
                    <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-2 font-medium italic">
                        {blog.sections?.[0]?.description || "try nga natin ito"}
                    </p>

                    {/* READ MORE Section */}
                    <div className="mt-auto">
                        <span className="text-[#d11a2a] font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-2 group-hover:gap-4 transition-all">
                            READ MORE 
                            <span className="text-lg">→</span>
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    ))}
</div>
                </div>
            </section>

 {/* --- 4. FOOTER --- */}
      <footer className="bg-[#0a0a0a] text-white pt-32 pb-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-24">
            
            <div className="md:col-span-1 space-y-10">
              <img src={LOGO_WHITE} alt="Logo" className="h-12" />
              <p className="text-gray-500 text-sm leading-relaxed italic">
                The convergence of light and intelligent engineering. Disrupting the standard since 2026.
              </p>
              <div className="flex gap-4">
                {socials.map((soc, i) => (
                  <Link key={i} href={soc.href} className={`h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 hover:bg-[#d11a2a] group`}>
                    <soc.icon size={18} className={`transition-colors group-hover:text-white text-gray-400`} />
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#d11a2a]">Navigation</h4>
              <ul className="space-y-4">
                {footerLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:text-white transition-all group">
                      <span className="h-[1px] w-0 bg-[#d11a2a] group-hover:w-4 transition-all" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2 bg-white/5 backdrop-blur-2xl rounded-[40px] p-12 border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">Newsletter</h4>
                <p className="text-gray-400 text-sm mb-8 max-w-sm">Get exclusive engineering insights and smart solution updates.</p>
                <div className="flex bg-black/40 p-2 rounded-2xl border border-white/10 focus-within:border-[#d11a2a]/50 transition-all">
                  <input type="email" placeholder="Business Email" className="bg-transparent flex-1 px-4 py-2 text-sm outline-none text-white" />
                  <button className="bg-[#d11a2a] px-6 py-3 rounded-xl hover:bg-white hover:text-black transition-all group/btn flex items-center gap-2 text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest">Join</span>
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#d11a2a]/10 rounded-full blur-[100px] group-hover:bg-[#d11a2a]/20 transition-all duration-1000" />
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">© 2026 Disruptive Solutions Inc.</p>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#d11a2a] transition-all group">
              Scroll to Top <div className="p-3 bg-white/5 rounded-full group-hover:bg-[#d11a2a] group-hover:text-white transition-all"><ChevronUp size={16} /></div>
            </button>
          </div>
        </div>
      </footer>
        </div>
    );
}