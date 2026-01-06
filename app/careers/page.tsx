"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    ChevronUp,
    Briefcase,
    User,
    Mail,
    FileText,
    Send,
    Plus,
    Globe,
    Menu, // Idinagdag
    Sparkles, Facebook, Instagram, Linkedin // Idinagdag para sa footer
} from "lucide-react";

export default function CareersPage() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [visibleJobs, setVisibleJobs] = useState(2);
    const [isNavOpen, setIsNavOpen] = useState(false); // Idinagdag

    const LOGO_RED = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-red-scaled.png";
    const LOGO_WHITE = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-white-scaled.png";

    // In-define ang navLinks para gumana ang menu
    const navLinks = [
        { name: "Home", href: "/dashboard" },
        { name: "Products & Solutions", href: "/lighting-products-smart-solutions" },
        { name: "Brands", href: "/trusted-technology-brands" },
        { name: "Contact", href: "/contact-us" },
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

    const jobs = [
        { id: 1, category: "IT", title: "Senior Systems Engineer", location: "Remote / On-site", type: "Full-time" },
        { id: 2, category: "HR", title: "Talent Acquisition Specialist", location: "Head Office", type: "Full-time" },
        { id: 3, category: "IT", title: "Full Stack Developer", location: "Remote", type: "Contract" },
        { id: 4, category: "Sales", title: "Technical Sales Representative", location: "Field", type: "Full-time" },
    ];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-[#d11a2a]/10 selection:text-[#d11a2a] overflow-x-hidden">

            {/* --- 1. NAVIGATION (ALWAYS VISIBLE STYLE) --- */}
            <nav className="fixed top-0 left-0 w-full z-[1000] py-4 transition-all duration-500">
                <motion.div
                    initial={false}
                    animate={{
                        // May konting puti na agad kahit hindi pa scrolled para kita ang links
                        backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.5)",
                        backdropFilter: "blur(16px)",
                        boxShadow: isScrolled ? "0 4px 30px rgba(0, 0, 0, 0.05)" : "0 0px 0px rgba(0, 0, 0, 0)",
                        borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                        height: isScrolled ? "70px" : "90px",
                    }}
                    className="absolute inset-0 transition-all duration-500"
                />

                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative z-10 h-full">

                    {/* LOGO - Naka RED na agad para visible */}
                    <div className="relative">
                        <Link href="/">
                            <motion.img
                                animate={{ scale: isScrolled ? 0.85 : 1 }}
                                src={LOGO_RED}
                                alt="Logo"
                                className="h-10 md:h-12 w-auto object-contain transition-all duration-500"
                            />
                        </Link>
                    </div>

                    {/* THE COMPACT MENU - Naka Gray-900 para kita agad sa puting background */}
                    <motion.div
                        initial={false}
                        animate={{
                            gap: isScrolled ? "4px" : "12px",
                            backgroundColor: isScrolled ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.8)",
                        }}
                        className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center py-1.5 rounded-full border border-gray-200 backdrop-blur-md px-4 transition-all duration-500"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="px-5 py-2 text-[11px] font-black uppercase tracking-[0.15em] transition-all rounded-full relative group text-gray-900"
                            >
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
                                className="px-7 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all bg-[#d11a2a] text-white shadow-xl shadow-red-500/20"
                            >
                                Free Quote
                            </Link>
                        </motion.div>
                    </div>

                    {/* MOBILE TOGGLE ICON */}
                    <button className="lg:hidden p-2 text-gray-900">
                        <Menu size={28} />
                    </button>
                </div>
            </nav>

            {/* --- 2. HERO & JOBS --- */}
            <section className="relative pt-48 pb-20 px-6">
                <div className="absolute inset-0 pointer-events-none opacity-[0.3]"
                    style={{
                        backgroundImage: `linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                    }}
                />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="mb-20">
                        <span className="text-[#d11a2a] text-[10px] font-black uppercase tracking-[0.5em] mb-4 block italic">Join the Team</span>
                        <h1 className="text-6xl md:text-9xl font-black text-gray-900 tracking-tighter uppercase leading-[0.85]">
                            Build the <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d11a2a] to-gray-400">Future</span>
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatePresence>
                            {jobs.slice(0, visibleJobs).map((job) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group p-8 rounded-[2.5rem] border border-gray-100 bg-white/50 backdrop-blur-sm hover:border-[#d11a2a] transition-all"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="px-4 py-1.5 rounded-full bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest">{job.category}</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">{job.type}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter group-hover:text-[#d11a2a] transition-colors">{job.title}</h3>
                                    <p className="text-gray-500 text-sm mb-6 flex items-center gap-2 italic">
                                        <Globe size={14} className="text-[#d11a2a]" /> {job.location}
                                    </p>
                                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-900 group-hover:gap-4 transition-all">
                                        Apply Now <ArrowRight size={14} className="text-[#d11a2a]" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {visibleJobs < jobs.length && (
                        <div className="mt-12 text-center">
                            <button
                                onClick={() => setVisibleJobs(jobs.length)}
                                className="group inline-flex items-center gap-3 px-10 py-4 rounded-full border-2 border-gray-900 text-gray-900 font-black text-[10px] uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all"
                            >
                                See More Positions <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* --- 3. APPLICATION FORM --- */}
            <section className="py-32 px-6 bg-gray-50 relative overflow-hidden">
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 uppercase tracking-tighter mb-4">Send your Resume</h2>
                        <p className="text-gray-500 italic">Be part of our disruptive solutions. Fill out the form below.</p>
                    </div>

                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-gray-100">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" placeholder="Juan Dela Cruz" className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#d11a2a] text-sm" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="email" placeholder="juan@email.com" className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#d11a2a] text-sm" />
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Applying For</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <select className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#d11a2a] text-sm appearance-none">
                                    <option>Select Position</option>
                                    <option>IT - Systems Engineer</option>
                                    <option>HR - Talent Acquisition</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Upload Resume (PDF)</label>
                            <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-[#d11a2a] group cursor-pointer">
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                                <FileText className="mx-auto mb-2 text-gray-300 group-hover:text-[#d11a2a]" size={32} />
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Click to browse or drag & drop</p>
                            </div>
                        </div>
                        <div className="md:col-span-2 pt-4">
                            <button className="w-full bg-[#d11a2a] text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-900 transition-all">
                                Submit Application <Send size={18} />
                            </button>
                        </div>
                    </form>
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