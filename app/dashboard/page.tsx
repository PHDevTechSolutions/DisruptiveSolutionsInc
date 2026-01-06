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
    { name: "Product & Solutions", href: "" },
    { name: "Brands", href: "" },
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

          {/* Section Header */}
          <div className="text-center mb-16 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[#d11a2a] text-[10px] font-black uppercase tracking-[0.4em] mb-3 block">
                Premium Products
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-tight mb-6">
                Our <span className="text-[#d11a2a]">Brands</span>
              </h2>
              <div className="h-1 w-12 bg-[#d11a2a] mx-auto mb-6 rounded-full" />
              <p className="text-gray-500 font-medium text-sm md:text-base leading-relaxed">
                Empowering your space with world-class engineering and sustainable lighting solutions
                from our trusted global technology partners.
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
      {/* --- 4. INFINITE LOGO SLIDER (PALAKI & DASHBOARD STYLE) --- */}
      <section className="relative py-24 bg-white overflow-hidden border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-16">
            <div className="max-w-2xl">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <span className="inline-flex items-center gap-2 text-[#d11a2a] text-[11px] font-black uppercase tracking-[0.3em] mb-4 bg-red-50 px-3 py-1 rounded-full">
                  <Zap size={12} className="fill-current" /> Scalable Excellence
                </span>
                <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                  Our Disruptive <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d11a2a] to-red-400">Global Network</span>
                </h2>
              </motion.div>
            </div>
            <div className="flex gap-8 md:gap-16">
              {[{ label: "Partner Brands", value: "15+" }, { label: "Smart Projects", value: "250+" }].map((stat, i) => (
                <div key={i} className="text-right">
                  <div className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter italic">{stat.value}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex overflow-hidden py-10 bg-gray-50/50">
          <motion.div className="flex whitespace-nowrap" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 25, ease: "linear", repeat: Infinity }}>
            {[...Array(2)].map((_, outerIdx) => (
              <div key={outerIdx} className="flex items-center">
                {[
                  "https://disruptivesolutionsinc.com/wp-content/uploads/2025/11/ZUMTOBELs.png",
                  "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/Lit-Rectangle-black-scaled-e1754460691526.png",
                  "https://disruptivesolutionsinc.com/wp-content/uploads/2025/11/ZUMTOBELs.png",
                  "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/Lit-Rectangle-black-scaled-e1754460691526.png",
                  "https://disruptivesolutionsinc.com/wp-content/uploads/2025/11/ZUMTOBELs.png",
                  "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/Lit-Rectangle-black-scaled-e1754460691526.png",
                ].map((logo, innerIdx) => (
                  <div key={innerIdx} className="mx-16 flex items-center justify-center group/logo">
                    <img src={logo} alt="Partner" className="h-16 md:h-24 w-auto object-contain grayscale opacity-30 group-hover/logo:grayscale-0 group-hover/logo:opacity-100 group-hover/logo:scale-110 transition-all duration-700" />
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
          <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />
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
              <div>
                <h4 className="text-xl font-black uppercase tracking-tight mb-3">
                  Industry Insights
                </h4>

                <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
                  Receive curated updates on smart lighting innovations, engineering
                  breakthroughs, and industry best practices — delivered straight to
                  your inbox.
                </p>

                <div className="flex items-center gap-2 bg-black/40 p-2 rounded-2xl border border-white/10">
                  <input
                    type="email"
                    placeholder="Enter your business email"
                    className="
                bg-transparent flex-1 px-4 py-2
                text-sm text-white
                placeholder:text-gray-500
                outline-none
              "
                  />

                  <button
                    className="
                group flex items-center gap-2
                bg-[#d11a2a] px-4 py-3 rounded-xl
                hover:bg-[#b11422]
                transition-all duration-300
                shadow-lg
              "
                  >
                    <span className="hidden md:block text-[10px] font-black uppercase tracking-widest">
                      Subscribe
                    </span>
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-gray-500 mt-4">
                We respect your privacy. No spam, unsubscribe anytime.
              </p>
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