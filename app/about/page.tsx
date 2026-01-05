"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  FileSignature, 
  ArrowRight, 
  Sparkles, 
  ChevronUp 
} from "lucide-react";

export default function DisruptiveLandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans selection:bg-[#d11a2a]/10 selection:text-[#d11a2a] overflow-x-hidden">
      
      {/* --- 1. NAVIGATION (Perfectly Balanced) --- */}
      <nav className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-300 ${isScrolled ? "bg-white shadow-md py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative">
          
          {/* LOGO - Saktong Laki (h-10 sa mobile, h-12 sa desktop) */}
          <div className="relative z-10">
            <Link href="/">
              <img 
                src={isScrolled ? LOGO_RED : LOGO_WHITE} 
                alt="Logo" 
                className="h-10 md:h-12 w-auto transition-all duration-300 object-contain" 
              />
            </Link>
          </div>

          {/* CENTERED MENU LINKS - Perfect Dead Center */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-10">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`text-[13px] font-bold uppercase tracking-widest transition-all duration-300 hover:scale-105 ${
                  isScrolled ? "text-gray-700 hover:text-[#d11a2a]" : "text-white/90 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* RIGHT SIDE BUTTON */}
          <div className="hidden lg:block relative z-10">
            <Link 
              href="/quote" 
              className={`px-7 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                isScrolled ? "bg-[#d11a2a] text-white hover:bg-[#b11422]" : "bg-white text-gray-900 hover:bg-gray-100"
              }`}
            >
              Get Your Free Quote
            </Link>
          </div>

          {/* MOBILE TOGGLE */}
          <button className="lg:hidden p-2 relative z-10" onClick={() => setIsOpen(true)}>
            <Menu className={isScrolled ? "text-gray-800" : "text-white"} size={28} />
          </button>
        </div>
      </nav>

      {/* --- 2. HERO SECTION (Buffer para sa Nav) --- */}
      <section className="relative h-[60vh] flex items-center bg-[#111]">
        <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1513506494265-99b15e8c0dc0?q=80&w=2070')` }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
           <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
             <h1 className="text-white text-5xl md:text-7xl font-black uppercase tracking-tighter">
               Redefining <br /> <span className="text-[#d11a2a]">Innovation</span>
             </h1>
           </motion.div>
        </div>
      </section>

      {/* --- 3. ABOUT US SECTION --- */}
      <section className="py-24 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4 uppercase">
                About <span className="text-[#d11a2a]">Us</span>
              </h2>
              <div className="h-1.5 w-20 bg-[#d11a2a] rounded-full mx-auto" />
            </motion.div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Why Disruptive */}
            <motion.div 
              whileHover={{ y: -10 }} 
              className="p-10 rounded-[40px] bg-[#f8f9fa] border border-gray-100 transition-all hover:shadow-2xl hover:shadow-red-500/5 group"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#d11a2a] transition-colors shadow-sm">
                <Sparkles className="text-[#d11a2a] group-hover:text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">Why Disruptive Solutions?</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Disruptive Solutions Inc. is redefining how businesses and institutions light up their spaces. We deliver smart, future-ready, aesthetically refined, and premium quality lighting solutions built to match the evolving demands of construction, infrastructure, and industrial projects.
              </p>
            </motion.div>

            {/* Card 2: What We Do */}
            <motion.div 
              whileHover={{ y: -10 }} 
              className="p-10 rounded-[40px] bg-[#f8f9fa] border border-gray-100 transition-all hover:shadow-2xl hover:shadow-red-500/5 group"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#d11a2a] transition-colors shadow-sm">
                <FileSignature className="text-[#d11a2a] group-hover:text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">What We Do</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                We design and implement LED and smart lighting systems built for large-scale projects. Our team supports construction and infrastructure developments with energy-efficient solutions, industry-specific integrations, and customized system designs.
              </p>
            </motion.div>

            {/* Card 3: Industries */}
            <motion.div 
              whileHover={{ y: -10 }} 
              className="p-10 rounded-[40px] bg-[#f8f9fa] border border-gray-100 transition-all hover:shadow-2xl hover:shadow-red-500/5 group"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#d11a2a] transition-colors shadow-sm">
                <ArrowRight className="text-[#d11a2a] group-hover:text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">Industries We Serve</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Disruptive Solutions partners with a broad range of sectors. We work with construction engineering firms and real estate developers seeking reliable, future-ready lighting for modern buildings, logistics, warehousing, hotels, and institutional facilities.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- 4. FOOTER --- */}
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