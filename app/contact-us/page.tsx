"use client";

import React, { useState, useEffect, useRef } from "react";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged, signOut } from "firebase/auth";
import SignUpNewsletter from "../components/SignUpNewsletter" 
import Navbar from "../components/navigation/navbar";
import FloatingChatWidget  from "../components/chat-widget";
import {
    Menu, Mail, Phone, MapPin, Send, ChevronUp, Sparkles, ArrowRight,
    Facebook, Instagram, Linkedin, X, LogOut, User, Zap, FileSignature, ShieldCheck, Upload
} from "lucide-react";
import Footer from "../components/navigation/footer";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Idagdag ito
// Firebase Imports
import { db, auth, storage } from "@/lib/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import FloatingMenuWidget from "../components/menu-widget";

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
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
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
        { name: "Contact", href: "/contact-us" },
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

// Hanapin ang handleSubmit function sa ContactUsPage mo at palitan ng ganito:
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
        let fileUrl = "";

        // 1. UPLOAD FILE TO FIREBASE STORAGE (Kung may file)
        if (file) {
            try {
                // Gumawa ng unique filename gamit ang timestamp
                const fileRef = ref(storage, `inquiries/${Date.now()}_${file.name}`);
                const uploadResult = await uploadBytes(fileRef, file);
                fileUrl = await getDownloadURL(uploadResult.ref);
            } catch (uploadError) {
                console.error("Storage Upload Error:", uploadError);
                // Optional: Pwedeng ituloy pa rin ang process kahit walang file
            }
        }

        // 2. SAVE TO FIREBASE (Firestore)
        // Kasama na rito ang fileUrl kung mayroon man
        await addDoc(collection(db, "inquiries"), {
            ...formData,
            attachmentUrl: fileUrl, // Dito mase-save ang link ng file
            submittedAt: serverTimestamp(),
            source: "Contact Page",
            status: "unread",
            type: "customer",
        });

        // 3. SEND EMAIL NOTIFICATIONS (API Call)
        try {
            const emailResponse = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // Isama rin ang attachmentUrl sa email payload kung kailangan ng API mo
                body: JSON.stringify({ ...formData, attachmentUrl: fileUrl }),
            });

            if (!emailResponse.ok) {
                console.warn("Firebase saved, but Email failed to send.");
            }
        } catch (emailError) {
            console.error("Email API Error:", emailError);
        }
        
        // 4. SUCCESS UI
        setStatus("success");
        setFormData({ fullName: "", email: "", phone: "", message: "" });
        setFile(null); // I-clear ang file state
        
        setTimeout(() => setStatus("idle"), 5000);

    } catch (error) {
        console.error("Main Process Error:", error);
        setStatus("error");
        setTimeout(() => setStatus("idle"), 5000);
    }
};

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-[#d11a2a]/10 selection:text-[#d11a2a]">
            
            {/* --- NEW INDUSTRIAL MOBILE NAV (LEFT SIDE) --- */}
          <FloatingMenuWidget/>
          <Navbar/>

            {/* --- HERO SECTION (DARK) --- */}
            <section className="relative pt-52 pb-40 bg-[#0a0a0a] overflow-hidden">
                {/* Subtle Red Glow */}
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/30 via-transparent to-transparent" />
                
                {/* Tech Grid Background */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
                    style={{ 
                        backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`, 
                        backgroundSize: '60px 60px' 
                    }} 
                />

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-[#d11a2a] text-[10px] md:text-[12px] font-black uppercase tracking-[0.6em] mb-6 block italic">
                            Contact Us
                        </span>
                        
                        <h1 className="text-white text-6xl md:text-7xl font-black uppercase tracking-tighter leading-[0.8] mb-8">
                           Let’s build better,<br /> 
                            <span className="text-[#d11a2a] italic"> smarter environments together.</span>
                        </h1>

                        

                    </motion.div>
                </div>

                {/* Smooth Transition to Form */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent" />
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

{/* Palitan yung part ng file upload UI ng ganito para mas user-friendly */}
<div className="md:col-span-2 space-y-4">
    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
        Project Plans (Optional)
    </label>
    <div 
        onClick={() => !file && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 flex flex-col items-center cursor-pointer transition-all ${file ? 'border-[#d11a2a] bg-red-50' : 'border-gray-200 hover:border-[#d11a2a] hover:bg-red-50'}`}
    >
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => setFile(e.target.files?.[0] || null)} 
            className="hidden" 
        />
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
            <Upload size={20} className={file ? "text-[#d11a2a]" : "text-gray-400"} />
        </div>
        <p className="text-[10px] md:text-sm font-bold text-gray-900 uppercase text-center">
            {file ? file.name : "Tap to upload files"}
        </p>
        
        {file && (
            <button 
                type="button"
                onClick={(e) => {
                    e.stopPropagation(); // Iwasan mag-trigger ang parent click
                    setFile(null);
                }}
                className="mt-2 text-[10px] text-red-600 font-bold uppercase hover:underline"
            >
                Remove File
            </button>
        )}
    </div>
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
           <Footer/>
        </div>
    );
}