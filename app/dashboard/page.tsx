"use client";

import React, { useState, useEffect, useCallback, useId } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import SignUpNewsletter from "../components/SignUpNewsletter"
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
  Code,
  Facebook, Instagram, Linkedin, Video
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
      image: "https://disruptivesolutionsinc.com/wp-content/uploads/2025/11/ZUMTOBELs.png"
    },
    {
      category: "Power Solutions",
      title: "Affordable Lighting That Works as Hard as You Do",
      description: "Smart lighting at smarter prices - reliable quality without compromise",
      image: "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/Lit-Rectangle-black-scaled-e1754460691526.png"
    }
  ];

  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    // Kinukuha lang ang TOP 3 pinakabagong blogs
    const q = query(
      collection(db, "blogs"),
      orderBy("createdAt", "desc"),
      limit(3) // LIMIT TO 3 ONLY
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBlogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBlogs(fetchedBlogs);
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

      {/* --- 1. NAVIGATION (FROSTED GLASS / MALIWANAG STYLE) --- */}
      <nav className="fixed top-0 left-0 w-full z-[1000] py-4 transition-all duration-500">
        {/* Background Layer: Dito ang "Maliwanag" effect */}
        <motion.div
          initial={false}
          animate={{
            // Kapag scrolled: maputi na semi-transparent (parang frosted glass)
            // Kapag hindi scrolled: full transparent
            backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.75)" : "rgba(255, 255, 255, 0)",
            backdropFilter: isScrolled ? "blur(16px)" : "blur(0px)",
            boxShadow: isScrolled ? "0 4px 30px rgba(0, 0, 0, 0.05)" : "0 0px 0px rgba(0, 0, 0, 0)",
            borderBottom: isScrolled ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid rgba(255, 255, 255, 0)",
            height: isScrolled ? "70px" : "90px", // Nababawasan ang taas pag nag-scroll
          }}
          className="absolute inset-0 transition-all duration-500"
        />

        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative z-10 h-full">

          {/* LOGO */}
          <div className="relative">
            <Link href="/">
              <motion.img
                animate={{ scale: isScrolled ? 0.85 : 1 }}
                // Dahil maliwanag ang BG, RED logo ang gagamitin natin pag scrolled para kita agad
                src={isScrolled ? LOGO_RED : LOGO_WHITE}
                alt="Logo"
                className="h-12 w-auto object-contain transition-all duration-500"
              />
            </Link>
          </div>

          {/* THE COMPACT "MAGDIDIKIT" MENU (White/Glass Style) */}
          <motion.div
            initial={false}
            animate={{
              gap: isScrolled ? "2px" : "12px",
              // Mas madilim ng konti ang capsule pag malinaw ang main nav bg
              backgroundColor: isScrolled ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.15)",
              paddingLeft: isScrolled ? "6px" : "16px",
              paddingRight: isScrolled ? "6px" : "16px",
              border: isScrolled ? "1px solid rgba(0, 0, 0, 0.05)" : "1px solid rgba(255, 255, 255, 0.2)",
            }}
            className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center py-1.5 rounded-full transition-all duration-500 ease-in-out"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-5 py-2 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-500 rounded-full relative group ${isScrolled ? "text-gray-900" : "text-white"
                  }`}
              >
                {/* Sliding Red Hover Effect */}
                <motion.span
                  className="absolute inset-0 bg-[#d11a2a] rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100"
                />
                <span className="relative z-10 group-hover:text-white transition-colors">
                  {link.name}
                </span>
              </Link>
            ))}
          </motion.div>

          {/* RIGHT SIDE BUTTON */}
          <div className="hidden lg:block">
            <motion.div animate={{ scale: isScrolled ? 0.9 : 1 }}>
              <Link
                href="/quote"
                className={`px-7 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-500 shadow-xl ${isScrolled
                  ? "bg-[#d11a2a] text-white shadow-red-500/20"
                  : "bg-white text-gray-900"
                  }`}
              >
                Free Quote
              </Link>
            </motion.div>
          </div>

          {/* MOBILE TOGGLE ICON */}
          <button className="lg:hidden p-2" onClick={() => setIsNavOpen(true)}>
            <Menu className={isScrolled ? "text-gray-900" : "text-white"} size={28} />
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
      <section className="relative w-full bg-white overflow-hidden py-24">
        {/* Subtle Engineering Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.3]"
          style={{
            backgroundImage: `
        linear-gradient(to right, #e5e7eb 1px, transparent 4px),
        linear-gradient(to bottom, #e5e7eb 1px, transparent 4px)
      `,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">

          {/* --- BRAND SECTION HEADER (CENTERED & OPTIMIZED) --- */}
          <div className="flex flex-col items-center justify-center text-center mb-20 max-w-3xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Mas smooth na "Out-Expo" ease
              className="flex flex-col items-center"
            >
              {/* BADGE */}
              <span className="inline-flex items-center gap-2 text-[#d11a2a] text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] mb-6 bg-red-50 px-5 py-2 rounded-full border border-red-100/50">
                <Zap size={12} className="fill-[#d11a2a]" /> Premium Products
              </span>

              {/* TITLE */}
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-[-0.04em] uppercase leading-[0.9] mb-8">
                Our <br className="md:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d11a2a] to-red-500">
                  Brands
                </span>
              </h2>

              {/* ACCENT LINE */}
              <div className="h-1.5 w-16 bg-[#d11a2a] mb-8 rounded-full shadow-[0_2px_10px_rgba(209,26,42,0.3)]" />

              {/* DESCRIPTION */}
              <p className="text-gray-500 font-medium text-xs md:text-sm leading-relaxed italic max-w-2xl">
                Empowering your space with world-class engineering and sustainable lighting solutions
                from our <span className="text-gray-900 font-bold">trusted global technology partners</span>.
              </p>
            </motion.div>
          </div>

          {/* CENTERED GRID */}
          <motion.div
            className="flex flex-wrap justify-center gap-8 w-full"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.2 },
              },
            }}
          >
            {brandData.map((brand, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
                }}
                whileHover={{ y: -10 }}
                className="group relative h-[500px] w-full md:w-[calc(50%-1rem)] lg:w-[480px] rounded-[32px] overflow-hidden bg-gray-900 shadow-2xl border border-gray-100 transition-all duration-500"
              >
                {/* Image Layer - FIXED BLUR (HINDI NAWAWALA) */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.img
                    src={brand.image}
                    alt={brand.title}
                    // Ginamit ang blur-[4px] para sakto lang ang labo. 
                    // Tinanggal ang group-hover:blur-none para manatiling blurred.
                    className="w-full h-full object-cover blur-[4px] brightness-[0.8] transition-transform duration-1000 group-hover:scale-110"
                  />
                  {/* Dark Gradient Overlay - Permanent readability */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
                  <div className="mb-4">
                    <span className="bg-[#d11a2a] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg">
                      {brand.category}
                    </span>
                  </div>

                  <div className="transform transition-transform duration-500 group-hover:translate-y-[-5px]">
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-3 uppercase tracking-tighter">
                      {brand.title}
                    </h3>
                    <p className="text-white/90 text-xs md:text-sm leading-relaxed mb-6 line-clamp-2 group-hover:text-white transition-colors">
                      {brand.description}
                    </p>

                    <div className="flex items-center gap-3 text-white">
                      <div className="h-[2px] w-8 bg-[#d11a2a] group-hover:w-16 transition-all duration-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                        View Details
                      </span>
                      <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* --- 4. INFINITE LOGO SLIDER (CENTERED & CONTROLLED WIDTH) --- */}
      <section className="relative py-24 bg-white overflow-hidden border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">

          {/* 1. CENTERED TITLE SECTION */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 text-[#d11a2a] text-[11px] font-black uppercase tracking-[0.3em] mb-4 bg-red-50 px-3 py-1 rounded-full">
                <Zap size={12} className="fill-current" /> Scalable Excellence
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-tight">
                Our Disruptive <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d11a2a] to-red-400">Partners</span>
              </h2>
              <div className="h-1.5 w-15 bg-[#d11a2a] mx-auto mt-6 rounded-full " />
            </motion.div>
          </div>

          {/* 2. CONTROLLED WIDTH SLIDER CONTAINER */}
          {/* Ginamit ang max-w-5xl para hindi masyadong malapad ang slider sa desktop */}
          <div className="relative max-w-6xl mx-auto overflow-hidden">
            <motion.div
              className="flex whitespace-nowrap items-center"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                duration: 30,
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
                      className="mx-10 md:mx-16 flex items-center justify-center shrink-0"
                    >
                      <img
                        src={logo}
                        alt="Partner Brand"
                        className="h-16 md:h-28 w-auto object-contain hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>

            {/* Subtle Side Fades */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-50 via-gray-50/40 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-50 via-gray-50/40 to-transparent z-10 pointer-events-none" />
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

              {/* TITLE - Inalis ang <br /> para hindi magpatong */}
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-tight whitespace-nowrap">
                Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d11a2a] to-red-400">Insights</span>
              </h2>

              {/* ACCENT LINE */}
              <div className="h-1.5 w-16 bg-[#d11a2a] mt-6 rounded-full" />
            </motion.div>

            {/* Explore All Link - Inilagay sa ilalim ng title para centered pa rin ang focus */}
            <Link href="/blog" className="mt-8 group flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#d11a2a] transition-all">
              Explore All Stories
              <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-[#d11a2a] group-hover:bg-[#d11a2a] group-hover:text-white transition-all">
                <ArrowRight size={16} />
              </div>
            </Link>
          </div>

          {/* The Grid: 3 Columns Desktop / 1 Column Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {blogs.map((blog) => (
              <Link href={`/blog/${blog.slug || blog.id}`} key={blog.id} className="group">
                <div className="bg-white border border-gray-100 p-2 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(209,26,42,0.1)] h-full flex flex-col">

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
            ))}
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