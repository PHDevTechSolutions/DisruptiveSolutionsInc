"use client";

import React, { useState, useEffect, useCallback, useId } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { 
  Menu, 
  X, 
  FileSignature, 
  ArrowRight, 
  Sparkles, 
  ChevronUp,
  MessageSquare,
  Send,
  Brain,
  Zap,
  Code
} from "lucide-react";

// --- MOCK UI COMPONENTS (Para sa Chat Widget) ---
const Avatar = ({ children, className }: any) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>
);
const AvatarImage = ({ src }: any) => <img src={src} className="aspect-square h-full w-full" />;
const AvatarFallback = ({ children, className }: any) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 ${className}`}>{children}</div>
);
const cn = (...classes: any) => classes.filter(Boolean).join(" ");

// --- AI AGENTS DATA ---
const AI_AGENTS = [
  { id: "gpt4", name: "Disruptive AI", role: "Smart Lighting Expert", avatar: "https://github.com/shadcn.png", status: "online", icon: Sparkles, gradient: "from-red-500/20 to-rose-500/20" },
  { id: "gemini", name: "Sales Pro", role: "Quotation Assistant", avatar: "https://github.com/shadcn.png", status: "online", icon: Zap, gradient: "from-blue-500/20 to-cyan-500/20" },
];

export default function DisruptiveLandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false); // Mobile Nav Toggle
  const [isChatOpen, setIsChatOpen] = useState(false); // Chat Widget Toggle
  const [message, setMessage] = useState("");
  const pathname = usePathname();

  const LOGO_RED = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-red-scaled.png";
  const LOGO_WHITE = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-white-scaled.png";

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products & Solutions", href: "/lighting-products-smart-solutions" },
    { name: "Brands", href: "/trusted-technology-brands" },
    { name: "Contact Us", href: "/contact-us" },
  ];

  const footerLinks = [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact Us", href: "/contact-us" },
  ];

  const brandData = [
    {
      category: "Smart Lighting",
      title: "Zumtobel's Lighting Solutions",
      description: "Global leader in premium lighting solutions, combines design, innovation and sustainability.",
      image: "https://disruptivesolutionsinc.com/wp-content/uploads/2025/11/ZUMTOBELs.png"
    },
    {
      category: "Power Solutions",
      title: "Affordable Lighting That Works as Hard as You Do",
      description: "Smart lighting at smarter prices - reliable quality without compromise",
      image: "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/Lit-Rectangle-black-scaled-e1754460691526.png"
    }
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentAgent = AI_AGENTS[0];

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans selection:bg-[#d11a2a]/10 selection:text-[#d11a2a] overflow-x-hidden">
      
      {/* --- 1. NAVIGATION --- */}
      <nav className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-300 ${isScrolled ? "bg-white shadow-md py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative">
          <div className="relative z-10">
            <Link href="/">
              <img src={isScrolled ? LOGO_RED : LOGO_WHITE} alt="Logo" className="h-10 md:h-12 w-auto transition-all duration-300 object-contain" />
            </Link>
          </div>

          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-10">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className={`text-[13px] font-bold uppercase tracking-widest transition-all duration-300 hover:scale-105 ${isScrolled ? "text-gray-700 hover:text-[#d11a2a]" : "text-white/90 hover:text-white"}`}>
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:block relative z-10">
            <Link href="/quote" className={`px-7 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg ${isScrolled ? "bg-[#d11a2a] text-white hover:bg-[#b11422]" : "bg-white text-gray-900 hover:bg-gray-100"}`}>
              Get Your Free Quote
            </Link>
          </div>

          <button className="lg:hidden p-2 relative z-10" onClick={() => setIsNavOpen(true)}>
            <Menu className={isScrolled ? "text-gray-800" : "text-white"} size={28} />
          </button>
        </div>
      </nav>
      
      {/* --- 2. HERO SECTION --- */}
      <section className="relative h-[85vh] flex items-center bg-[#111] overflow-hidden ">
        <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1513506494265-99b15e8c0dc0?q=80&w=2070')` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#f8f9fa] z-[2]" />
        
        <div className="max-w-7xl w-full px-6 md:px-12 relative z-10 ml-20 mt-22">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-left">
            <span className="inline-flex items-center gap-2 text-[#d11a2a] text-xs font-bold tracking-widest uppercase mb-4 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
              <Sparkles size={14} /> Innovation at our core
            </span>
            <h1 className="text-white text-5xl md:text-7xl font-black leading-[1.1] tracking-tighter mb-6 uppercase">
              Disruptive <br /> Solutions <span className="text-[#d11a2a]">Inc.</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-xl leading-relaxed mb-8">
              We deliver premium, <span className="text-white font-medium">future-ready lighting solutions</span> that brighten spaces, cut costs, and power smarter business across the globe.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- 3. BRANDS SECTION --- */}
      <section className="py-20 px-6 bg-[#f8f9fa]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 text-left">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2 uppercase text-left">
              Our <span className="text-[#d11a2a]">Brands</span>
            </h2>
            <div className="h-1 w-12 bg-[#d11a2a] rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {brandData.map((brand, idx) => (
              <motion.div key={idx} whileHover={{ y: -5 }} className="group bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-500 flex flex-col">
                <div className="h-[200px] md:h-[230px] overflow-hidden relative">
                  <img src={brand.image} alt={brand.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/95 backdrop-blur-sm text-[#d11a2a] text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                      {brand.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-[#d11a2a] transition-colors">{brand.title}</h3>
                  <p className="text-gray-500 text-[13px] md:text-sm leading-relaxed mb-6 line-clamp-2">{brand.description}</p>
                  <div className="flex items-center gap-2 text-[#d11a2a] font-bold text-[10px] uppercase tracking-wider">
                    Learn More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 4. FLOATING CHAT WIDGET (FROM DASHBOARD) --- */}
      <div className="fixed bottom-6 right-6 z-[2000] flex flex-col items-end gap-4">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-[350px] md:w-[380px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl backdrop-blur-xl"
            >
              {/* Header */}
              <div className={cn("relative p-4 overflow-hidden bg-gradient-to-br", currentAgent.gradient)}>
                <div className="relative flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white">
                      <AvatarImage src={currentAgent.avatar} />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{currentAgent.name}</h3>
                      <span className="text-[10px] text-gray-500 font-bold uppercase">{currentAgent.role}</span>
                    </div>
                  </div>
                  <button onClick={() => setIsChatOpen(false)} className="h-8 w-8 rounded-full hover:bg-white/50 flex items-center justify-center">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Chat Area */}
              <div className="h-[300px] overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50/30">
                <div className="flex gap-3">
                  <div className="rounded-2xl rounded-tl-none bg-white border border-gray-100 px-4 py-2 text-sm text-gray-700 shadow-sm">
                    Hello! I'm {currentAgent.name}. How can I assist you with your project today?
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-100">
                <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); setMessage(""); }}>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Message ${currentAgent.name}...`}
                    className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#d11a2a]/20"
                  />
                  <button className="h-10 w-10 rounded-full bg-[#d11a2a] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={cn(
            "h-14 w-14 flex items-center justify-center rounded-full shadow-2xl transition-all duration-300",
            isChatOpen ? "bg-gray-900 text-white" : "bg-[#d11a2a] text-white"
          )}
        >
          {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </motion.button>
      </div>

      {/* --- 5. FOOTER --- */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <img src={LOGO_RED} alt="Logo" className="h-13 opacity-80" />
          <div className="flex flex-wrap justify-center gap-8">
            {footerLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-[13px] font-bold text-[#d11a2a] uppercase tracking-widest hover:text-gray-900 transition-colors">
                {link.name}
              </Link>
            ))}
          </div>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="p-3 bg-gray-50 rounded-full hover:bg-[#d11a2a] hover:text-white transition-all group">
            <ChevronUp size={20} />
          </button>
        </div>
        <div className="bg-[#d11a2a] py-4 text-center">
          <p className="text-[11px] font-bold text-white uppercase tracking-widest">
            © 2026 Disruptive Solutions Inc. — All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}