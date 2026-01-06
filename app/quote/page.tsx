"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowRight,
    ChevronUp,
    Menu,
    Upload,
    Clock,
    CheckCircle2,
    FileText,
    ShieldCheck,
    Smartphone,
    Facebook,
    Instagram,
    Linkedin
} from "lucide-react";

export default function FreeQuote() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [messageLength, setMessageLength] = useState(0);
    const [isNavOpen, setIsNavOpen] = useState(false); // Mobile Nav Toggle
    const LOGO_RED = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-red-scaled.png";
    const LOGO_WHITE = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-white-scaled.png";

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Products", href: "/lighting-products-smart-solutions" },
        { name: "Brands", href: "/trusted-technology-brands" },
        { name: "Contact", href: "/contact-us" },
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
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-[#d11a2a] selection:text-white overflow-x-hidden">

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
                        <Link href="/quote" className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all bg-[#d11a2a] text-white shadow-xl shadow-red-500/30">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>


            {/* --- 2. HERO HEADER (REFINED) --- */}
            <section className="relative pt-48 pb-24 px-6 overflow-hidden">

                {/* Subtle Engineering Grid Background - Fixed positioning */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.3] z-0"
                    style={{
                        backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 4px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 4px)
            `,
                        backgroundSize: '40px 40px',
                    }}
                />

                {/* Optional: Radial gradient for depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white pointer-events-none z-0" />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        {/* Top Label */}
                        <span className="text-[#d11a2a] text-[10px] md:text-[12px] font-black uppercase tracking-[0.6em] mb-6 block italic">
                            Priority Service Request
                        </span>

                        {/* Main Heading */}
                        <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter uppercase leading-[0.9] mb-10">
                            Get Your Custom <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d11a2a] to-gray-400">
                                Quote
                            </span>
                        </h1>

                        {/* Time Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-md px-8 py-4 rounded-2xl border border-gray-200 shadow-xl shadow-gray-100/50"
                        >
                            <div className="relative">
                                <Clock size={20} className="text-[#d11a2a] relative z-10" />
                                <span className="absolute inset-0 bg-[#d11a2a]/20 blur-md rounded-full animate-ping" />
                            </div>
                            <p className="text-gray-600 text-[11px] md:text-xs font-black uppercase tracking-widest">
                                Response Guaranteed <span className="text-gray-900 border-l border-gray-300 ml-2 pl-2">Within 30 Minutes</span>
                            </p>
                        </motion.div>

                        {/* Breadcrumb or subtitle */}
                        <p className="mt-12 text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                            Disruptive Solutions Inc. <span className="mx-2">/</span> Free Quotation
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* --- 3. QUOTE FORM SECTION --- */}
            <section className="pb-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
                    >
                        <form className="p-8 md:p-16 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* First Name */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">First Name *</label>
                                    <input type="text" required placeholder="John" className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-[#d11a2a] transition-colors bg-transparent text-gray-900 font-medium" />
                                </div>
                                {/* Last Name */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Last Name *</label>
                                    <input type="text" required placeholder="Doe" className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-[#d11a2a] transition-colors bg-transparent text-gray-900 font-medium" />
                                </div>
                            </div>

                            {/* Street Address */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Street Address *</label>
                                <input type="text" required placeholder="123 Tech Avenue, Business District" className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-[#d11a2a] transition-colors bg-transparent text-gray-900 font-medium" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Company */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Company</label>
                                    <input type="text" placeholder="Disruptive Solutions Inc." className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-[#d11a2a] transition-colors bg-transparent text-gray-900 font-medium" />
                                </div>
                                {/* Contact Number */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contact Number *</label>
                                    <div className="flex items-center gap-3 border-b-2 border-gray-100 focus-within:border-[#d11a2a] transition-colors">
                                        <span className="text-sm font-bold text-gray-400">+63</span>
                                        <input type="tel" required placeholder="912 345 6789" className="w-full py-3 outline-none bg-transparent text-gray-900 font-medium" />
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email *</label>
                                <input type="email" required placeholder="john@company.com" className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-[#d11a2a] transition-colors bg-transparent text-gray-900 font-medium" />
                            </div>

                            {/* Upload File */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Project Plans / Brief (Upload File)</label>
                                <div className="group relative cursor-pointer">
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                    <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-10 flex flex-col items-center group-hover:border-[#d11a2a] group-hover:bg-red-50/30 transition-all">
                                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4 group-hover:scale-110 group-hover:bg-[#d11a2a] group-hover:text-white transition-all">
                                            <Upload size={24} />
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">Drop your file here or click to browse</p>
                                        <p className="text-xs text-gray-400 mt-2">Maximum file size: 10MB (PDF, PNG, JPG)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Message</label>
                                    <span className="text-[10px] font-bold text-gray-300 tracking-widest">{messageLength} / 180</span>
                                </div>
                                <textarea
                                    maxLength={180}
                                    onChange={(e) => setMessageLength(e.target.value.length)}
                                    placeholder="Tell us about your project requirements..."
                                    className="w-full h-32 border-2 border-gray-100 rounded-3xl p-6 outline-none focus:border-[#d11a2a] transition-colors bg-transparent text-gray-900 font-medium resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <button type="submit" className="w-full bg-[#d11a2a] text-white py-6 rounded-full font-black uppercase tracking-[0.3em] text-[11px] hover:bg-black transition-all duration-500 shadow-2xl shadow-red-500/20 active:scale-95 flex items-center justify-center gap-3">
                                Send Quote Request <ArrowRight size={18} />
                            </button>
                        </form>
                    </motion.div>
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