"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Upload,
    Clock,
    CheckCircle2,
    Loader2
} from "lucide-react";

// --- EXTERNAL LOGIC ---
import { db } from "@/lib/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Navbar from "../components/navigation/navbar";
import Footer from "../components/navigation/footer";
import FloatingChatWidget  from "../components/chat-widget";
import FloatingMenuWidget from "../components/menu-widget";
// --- CLOUDINARY UPLOAD FUNCTION ---
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus("idle");

        try {
            // 1. Upload to Cloudinary if file exists
            let finalFileUrl = "";
            if (file) {
                finalFileUrl = await uploadToCloudinary(file);
            }

            const submissionData = {
                ...formData,
                attachmentUrl: finalFileUrl,
                status: "unread",
                type: "quotation",
                processStatus: "pending",
                createdAt: new Date(),
            };

            // 2. Save to Firebase
            await addDoc(collection(db, "inquiries"), {
                ...submissionData,
                createdAt: serverTimestamp(),
            });

            // 3. Send Email via API Route
            const emailRes = await fetch("/api/quote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submissionData),
            });

            if (!emailRes.ok) throw new Error("Email sending failed");

            setStatus("success");
            setFormData({ 
                firstName: "", lastName: "", streetAddress: "", 
                company: "", contactNumber: "", email: "", message: "" 
            });
            setFile(null);
        } catch (error) {
            console.error("Submission Error:", error);
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-[#d11a2a] selection:text-white overflow-x-hidden">
            <Navbar />
            <FloatingMenuWidget/>

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
                            Precision Engineering
                        </span>
                        
                        <h1 className="text-white text-6xl md:text-7xl font-black uppercase tracking-tighter leading-[0.8] mb-8">
                           Partner with a Trusted<br /> 
                            <span className="text-[#d11a2a] italic">Industrial Lighting Provider.</span>
                        </h1>

                        

                        <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-white/70 text-[10px] font-black uppercase tracking-widest">
                                Provide your project details below and our team will respond with your quote within 30 minutes
                            </span>
                        </div>
                    </motion.div>
                </div>

                {/* Smooth Transition to Form */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent" />
            </section>

            {/* --- FORM SECTION --- */}
            <section className="relative -mt-20 pb-20 md:pb-32 px-4 md:px-6 z-20">
                <div className="max-w-4xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }} 
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-[30px] md:rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden"
                    >
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
                                            <Upload size={20} className={file ? "text-[#d11a2a]" : "text-gray-400"} />
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

            <Footer />
        </div>
    );
}