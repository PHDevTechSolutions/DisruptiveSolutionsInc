"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowRight,
    ChevronUp,
    Upload,
    Clock,
    CheckCircle2,
    Facebook,
    Instagram,
    Linkedin,
    Loader2,
    Home // Idinagdag para sa icon
} from "lucide-react";

// --- FIREBASE & CLOUDINARY LOGIC ---
import { db } from "@/lib/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    const uploadPreset = "taskflow_preset";
    const cloudName = "dvmpn8mjh";

    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: "POST", body: formData }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || "Cloudinary Upload Failed");
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Cloudinary Error:", error);
        throw error;
    }
};

export default function FreeQuote() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        streetAddress: "",
        company: "",
        contactNumber: "",
        email: "",
        message: ""
    });
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const LOGO_RED = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-red-scaled.png";
    const LOGO_WHITE = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-white-scaled.png";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus("idle");

        try {
            let finalFileUrl = "";
            if (file) {
                finalFileUrl = await uploadToCloudinary(file);
            }

            await addDoc(collection(db, "quotes"), {
                ...formData,
                attachmentUrl: finalFileUrl,
                status: "pending",
                createdAt: serverTimestamp(),
            });

            setStatus("success");
            setFormData({ firstName: "", lastName: "", streetAddress: "", company: "", contactNumber: "", email: "", message: "" });
            setFile(null);
        } catch (error) {
            console.error("Final Submission Error:", error);
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

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
                        backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0)",
                        backdropFilter: isScrolled ? "blur(20px)" : "blur(0px)",
                        boxShadow: isScrolled ? "0 4px 30px rgba(0, 0, 0, 0.03)" : "0 0px 0px rgba(0,0,0,0)",
                        height: isScrolled ? "60px" : "80px",
                    }}
                    className="absolute inset-0 transition-all duration-500"
                />
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative z-10 h-full">
                    <Link href="/">
                        <img src={LOGO_RED} alt="Logo" className="h-8 md:h-12 w-auto object-contain" />
                    </Link>
                    {/* BACK TO HOME BUTTON */}
                    <Link href="/" className="flex items-center gap-2 px-5 py-2 md:px-8 md:py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all bg-[#d11a2a] text-white shadow-lg shadow-red-500/30 hover:bg-black">
                        <Home size={14} className="hidden md:block" /> Back to Home
                    </Link>
                </div>
            </nav>

            {/* --- 2. HERO SECTION --- */}
            <section className="relative pt-32 md:pt-48 pb-12 md:pb-24 px-6 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-[0.2] z-0" style={{ backgroundImage: `linear-gradient(to right, #e5e7eb 1px, transparent 4px), linear-gradient(to bottom, #e5e7eb 1px, transparent 4px)`, backgroundSize: '30px 30px' }} />
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <span className="text-[#d11a2a] text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] mb-4 md:mb-6 block italic">Priority Service Request</span>
                        <h1 className="text-4xl md:text-8xl font-black text-gray-900 tracking-tighter uppercase leading-[1] md:leading-[0.9] mb-6 md:mb-10">
                            Get Your Custom <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d11a2a] to-gray-400">Quote</span>
                        </h1>
                        <div className="inline-flex items-center gap-2 md:gap-3 bg-white/80 backdrop-blur-md px-5 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl border border-gray-200 shadow-xl">
                            <Clock size={16} className="text-[#d11a2a]" />
                            <p className="text-gray-600 text-[9px] md:text-[11px] font-black uppercase tracking-widest">Response Guaranteed <span className="hidden md:inline text-gray-900 border-l border-gray-300 ml-2 pl-2">Within 30 Minutes</span></p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- 3. FORM SECTION --- */}
            <section className="pb-20 md:pb-32 px-4 md:px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[30px] md:rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
                        
                        {status === "success" ? (
                            <div className="p-12 md:p-20 text-center space-y-6">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 md:w-20 md:h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-[30px] h-[30px] md:w-[40px] md:h-[40px]" />
                                </motion.div>
                                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">Request Sent!</h2>
                                <p className="text-sm md:text-base text-gray-500 font-medium">Thank you. Our team will contact you shortly.</p>
                                <button onClick={() => setStatus("idle")} className="text-[#d11a2a] text-[10px] font-black uppercase tracking-widest pt-4 hover:underline">Send Another Quote</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-6 md:p-16 space-y-6 md:space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">First Name *</label>
                                        <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} placeholder="John" className="w-full border-b-2 border-gray-100 py-2 md:py-3 outline-none focus:border-[#d11a2a] transition-colors bg-transparent text-sm md:text-base text-gray-900 font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">Last Name *</label>
                                        <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} placeholder="Doe" className="w-full border-b-2 border-gray-100 py-2 md:py-3 outline-none focus:border-[#d11a2a] transition-colors bg-transparent text-sm md:text-base text-gray-900 font-medium" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">Street Address *</label>
                                    <input type="text" name="streetAddress" required value={formData.streetAddress} onChange={handleChange} placeholder="123 Tech Avenue" className="w-full border-b-2 border-gray-100 py-2 md:py-3 outline-none focus:border-[#d11a2a] transition-colors bg-transparent text-sm md:text-base text-gray-900 font-medium" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">Company</label>
                                        <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Company Name" className="w-full border-b-2 border-gray-100 py-2 md:py-3 outline-none focus:border-[#d11a2a] transition-colors bg-transparent text-sm md:text-base text-gray-900 font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">Contact Number *</label>
                                        <input type="tel" name="contactNumber" required value={formData.contactNumber} onChange={handleChange} placeholder="0912 345 6789" className="w-full border-b-2 border-gray-100 py-2 md:py-3 outline-none focus:border-[#d11a2a] transition-colors bg-transparent text-sm md:text-base text-gray-900 font-medium" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address *</label>
                                    <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="john@email.com" className="w-full border-b-2 border-gray-100 py-2 md:py-3 outline-none focus:border-[#d11a2a] transition-colors bg-transparent text-sm md:text-base text-gray-900 font-medium" />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">Project Plans (Optional)</label>
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 flex flex-col items-center cursor-pointer transition-all ${file ? 'border-[#d11a2a] bg-red-50' : 'border-gray-200 hover:border-[#d11a2a] hover:bg-red-50'}`}
                                    >
                                        <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
                                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                                            {loading ? <Loader2 className="animate-spin text-[#d11a2a]" /> : <Upload size={20} className={file ? "text-[#d11a2a]" : "text-gray-400"} />}
                                        </div>
                                        <p className="text-[10px] md:text-sm font-bold text-gray-900 uppercase text-center">{file ? file.name : "Tap to upload files"}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">Message</label>
                                        <span className="text-[9px] font-bold text-gray-300">{formData.message.length} / 180</span>
                                    </div>
                                    <textarea name="message" maxLength={180} value={formData.message} onChange={handleChange} placeholder="What do you need?..." className="w-full h-24 md:h-32 border-2 border-gray-100 rounded-2xl md:rounded-3xl p-4 md:p-6 outline-none focus:border-[#d11a2a] transition-all bg-transparent text-sm md:text-base text-gray-900 font-medium resize-none" />
                                </div>

                                <button disabled={loading} type="submit" className="w-full bg-[#d11a2a] text-white py-4 md:py-6 rounded-full font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-[11px] hover:bg-black transition-all duration-500 shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50">
                                    {loading ? (
                                        <>Processing <Loader2 className="animate-spin" size={16} /></>
                                    ) : (
                                        <>Send Quote Request <ArrowRight size={16} /></>
                                    )}
                                </button>
                                {status === "error" && <p className="text-red-500 text-[9px] font-black uppercase text-center">Error. Please try again.</p>}
                            </form>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* --- 4. FOOTER --- */}
            <footer className="bg-[#0a0a0a] text-white pt-16 md:pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                        <img src={LOGO_WHITE} alt="Logo" className="h-8 md:h-10" />
                        <div className="flex gap-6">
                            <Facebook size={18} className="text-gray-500 hover:text-[#d11a2a] cursor-pointer" />
                            <Instagram size={18} className="text-gray-500 hover:text-[#d11a2a] cursor-pointer" />
                            <Linkedin size={18} className="text-gray-500 hover:text-[#d11a2a] cursor-pointer" />
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-bold text-gray-500 tracking-[0.2em] uppercase">
                        <p>© 2026 Disruptive Solutions Inc.</p>
                        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2 hover:text-[#d11a2a]">
                            Back to Top <ChevronUp size={14} />
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}