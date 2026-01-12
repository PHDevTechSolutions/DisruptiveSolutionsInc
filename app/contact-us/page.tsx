"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import SignUpNewsletter from "../components/SignUpNewsletter" 
import {
    Menu, Mail, Phone, MapPin, Send, ChevronUp, Sparkles, ArrowRight,
    Facebook, Instagram, Linkedin, X
} from "lucide-react";

// Firebase Imports
import { db } from "@/lib/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Dynamic Import para sa Map (Para iwas SSR errors sa Next.js)
const Map = dynamic(() => import("@/components/ui/map").then(mod => mod.Map), { 
    ssr: false,
    loading: () => <div className="h-96 w-full bg-gray-100 animate-pulse rounded-[40px] flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Map...</div>
});
const MapMarker = dynamic(() => import("@/components/ui/map").then(mod => mod.MapMarker), { ssr: false });
const MapPopup = dynamic(() => import("@/components/ui/map").then(mod => mod.MapPopup), { ssr: false });
const MapTileLayer = dynamic(() => import("@/components/ui/map").then(mod => mod.MapTileLayer), { ssr: false });
const MapZoomControl = dynamic(() => import("@/components/ui/map").then(mod => mod.MapZoomControl), { ssr: false });

export default function ContactUsPage() {
    // --- STATES ---
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        message: ""
    });

    const LOGO_RED = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-red-scaled.png";
    const LOGO_WHITE = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-white-scaled.png";

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Product & Solutions", href: "/lighting-products-smart-solutions" },
        { name: "Brands", href: "/trusted-technology-brands" },
        { name: "Contact Us", href: "/contact-us" },
    ];

    const socials = [
        { icon: Facebook, href: "#", color: "hover:bg-[#1877F2]" },
        { icon: Instagram, href: "#", color: "hover:bg-[#E4405F]" },
        { icon: Linkedin, href: "#", color: "hover:bg-[#0A66C2]" },
    ];

    // --- EFFECTS ---
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // --- HANDLERS ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        try {
            await addDoc(collection(db, "inquiries"), {
                ...formData,
                submittedAt: serverTimestamp(),
                source: "Contact Page"
            });
            setStatus("success");
            setFormData({ fullName: "", email: "", phone: "", message: "" });
            setTimeout(() => setStatus("idle"), 5000);
        } catch (error) {
            console.error("Firebase Error:", error);
            setStatus("error");
            setTimeout(() => setStatus("idle"), 5000);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-[#d11a2a]/10 selection:text-[#d11a2a]">
            
            {/* --- NAVIGATION --- */}
            <nav className="fixed top-0 left-0 w-full z-[1000] py-4 transition-all duration-500">
                <motion.div
                    animate={{
                        backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0)",
                        backdropFilter: isScrolled ? "blur(20px)" : "blur(0px)",
                        height: isScrolled ? "70px" : "90px",
                        boxShadow: isScrolled ? "0 10px 30px rgba(0,0,0,0.05)" : "none"
                    }}
                    className="absolute inset-0 transition-all duration-500"
                />

                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative z-10 h-full">
                    <Link href="/">
                        <motion.img
                            animate={{ scale: isScrolled ? 0.85 : 1 }}
                            src={isScrolled ? LOGO_RED : LOGO_WHITE}
                            alt="Logo"
                            className="h-10 md:h-12 w-auto object-contain transition-all duration-500"
                        />
                    </Link>

                    {/* Desktop Menu */}
                    <motion.div
                        animate={{
                            gap: isScrolled ? "4px" : "12px",
                            backgroundColor: isScrolled ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.1)",
                            padding: "6px"
                        }}
                        className="hidden lg:flex items-center rounded-full border border-white/20 transition-all"
                    >
                        {navLinks.map((link) => (
                            <Link key={link.name} href={link.href} className={`px-5 py-2 text-[11px] font-black uppercase tracking-widest rounded-full relative group transition-colors ${isScrolled ? "text-gray-900" : "text-white"}`}>
                                <span className="relative z-10 group-hover:text-white">{link.name}</span>
                                <motion.span className="absolute inset-0 bg-[#d11a2a] rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100" />
                            </Link>
                        ))}
                    </motion.div>

                    <div className="flex items-center gap-4">
                        <Link href="/quote" className={`hidden md:block px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${isScrolled ? "bg-[#d11a2a] text-white" : "bg-white text-gray-900 hover:bg-[#d11a2a] hover:text-white"}`}>
                            Free Quote
                        </Link>
                        <button onClick={() => setIsNavOpen(true)} className="lg:hidden text-white mix-blend-difference">
                            <Menu size={28} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="relative pt-52 pb-40 bg-[#0a0a0a] overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent" />
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-white text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-8"
                    >
                        Connect <br /> with <span className="text-[#d11a2a] italic">Expertise.</span>
                    </motion.h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                        Ready to disrupt the standard? Our engineers and design specialists are ready to turn your vision into a high-performance reality.
                    </p>
                </div>
            </section>

            {/* --- CONTACT BLOCK --- */}
            <section className="relative z-20 -mt-24 px-6 pb-24">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        
                        {/* Left: Info & Map */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100">
                                <h3 className="text-2xl font-black uppercase mb-8">Quick <span className="text-[#d11a2a]">Contacts</span></h3>
                                <div className="space-y-6 mb-10">
                                    <div className="flex gap-4 group cursor-pointer">
                                        <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center text-[#d11a2a] group-hover:bg-[#d11a2a] group-hover:text-white transition-all"><Mail size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Us</p>
                                            <p className="font-bold text-gray-900">info@disruptivesolutionsinc.com</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 group cursor-pointer">
                                        <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center text-[#d11a2a] group-hover:bg-[#d11a2a] group-hover:text-white transition-all"><Phone size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Direct Line</p>
                                            <p className="font-bold text-gray-900">+63 917 527 8819</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 group cursor-pointer">
                                        <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center text-[#d11a2a] group-hover:bg-[#d11a2a] group-hover:text-white transition-all"><MapPin size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Headquarters</p>
                                            <p className="font-bold text-gray-900 leading-tight">Primex Tower, EDSA, <br/>San Juan, Metro Manila</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    {socials.map((soc, i) => (
                                        <a key={i} href={soc.href} className={`h-11 w-11 rounded-full bg-gray-50 flex items-center justify-center transition-all hover:text-white ${soc.color}`}><soc.icon size={18} /></a>
                                    ))}
                                </div>
                            </div>

                            <div className="h-[400px] rounded-[40px] overflow-hidden border-8 border-white shadow-2xl relative">
                                <Map center={[14.6019, 121.0590]} zoom={15} scrollWheelZoom={false}>
                                    <MapTileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                    <MapMarker position={[14.6019, 121.0590]}>
                                        <MapPopup>Disruptive Solutions HQ</MapPopup>
                                    </MapMarker>
                                </Map>
                            </div>
                        </div>

                        {/* Right: Modern Form */}
                        <div className="lg:col-span-8 bg-white p-8 md:p-16 rounded-[50px] shadow-[0_50px_100px_rgba(0,0,0,0.08)] border border-gray-50">
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block ml-2">Full Name</label>
                                    <input 
                                        required
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                        type="text" 
                                        placeholder="John Doe" 
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#d11a2a]/20 outline-none transition-all font-bold" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block ml-2">Email Address</label>
                                    <input 
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        type="email" 
                                        placeholder="john@company.com" 
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#d11a2a]/20 outline-none transition-all font-bold" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block ml-2">Phone Number</label>
                                    <input 
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        type="tel" 
                                        placeholder="+63 900 000 0000" 
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#d11a2a]/20 outline-none transition-all font-bold" 
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block ml-2">Project Brief</label>
                                    <textarea 
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                        rows={6} 
                                        placeholder="Describe your lighting project or smart solution requirements..." 
                                        className="w-full bg-gray-50 border-none rounded-[32px] px-6 py-4 focus:ring-2 focus:ring-[#d11a2a]/20 outline-none transition-all font-bold resize-none"
                                    ></textarea>
                                </div>
                                
                                <div className="md:col-span-2">
                                    <motion.button
                                        disabled={status === "loading"}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl flex items-center justify-center gap-4 transition-all
                                            ${status === "success" ? "bg-green-600 shadow-green-500/30" : 
                                              status === "error" ? "bg-black" : "bg-[#d11a2a] shadow-red-500/30"} text-white`}
                                    >
                                        {status === "loading" ? "Processing..." : 
                                         status === "success" ? "Message Sent!" : 
                                         status === "error" ? "Try Again" : "Send Proposal"} 
                                        <Send size={16} />
                                    </motion.button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-[#0a0a0a] text-white pt-32 pb-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
                        <div className="space-y-8">
                            <img src={LOGO_WHITE} alt="Logo" className="h-10" />
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Redefining the future of illumination through engineering excellence and disruptive innovation.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#d11a2a]">Navigation</h4>
                            <ul className="space-y-4">
                                {navLinks.map((link) => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="text-gray-400 text-sm hover:text-white transition-colors flex items-center gap-2 group">
                                            <span className="h-px w-0 bg-[#d11a2a] group-hover:w-4 transition-all" /> {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
            <div className="md:col-span-2 bg-white/5 backdrop-blur-xl rounded-[32px] p-10 border border-white/10 shadow-xl flex flex-col justify-between">
                <SignUpNewsletter></SignUpNewsletter>
            </div>
                    </div>
                    <div className="pt-12 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <p>© 2026 Disruptive Solutions Inc.</p>
                        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2 hover:text-white transition-all">Top <ChevronUp size={14} /></button>
                    </div>
                </div>
            </footer>
        </div>
    );
}