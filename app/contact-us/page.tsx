"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged, signOut } from "firebase/auth";
import SignUpNewsletter from "../components/SignUpNewsletter" 
import {
    Menu, Mail, Phone, MapPin, Send, ChevronUp, Sparkles, ArrowRight,
    Facebook, Instagram, Linkedin, X, LogOut, User, Zap, FileSignature, ShieldCheck
} from "lucide-react";

// Firebase Imports
import { db, auth } from "@/lib/firebase"; 
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
    const [userSession, setUserSession] = useState<any>(null);
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
 
        // Logout function
  const handleLogout = () => {
    localStorage.removeItem("disruptive_user_session");
    setUserSession(null);
    window.location.reload(); // Refresh para bumalik sa default nav
  };

        useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setUserSession(user); // Dito natin ise-set yung userSession
          } else {
            setUserSession(null);
          }
        });
        return () => unsubscribe();
      }, [])
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
<section className="relative z-20 -mt-12 md:-mt-24 px-4 md:px-6 pb-16 md:pb-24">
    <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
            
            {/* Left: Info & Map */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-8 md:p-10 rounded-[32px] md:rounded-[40px] shadow-2xl border border-gray-100">
                    <h3 className="text-xl md:text-2xl font-black uppercase mb-8">
                        Quick <span className="text-[#d11a2a]">Contacts</span>
                    </h3>
                    
                    <div className="space-y-6 mb-10">
                        {/* Email */}
                        <div className="flex gap-4 group cursor-pointer">
                            <div className="h-12 w-12 shrink-0 rounded-2xl bg-red-50 flex items-center justify-center text-[#d11a2a] group-hover:bg-[#d11a2a] group-hover:text-white transition-all">
                                <Mail size={20} />
                            </div>
                            <div className="min-w-0"> {/* min-w-0 prevents text overflow */}
                                <p className="text-[11px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Us</p>
                                <p className="font-bold text-gray-900 break-words text-sm md:text-base">info@disruptivesolutionsinc.com</p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex gap-4 group cursor-pointer">
                            <div className="h-12 w-12 shrink-0 rounded-2xl bg-red-50 flex items-center justify-center text-[#d11a2a] group-hover:bg-[#d11a2a] group-hover:text-white transition-all">
                                <Phone size={20} />
                            </div>
                            <div>
                                <p className="text-[11px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Direct Line</p>
                                <p className="font-bold text-gray-900 text-sm md:text-base">+63 917 527 8819</p>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="flex gap-4 group cursor-pointer">
                            <div className="h-12 w-12 shrink-0 rounded-2xl bg-red-50 flex items-center justify-center text-[#d11a2a] group-hover:bg-[#d11a2a] group-hover:text-white transition-all">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-[11px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Headquarters</p>
                                <p className="font-bold text-gray-900 leading-tight text-sm md:text-base">
                                    Primex Tower, EDSA, <br className="hidden md:block"/> San Juan, Metro Manila
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Socials */}
                    <div className="flex flex-wrap gap-3">
                        {socials.map((soc, i) => (
                            <a key={i} href={soc.href} className={`h-11 w-11 rounded-full bg-gray-50 flex items-center justify-center transition-all hover:text-white ${soc.color}`}>
                                <soc.icon size={18} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Map - Hidden on very small screens or adjusted height */}
                <div className="h-[300px] md:h-[400px] rounded-[32px] md:rounded-[40px] overflow-hidden border-4 md:border-8 border-white shadow-2xl relative">
                    <Map center={[14.6019, 121.0590]} zoom={15} scrollWheelZoom={false}>
                        <MapTileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                        <MapMarker position={[14.6019, 121.0590]}>
                            <MapPopup>Disruptive Solutions HQ</MapPopup>
                        </MapMarker>
                    </Map>
                </div>
            </div>

            {/* Right: Modern Form */}
            <div className="lg:col-span-8 bg-white p-6 md:p-16 rounded-[40px] md:rounded-[50px] shadow-[0_50px_100px_rgba(0,0,0,0.08)] border border-gray-50">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    
                    <div className="md:col-span-2">
                        <label className="text-[11px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block ml-2">Full Name</label>
                        <input 
                            required
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            type="text" 
                            placeholder="John Doe" 
                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#d11a2a]/20 outline-none transition-all font-bold text-base md:text-sm" 
                        />
                    </div>

                    <div>
                        <label className="text-[11px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block ml-2">Email Address</label>
                        <input 
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            type="email" 
                            placeholder="john@company.com" 
                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#d11a2a]/20 outline-none transition-all font-bold text-base md:text-sm" 
                        />
                    </div>

                    <div>
                        <label className="text-[11px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block ml-2">Phone Number</label>
                        <input 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            type="tel" 
                            placeholder="+63 900 000 0000" 
                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#d11a2a]/20 outline-none transition-all font-bold text-base md:text-sm" 
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-[11px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block ml-2">Project Brief</label>
                        <textarea 
                            required
                            value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                            rows={5} 
                            placeholder="Describe your lighting project..." 
                            className="w-full bg-gray-50 border-none rounded-[24px] md:rounded-[32px] px-6 py-4 focus:ring-2 focus:ring-[#d11a2a]/20 outline-none transition-all font-bold resize-none text-base md:text-sm"
                        ></textarea>
                    </div>
                    
                    <div className="md:col-span-2 pt-2">
                        <motion.button
                            disabled={status === "loading"}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.15em] md:tracking-[0.3em] text-[13px] md:text-xs shadow-2xl flex items-center justify-center gap-4 transition-all
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