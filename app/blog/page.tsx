"use client";

import React, { useState, useEffect, } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowRight,
    ChevronUp,
    Globe,
    Zap,
    Sparkles, Facebook, Instagram, Linkedin // Idinagdag para sa footer
} from "lucide-react";

export default function DisruptiveLandingPage() {
    const [isScrolled, setIsScrolled] = useState(false);

    const LOGO_RED = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-red-scaled.png";
    const LOGO_WHITE = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-white-scaled.png";

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Products & Solutions", href: "/lighting-products-smart-solutions" },
        { name: "Brands", href: "/trusted-technology-brands" },
        { name: "Contact Us", href: "/contact-us" },
    ];

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
    const blogData = [
        {
            title: "The Future of Smart Lighting",
            description: "How integrated sensor technology is changing the way we illuminate industrial and commercial spaces.",
            image: "https://disruptivesolutionsinc.com/wp-content/uploads/2026/01/Bright-ideas.png",
            date: "Oct 24, 2025"
        },
        {
            title: "Energy Efficiency Trends",
            description: "Discover the latest standards in sustainable power solutions that help businesses reduce carbon footprints.",
            image: "https://disruptivesolutionsinc.com/wp-content/uploads/2025/12/unnamed-18.png",
            date: "Nov 12, 2025"
        },
        {
            title: "Lighting Design 101",
            description: "A guide to choosing the right brand and fixture for high-end architectural projects.",
            image: "https://disruptivesolutionsinc.com/wp-content/uploads/2025/12/Built-to-Last-Why-Quality-Lighting-Outperforms-Short-Term-Solutions.png",
            date: "Dec 05, 2025"
        }
    ];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-[#d11a2a]/10 selection:text-[#d11a2a] overflow-x-hidden">

            {/* --- 1. NAVIGATION --- */}
            <nav className="fixed top-0 left-0 w-full z-[1000] py-4 transition-all duration-500">
                <motion.div
                    initial={false}
                    animate={{
                        backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0)",
                        backdropFilter: isScrolled ? "blur(20px)" : "blur(0px)",
                        boxShadow: isScrolled ? "0 4px 30px rgba(0, 0, 0, 0.03)" : "0 0px 0px rgba(0,0,0,0)",
                        height: isScrolled ? "70px" : "90px",
                    }}
                    className="absolute inset-0 transition-all duration-500"
                />

                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative z-10 h-full">
                    <Link href="/">
                        <img src={LOGO_RED} alt="Logo" className="h-10 md:h-12 w-auto object-contain transition-all" />
                    </Link>

                    <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center py-1.5 rounded-full border border-gray-100 bg-white/50 backdrop-blur-md px-2">
                        {navLinks.map((link) => (
                            <Link key={link.name} href={link.href} className="px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-full relative group text-gray-900">
                                <motion.span className="absolute inset-0 bg-[#d11a2a] rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100" />
                                <span className="relative z-10 group-hover:text-white">{link.name}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="hidden lg:block">
                        <Link href="/quote" className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all bg-[#d11a2a] text-white shadow-xl ">
                            Free Quote
                        </Link>
                    </div>
                </div>
            </nav>

            {/* --- 2. MAIN CONTENT --- */}
            <section className="relative pt-48 pb-32 px-6">

                {/* Subtle Engineering Grid Background */}
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
                    <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-10">
                        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <span className="text-[#d11a2a] text-[10px] font-black uppercase tracking-[0.5em] mb-4 block italic">Knowledge Base</span>
                            <h1 className="text-6xl md:text-9xl font-black text-gray-900 tracking-tighter uppercase leading-[0.85]">
                                Latest <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d11a2a] to-gray-400">Updates</span>
                            </h1>
                        </motion.div>

                        <Link href="/blogs" className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-900">
                            View All <div className="p-4 bg-gray-900 text-white rounded-full group-hover:bg-[#d11a2a] transition-all"><ArrowRight size={18} /></div>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {blogData.map((blog, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -15 }}
                                className="group cursor-pointer"
                            >
                                {/* Image Container - Adjusted for width and color */}
                                <div className="relative aspect-[4/3] w-full rounded-[2.5rem] overflow-hidden mb-8 border border-gray-100 bg-gray-50 shadow-sm transition-all group-hover:shadow-2xl">
                                    <img
                                        src={blog.image}
                                        alt={blog.title}
                                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                                    /* Note: object-cover works best for grid consistency. 
                                       If you want to see the WHOLE image without cropping, use object-contain */
                                    />

                                    {/* Floating Date Overlay */}
                                    <div className="absolute bottom-6 left-6">
                                        <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-900 shadow-sm border border-gray-100">
                                            {blog.date}
                                        </span>
                                    </div>
                                </div>

                                <div className="px-2">
                                    <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tighter group-hover:text-[#d11a2a] transition-colors leading-tight">
                                        {blog.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2 italic font-medium">
                                        {blog.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#d11a2a]">
                                        Read Full Story <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </motion.div>
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