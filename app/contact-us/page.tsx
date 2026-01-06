"use client";
import {
    Map,
    MapMarker,
    MapPopup,
    MapTileLayer,
    MapZoomControl,
} from "@/components/ui/map"
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Menu, Mail, Phone, MapPin, Send, ChevronUp, Sparkles, ArrowRight,
  Facebook, Instagram, Linkedin, Video 
} from "lucide-react";

export default function ContactUsPage() {
    const [isNavOpen, setIsNavOpen] = useState(false); // Mobile Nav Toggle
  const [isScrolled, setIsScrolled] = useState(false);

  const LOGO_RED = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-red-scaled.png";
  const LOGO_WHITE = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-white-scaled.png";

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Product & Solutions", href: "/lighting-products-smart-solutions" },
    { name: "Brands", href: "/trusted-technology-brands" },
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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#d11a2a]/10 selection:text-[#d11a2a]">
      
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
          className={`px-5 py-2 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-500 rounded-full relative group ${
            isScrolled ? "text-gray-900" : "text-white"
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
          className={`px-7 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-500 shadow-xl ${
            isScrolled 
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
      <section className="relative pt-44 pb-32 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-white text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-8"
          >
            Connect <br /> with <span className="text-[#d11a2a]">Expertise.</span>
          </motion.h1>
          <p className="text-gray-400 max-w-xl mx-auto text-lg font-medium">Ready to light up your next project? Our engineers and designers are one message away.</p>
        </div>
      </section>

      {/* --- 3. CONTACT FORM SECTION HERO BLOCK --- */}
      <section className="relative z-20 -mt-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* HERO CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { title: "Quick Response", desc: "Replies within 24 hours", icon: Sparkles },
              { title: "Direct Line", desc: "Speak with our engineers", icon: Phone },
              { title: "Global Reach", desc: "Supporting projects worldwide", icon: MapPin },
            ].map((item, i) => (
              <motion.div key={i} whileHover={{ y: -5 }} className="bg-white p-8 rounded-[32px] shadow-xl border border-gray-100 flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center text-[#d11a2a]"><item.icon size={28}/></div>
                <div>
                  <h4 className="font-black uppercase text-sm text-gray-900 tracking-tight">{item.title}</h4>
                  <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
            {/* LEFT SIDE: INFO & MAP */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-gray-50 p-10 rounded-[40px] border border-gray-100">
                <h3 className="text-2xl font-black uppercase tracking-tight mb-8">Find <span className="text-[#d11a2a]">Us</span></h3>
                <div className="space-y-6 mb-10">
                  <div className="flex gap-4">
                    <Mail className="text-[#d11a2a] shrink-0" size={20} />
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                        <p className="font-bold text-gray-900">info@disruptive.com</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Phone className="text-[#d11a2a] shrink-0" size={20} />
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Support</p>
                        <p className="font-bold text-gray-900">0917 527 8819 / 0917 556 1105 </p>
                    </div>
                  </div>
                </div>

                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Follow Our Journey</h4>
                <div className="flex gap-3">
                  {socials.map((soc, i) => (
                    <a 
                      key={i} 
                      href={soc.href} 
                      className={`h-11 w-11 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-200 transition-all duration-300 hover:text-white ${soc.color}`}
                    >
                      <soc.icon size={18} />
                    </a>
                  ))}
                </div>
              </div>

<Map center={[14.6053, 121.0527]}>
    <MapTileLayer />
    <MapZoomControl />
    <MapMarker position={[14.6019, 121.0590]}>
        <MapPopup>
          <div className="p-2">
            <h3 className="font-black text-[#d11a2a] uppercase text-xs">Primex Tower</h3>
            <p className="text-[10px] text-gray-500">EDSA, San Juan, Metro Manila</p>
          </div>
        </MapPopup>
    </MapMarker>
</Map>
            </div>

            {/* RIGHT SIDE: FORM */}
            <div className="lg:col-span-8 bg-white p-8 md:p-14 rounded-[50px] shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-gray-50">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-3 block ml-2">Full Name</label>
                  <input type="text" placeholder="" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#d11a2a]/20 outline-none transition-all font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-3 block ml-2">Email Address</label>
                  <input type="email" placeholder="" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#d11a2a]/20 outline-none transition-all font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-3 block ml-2">Confirm Email</label>
                  <input type="email" placeholder="" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#d11a2a]/20 outline-none transition-all font-bold" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-3 block ml-2">Phone Number</label>
                  <input type="tel" placeholder="+63" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#d11a2a]/20 outline-none transition-all font-bold" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-3 block ml-2">Project Message</label>
                  <textarea rows={5} placeholder="Tell us about your disruption..." className="w-full bg-gray-50 border-none rounded-[32px] px-6 py-4 focus:ring-2 focus:ring-[#d11a2a]/20 outline-none transition-all font-bold resize-none"></textarea>
                </div>
                <div className="md:col-span-2">
                  <motion.button 
                    whileHover={{ scale: 1.01 }} 
                    whileTap={{ scale: 0.98 }} 
                    className="w-full bg-[#d11a2a] text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-red-500/30 flex items-center justify-center gap-4"
                  >
                    Send Proposal <Send size={16} />
                  </motion.button>
                </div>
              </form>
            </div>
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