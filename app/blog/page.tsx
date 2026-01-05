"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
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

  // DITO MO PWEDENG PALITAN ANG BLOG CONTENT
  const blogData = [
    {
      title: "The Future of Smart Lighting",
      description: "How integrated sensor technology is changing the way we illuminate industrial and commercial spaces.",
      image: "https://images.unsplash.com/photo-1558444479-c84825d2ea9a?q=80&w=1000",
      date: "Oct 24, 2025"
    },
    {
      title: "Energy Efficiency Trends",
      description: "Discover the latest standards in sustainable power solutions that help businesses reduce carbon footprints.",
      image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1000",
      date: "Nov 12, 2025"
    },
    {
      title: "Lighting Design 101",
      description: "A guide to choosing the right brand and fixture for high-end architectural projects.",
      image: "https://images.unsplash.com/photo-1513506494265-99b15e8c0dc0?q=80&w=1000",
      date: "Dec 05, 2025"
    }
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans selection:bg-[#d11a2a]/10 selection:text-[#d11a2a] overflow-x-hidden">
      
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

      {/* --- 2. BLOG SECTION (ADDED) --- */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                Latest <br /> <span className="text-[#d11a2a]">Updates</span>
              </h2>
            </div>
            <Link href="/blogs" className="text-[#d11a2a] font-bold text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
              View All Posts <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogData.map((blog, index) => (
              <motion.div 
                key={index}
                whileHover={{ y: -10 }}
                className="group cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative h-[280px] rounded-[32px] overflow-hidden mb-6 shadow-sm border border-gray-100">
                  <img 
                    src={blog.image} 
                    alt={blog.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-[#d11a2a]">
                      {blog.date}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="px-2">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#d11a2a] transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-6 line-clamp-3">
                    {blog.description}
                  </p>
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-xs uppercase tracking-widest group-hover:text-[#d11a2a] transition-colors">
                    Read More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
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