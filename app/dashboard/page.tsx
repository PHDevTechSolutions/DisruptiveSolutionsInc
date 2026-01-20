"use client";

import React, { useState, useEffect, useCallback, useId } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, limit, where } from "firebase/firestore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import SignUpNewsletter from "../components/SignUpNewsletter"
import {
  Menu, X, FileSignature, ArrowRight, Sparkles, ChevronUp,
  MessageSquare, Send, Brain, Zap, Code, Facebook,
  Instagram, Linkedin, Video, ShieldCheck, User, LogOut, Plus
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
  const [userSession, setUserSession] = useState<any>(null);

  // Check session on mount
  useEffect(() => {
    const session = localStorage.getItem("disruptive_user_session");
    if (session) {
      setUserSession(JSON.parse(session));
    }
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("disruptive_user_session");
    setUserSession(null);
    window.location.reload(); // Refresh para bumalik sa default nav
  };

  const LOGO_RED = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-red-scaled.png";
  const LOGO_WHITE = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-white-scaled.png";

  const navLinks = [
    { name: "Home", href: "/dashboard" },
    { name: "Product & Solutions", href: "/lighting-products-smart-solutions" },
    { name: "Brands", href: "trusted-technology-brands" },
    { name: "Contact Us", href: "/contact-us" },
  ];

  const footerLinks = [
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact Us", href: "/contact-us" },
  ];
  const socials = [
    { icon: Facebook, href: "#", color: "hover:bg-[#1877F2]" },
    { icon: Instagram, href: "#", color: "hover:bg-[#E4405F]" },
    { icon: Linkedin, href: "#", color: "hover:bg-[#0A66C2]" },
  ];
  const brandData = [
    {
      category: "Smart Lighting",
      title: "Zumtobel's Lighting Solutions",
      description: "Global leader in premium lighting solutions, combines design, innovation and sustainability.",
      image: "https://disruptivesolutionsinc.com/wp-content/uploads/2025/11/ZUMTOBELs.png",
      href: "/lighting-products-smart-solutions"
    },
    {
      category: "Power Solutions",
      title: "Affordable Lighting That Works as Hard as You Do",
      description: "Smart lighting at smarter prices - reliable quality without compromise",
      image: "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/Lit-Rectangle-black-scaled-e1754460691526.png",
      href: "/lit-lighting-solutions"
    }
  ];

  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    // Gumawa ng query na ang 'website' ay 'disruptivesolutionsinc'
    const q = query(
      collection(db, "blogs"),
      where("website", "==", "disruptivesolutionsinc"), // Eto yung filter
      orderBy("createdAt", "desc"),
      limit(3) // Karaniwang 3 lang pinapakita sa landing page grid
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBlogs(data);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentAgent = AI_AGENTS[0];

  return (


    <div className="min-h-screen bg-[#f8f9fa] font-sans selection:bg-[#d11a2a]/10 selection:text-[#d11a2a] overflow-x-hidden">
      {/* --- NEW INDUSTRIAL MOBILE NAV (LEFT SIDE) --- */}

      <AnimatePresence>
        {isNavOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNavOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[2000] lg:hidden"
            />

            {/* Sidebar - Left Side */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="fixed top-0 left-0 h-full w-[80%] bg-[#0a0a0a] z-[2001] lg:hidden flex flex-col shadow-2xl"
            >
              {/* --- SIDEBAR HEADER (Pinalaking Logo) --- */}
              <div className="p-8 flex items-center justify-between border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
                <motion.img
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  src={LOGO_WHITE}
                  alt="Logo"
                  // Mula h-5, ginawa nating h-11 para solid ang projection sa mobile
                  className="h-11 w-auto object-contain brightness-110"
                />

                <button
                  onClick={() => setIsNavOpen(false)}
                  className="w-10 h-10 flex items-center justify-center border border-white/10 rounded-full text-white/40 hover:text-white hover:bg-[#d11a2a] hover:border-[#d11a2a] transition-all duration-300"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Horizontal List Navigation */}
              <div className="flex-grow py-4 px-2">
                {navLinks.map((link, idx) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsNavOpen(false)}
                    className="group flex items-center justify-between px-6 py-5 border-b border-white/5 relative overflow-hidden transition-all"
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <span className="text-[10px] font-mono text-[#d11a2a] opacity-50 group-hover:opacity-100">0{idx + 1}</span>
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-white group-hover:translate-x-2 transition-transform duration-300">
                        {link.name}
                      </span>
                    </div>
                    <ArrowRight size={14} className="text-white/20 group-hover:text-[#d11a2a] group-hover:translate-x-1 transition-all" />

                    {/* Hover Background Accent */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#d11a2a]/10 to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                  </Link>
                ))}

                {/* Partner Links (Slim Version) */}
                {userSession && (
                  <div className="mt-8 px-6 space-y-4">
                    <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">Internal Systems</p>
                    <div className="grid gap-2">
                      <Link href="/catalog" onClick={() => setIsNavOpen(false)} className="flex items-center gap-3 text-[10px] font-bold text-white/70 uppercase tracking-widest hover:text-[#d11a2a] transition-colors">
                        <FileSignature size={14} /> Catalog
                      </Link>
                      <Link href="/portal" onClick={() => setIsNavOpen(false)} className="flex items-center gap-3 text-[10px] font-bold text-white/70 uppercase tracking-widest hover:text-[#d11a2a] transition-colors">
                        <ShieldCheck size={14} /> Client Portal
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Contact/Action */}
              <div className="p-6 border-t border-white/5 bg-white/[0.02]">
                <Link
                  href="/quote"
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center justify-between group"
                >
                  <span className="text-[11px] font-black uppercase tracking-widest text-white">Start a Project</span>
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#d11a2a] group-hover:border-[#d11a2a] transition-all">
                    <Zap size={14} className="text-white fill-white" />
                  </div>
                </Link>

                <div className="mt-8 flex justify-between items-center opacity-30">
                  <span className="text-[8px] font-bold text-white uppercase tracking-widest italic flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> System Active
                  </span>
                  <span className="text-[8px] font-bold text-white uppercase tracking-widest">v2.0.26</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* --- 1. NAVIGATION (FROSTED GLASS / MALIWANAG STYLE) --- */}
      <nav className="fixed top-0 left-0 w-full z-[1000] py-4 transition-all duration-500">
        {/* Background Layer */}
        <motion.div
          initial={false}
          animate={{
            backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.75)" : "rgba(255, 255, 255, 0)",
            backdropFilter: isScrolled ? "blur(16px)" : "blur(0px)",
            boxShadow: isScrolled ? "0 4px 30px rgba(0, 0, 0, 0.05)" : "0 0px 0px rgba(0, 0, 0, 0)",
            height: isScrolled ? "70px" : "90px",
          }}
          className="absolute inset-0 transition-all duration-500"
        />

        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative z-10 h-full">

          {/* LOGO */}
          <div className="relative shrink-0">
            <Link href="/">
              <motion.img
                animate={{ scale: isScrolled ? 0.85 : 1 }}
                src={isScrolled ? LOGO_RED : LOGO_WHITE}
                alt="Logo"
                className="h-10 md:h-12 w-auto object-contain transition-all duration-500"
              />
            </Link>
          </div>

          {/* THE COMPACT "MAGDIDIKIT" MENU (Desktop) */}
          <motion.div
            initial={false}
            animate={{
              gap: isScrolled ? "2px" : "12px",
              backgroundColor: isScrolled ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.15)",
            }}
            className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center py-1.5 rounded-full transition-all duration-500 ease-in-out border border-white/10"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-5 py-2 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-500 rounded-full relative group ${isScrolled ? "text-gray-900" : "text-white"
                  }`}
              >
                <motion.span className="absolute inset-0 bg-[#d11a2a] rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100" />
                <span className="relative z-10 group-hover:text-white transition-colors">
                  {link.name}
                </span>
              </Link>
            ))}
          </motion.div>

          {/* RIGHT SIDE ACTIONS (Quote + Private Actions) */}
          <div className="hidden lg:flex items-center gap-4">

            {/* --- PRIVATE SECTION (Lilitaw lang kapag may disruptive_user_session) --- */}
            {userSession && (
              <div className="flex items-center gap-4 pl-4 border-l border-white/10">

                {/* 2. CATALOG BUTTON (Private) */}
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Link
                    href="/catalog"
                    className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 border-2 flex items-center gap-2 ${isScrolled
                        ? "border-gray-200 text-gray-900 hover:bg-gray-100"
                        : "border-white/20 text-white hover:bg-white/10"
                      }`}
                  >
                    <FileSignature size={14} className="text-[#d11a2a]" />
                    Catalog
                  </Link>
                </motion.div>

                {/* 3. PROFILE ICON (Private) */}
                <div className="relative group">
                  <div className="flex items-center cursor-pointer py-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isScrolled ? "border-[#d11a2a] bg-red-50" : "border-white/30 bg-white/10"
                      }`}>
                      <User size={18} className={isScrolled ? "text-[#d11a2a]" : "text-white"} />
                    </div>

                    {/* HOVER DROPDOWN CARD */}
                    <div className="absolute top-full right-0 mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[1001]">
                      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden text-left">
                        <div className="p-5 bg-gray-50 border-b border-gray-100">
                          <p className="text-[9px] font-black text-[#d11a2a] uppercase tracking-widest mb-1 italic">Active Partner</p>
                          <h4 className="text-sm font-black text-gray-900 uppercase truncate">
                            {userSession.displayName || "Disruptive User"}
                          </h4>
                          <p className="text-[10px] font-medium text-gray-400 truncate lowercase">
                            {userSession.email}
                          </p>
                        </div>

                        <div className="p-2">
                          <Link href="/portal" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-50 text-gray-600 hover:text-[#d11a2a] transition-colors">
                            <ShieldCheck size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Client Portal</span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-900 hover:text-white text-gray-400 transition-all"
                          >
                            <LogOut size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                          </button>
                        </div>

                        <div className="px-5 py-3 bg-gray-900 flex justify-between items-center">
                          <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Source</span>
                          <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">{userSession.website}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            )}
            {/* 1. FREE QUOTE BUTTON (Laging Visible - Public) */}
            <motion.div animate={{ scale: isScrolled ? 0.9 : 1 }}>
              <Link
                href="/quote"
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 shadow-xl ${isScrolled
                    ? "bg-[#d11a2a] text-white shadow-red-500/20"
                    : "bg-white text-gray-900"
                  }`}
              >
                Free Quote
              </Link>
            </motion.div>
          </div>

          {/* MOBILE TOGGLE ICON */}
          <button
            className="lg:hidden p-2 relative z-[1001]"
            onClick={() => setIsNavOpen(true)}
          >
            {/* Modern hamburger: thin lines */}
            <div className="space-y-1.5">
              <div className={`w-6 h-0.5 transition-all ${isScrolled ? "bg-black" : "bg-white"}`}></div>
              <div className={`w-4 h-0.5 transition-all ${isScrolled ? "bg-[#d11a2a]" : "bg-white/60"}`}></div>
            </div>
          </button>

        </div>
      </nav>
{/* --- 2. HERO SECTION (WITH IMAGE ON RIGHT) --- */}
<section className="relative min-h-[105vh] flex items-center bg-[#0a0a0a] overflow-hidden pt-5">
  {/* Background Elements */}
  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent" />
  <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
    style={{ 
        backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`, 
        backgroundSize: '45px 45px' 
    }} 
  />

  <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      
      {/* LEFT SIDE: Text Content */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.8 }} 
        className="text-center lg:text-left flex flex-col items-center lg:items-start"
      >
        <span className="inline-flex items-center gap-2 text-[#d11a2a] text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-6 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
          <Sparkles size={14} /> Innovation at our core
        </span>
        
        <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-8 uppercase">
          Disruptive <br /> Solutions <span className="text-[#d11a2a] italic">Inc.</span>
        </h1>
        
        <p className="text-gray-400 text-base md:text-lg max-w-xl leading-relaxed mb-10">
          We deliver premium, <span className="text-white font-semibold">future-ready lighting solutions</span> that brighten spaces, cut costs, and power smarter business across the globe.
        </p>

        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
          <Link href="/trusted-technology-brands" className="bg-[#d11a2a] text-white px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 shadow-lg shadow-red-900/20">
            Explore Products
          </Link>
        </div>
      </motion.div>

      {/* RIGHT SIDE: The Image with Floating Effect */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, x: 30 }} 
        animate={{ opacity: 1, scale: 1, x: 0 }} 
        transition={{ duration: 1, delay: 0.2 }}
        className="relative hidden lg:block"
      >
        {/* Glow behind image */}
        <div className="absolute -inset-4 bg-[#d11a2a]/20 blur-[100px] rounded-full" />
        
        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10"
        >
          
        </motion.div>
      </motion.div>

    </div>
  </div>

  {/* Smooth transition to the next section */}
  <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#f8f9fa] to-transparent z-20" />
</section>

      {/* --- 4. BRANDS SECTION (NOW WITH WRAPPED HREF) --- */}
      <section className="relative w-full bg-white overflow-hidden py-24">

        <div className="absolute inset-0 pointer-events-none opacity-[0.3]" style={{ backgroundImage: `linear-gradient(to right, #e5e7eb 1px, transparent 4px), linear-gradient(to bottom, #e5e7eb 1px, transparent 4px)`, backgroundSize: '40px 40px' }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center text-center mb-20 max-w-3xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex flex-col items-center">
              <span className="inline-flex items-center gap-2 text-[#d11a2a] text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] mb-6 bg-red-50 px-5 py-2 rounded-full border border-red-100/50">
                <Zap size={12} className="fill-[#d11a2a]" /> Premium Products
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-[-0.04em] uppercase leading-[0.9] mb-8">
                Our <br className="md:hidden" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d11a2a] to-red-500">Brands</span>
              </h2>
              <div className="h-1.5 w-16 bg-[#d11a2a] mb-8 rounded-full shadow-[0_2px_10px_rgba(209,26,42,0.3)]" />
              <p className="text-gray-500 font-medium text-xs md:text-sm leading-relaxed italic max-w-2xl">
                Empowering your space with world-class engineering and sustainable lighting solutions from our <span className="text-gray-900 font-bold">trusted global technology partners</span>.
              </p>
            </motion.div>
          </div>

          <motion.div
            className="flex flex-wrap justify-center gap-8 w-full"
            initial="hidden" whileInView="show" viewport={{ once: true }}
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.2 } } }}
          >
            {brandData.map((brand, idx) => (
              <motion.div
                key={idx}
                variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
                whileHover={{ y: -10 }}
                className="w-full md:w-[calc(50%-1rem)] lg:w-[480px]"
              >
                {/* DITO ANG ADDED HREF: WRAPPING THE ENTIRE CARD */}
                <Link href={brand.href} className="group relative h-[500px] block rounded-[32px] overflow-hidden bg-gray-900 shadow-2xl border border-gray-100 transition-all duration-500">
                  <div className="absolute inset-0 overflow-hidden">
                    <motion.img
                      src={brand.image}
                      alt={brand.title}
                      className="w-full h-full object-cover blur-[4px] brightness-[0.8] transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
                  </div>

                  <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
                    <div className="mb-4">
                      <span className="bg-[#d11a2a] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg">
                        {brand.category}
                      </span>
                    </div>
                    <div className="transform transition-transform duration-500 group-hover:translate-y-[-5px]">
                      <h3 className="text-2xl md:text-3xl font-black text-white mb-3 uppercase tracking-tighter">{brand.title}</h3>
                      <p className="text-white/90 text-xs md:text-sm leading-relaxed mb-6 line-clamp-2">{brand.description}</p>
                      <div className="flex items-center gap-3 text-white">
                        <div className="h-[2px] w-8 bg-[#d11a2a] group-hover:w-16 transition-all duration-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">View Details</span>
                        <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
{/* --- 4. INFINITE LOGO SLIDER (CLEAN & FAST) --- */}
<section className="relative py-16 md:py-24 bg-white overflow-hidden border-y border-gray-100">
  <div className="max-w-7xl mx-auto px-6">

    {/* 1. CENTERED TITLE SECTION */}
    <div className="text-center mb-10 md:mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="inline-flex items-center gap-2 text-[#d11a2a] text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] mb-4 bg-red-50 px-3 py-1 rounded-full">
          <Zap size={12} className="fill-[#d11a2a]" /> Scalable Excellence
        </span>
        <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-tight">
          Our Disruptive <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d11a2a] to-red-400">Partners</span>
        </h2>
        <div className="h-1.5 w-12 bg-[#d11a2a] mx-auto mt-6 rounded-full" />
      </motion.div>
    </div>

    {/* 2. SLIDER (NO GREY FILTER + FAST MOBILE) */}
    <div className="relative max-w-6xl mx-auto overflow-hidden">
      <motion.div
        className="flex whitespace-nowrap items-center"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          // 12s sa mobile (mabilis!), 25s sa desktop (swabe)
          duration: typeof window !== 'undefined' && window.innerWidth < 768 ? 12 : 25,
          ease: "linear",
          repeat: Infinity
        }}
      >
        {[...Array(2)].map((_, outerIdx) => (
          <div key={outerIdx} className="flex items-center shrink-0">
            {[
              "https://disruptivesolutionsinc.com/wp-content/uploads/2025/11/ZUMTOBELs.png",
              "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/Lit-Rectangle-black-scaled-e1754460691526.png",
              "https://disruptivesolutionsinc.com/wp-content/uploads/2025/11/ZUMTOBELs.png",
              "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/Lit-Rectangle-black-scaled-e1754460691526.png",
              "https://disruptivesolutionsinc.com/wp-content/uploads/2025/11/ZUMTOBELs.png",
              "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/Lit-Rectangle-black-scaled-e1754460691526.png",
            ].map((logo, innerIdx) => (
              <div
                key={innerIdx}
                className="mx-8 md:mx-16 flex items-center justify-center shrink-0"
              >
                <img
                  src={logo}
                  alt="Partner Brand"
                  // Clean classes: tinanggal ang grayscale at opacity
                  // mix-blend-multiply: tinatanggal ang white background ng image
                  className="h-12 md:h-24 w-auto object-contain mix-blend-multiply brightness-100 contrast-100"
                />
              </div>
            ))}
          </div>
        ))}
      </motion.div>

      {/* Side Fades (Para maglaho yung logos sa dulo) */}
      <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
    </div>
  </div>
</section>

      {/* --- 5. LATEST ARTICLES (CENTERED TITLE) --- */}
      <section className="relative py-24 bg-[#fcfcfc] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">

          {/* CENTERED HEADER SECTION */}
          <div className="flex flex-col items-center justify-center text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center w-full"
            >
              {/* BADGE */}
              <span className="inline-flex items-center gap-2 text-[#d11a2a] text-[11px] font-black uppercase tracking-[0.3em] mb-4 bg-red-50 px-4 py-1.5 rounded-full">
                <Zap size={12} className="fill-current" /> Knowledge Base
              </span>

              {/* TITLE */}
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-tight">
                Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d11a2a] to-red-400">Insights</span>
              </h2>

              {/* ACCENT LINE */}
              <div className="h-1.5 w-16 bg-[#d11a2a] mt-6 rounded-full" />
            </motion.div>

            {/* Explore All Link */}
            <Link href="/blog" className="mt-8 group flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#d11a2a] transition-all">
              Explore All Stories
              <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-[#d11a2a] group-hover:bg-[#d11a2a] group-hover:text-white transition-all">
                <ArrowRight size={16} />
              </div>
            </Link>
          </div>

          {/* The Grid: 3 Columns Desktop / 1 Column Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <Link href={`/blog/${blog.slug || blog.id}`} key={blog.id} className="group">
                  <div className="bg-white border border-gray-100 p-2 h-full flex flex-col transition-all duration-500 hover:shadow-[0_20px_50px_rgba(209,26,42,0.1)]">

                    {/* Image Container */}
                    <div className="relative h-56 bg-gray-50 overflow-hidden mb-6">
                      {blog.coverImage ? (
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 p-4"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 font-black italic text-[10px] uppercase">
                          No Image Available
                        </div>
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="px-4 pb-6 flex-grow flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="h-[1px] w-6 bg-[#d11a2a]" />
                        <span className="text-[#d11a2a] text-[9px] font-black uppercase tracking-widest">
                          {blog.category || "General"}
                        </span>
                      </div>

                      <h3 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter leading-tight mb-4 group-hover:text-[#d11a2a] transition-colors line-clamp-2">
                        {blog.title}
                      </h3>

                      <p className="text-gray-400 text-xs leading-relaxed mb-6 line-clamp-2 font-medium italic">
                        {blog.sections?.[0]?.description || "Click to read more about this disruptive technology update."}
                      </p>

                      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 group-hover:translate-x-2 transition-transform flex items-center gap-2">
                          Read Full Story <ArrowRight size={12} className="text-[#d11a2a]" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              // Skeleton or Placeholder kapag walang articles
              [1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl" />
              ))
            )}
          </div>
        </div>
      </section>



      {/* --- 5. MODERN FOOTER (ENHANCED & ALIGNED) --- */}
      <footer className="bg-[#0a0a0a] text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">

          {/* TOP GRID */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20 items-start">

            {/* BRAND COLUMN */}
            <div className="space-y-8">
              <img src={LOGO_WHITE} alt="Logo" className="h-12" />

              <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                The leading edge of lighting technology. Disrupting the standard to
                build a brighter, smarter world.
              </p>

              <div className="flex gap-4">
                {socials.map((soc, i) => (
                  <div
                    key={i}
                    className={`
                h-10 w-10 rounded-full
                bg-white/5 border border-white/10
                flex items-center justify-center
                cursor-pointer
                transition-all duration-300
                hover:bg-white/10 hover:-translate-y-1
                ${soc.color}
              `}
                  >
                    <soc.icon size={18} />
                  </div>
                ))}
              </div>
            </div>

            {/* QUICK LINKS */}
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-[#d11a2a]">
                Quick Links
              </h4>

              <ul className="space-y-4">
                {footerLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="
                  text-gray-400 text-sm
                  flex items-center gap-2
                  hover:text-white
                  transition-colors
                  group
                "
                    >
                      <span className="h-[2px] w-0 bg-[#d11a2a] group-hover:w-3 transition-all" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* NEWSLETTER / INSIGHTS */}
            <div className="md:col-span-2 bg-white/5 backdrop-blur-xl rounded-[32px] p-10 border border-white/10 shadow-xl flex flex-col justify-between">
              <SignUpNewsletter></SignUpNewsletter>
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-gray-500 tracking-[0.25em] uppercase">
            <p>© 2026 Disruptive Solutions Inc.</p>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="
          flex items-center gap-2
          hover:text-[#d11a2a]
          transition-all
        "
            >
              Top <ChevronUp size={16} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}