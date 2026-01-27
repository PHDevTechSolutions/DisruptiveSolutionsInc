"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary"; // Import ang function mo
import FloatingChatWidget  from "../../components/chat-widget";
import {
    ArrowLeft,
    Send,
    User,
    Mail,
    CheckCircle2,
    UploadCloud,
    Phone,
    MapPin,
    Clock,
    Loader2
} from "lucide-react";

function ApplyFormContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const jobId = searchParams.get("jobId");

    const [jobData, setJobData] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loadingJob, setLoadingJob] = useState(true);

    // --- FETCH JOB DETAILS (No changes) ---
    useEffect(() => {
        async function fetchJob() {
            if (!jobId) return;
            try {
                const docRef = doc(db, "careers", jobId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setJobData(docSnap.data());
                }
            } catch (error) {
                console.error("Error fetching job details:", error);
            } finally {
                setLoadingJob(false);
            }
        }
        fetchJob();
    }, [jobId]);

    // --- FILE CHANGE (No changes) ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name);
            setFile(e.target.files[0]);
        }
    };
// --- SUBMIT LOGIC ---
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return alert("Please upload your resume.");

    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Generate reference ID para sa email at database
    const referenceId = `APP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    try {
        // 1. Upload sa Cloudinary
        const resumeUrl = await uploadToCloudinary(file);

        // Kunin ang values mula sa form fields
        const applicantName = formData.get("fullName") as string;
        const applicantEmail = formData.get("email") as string;
        const jobTitle = jobData?.title || searchParams.get("jobTitle") || "Unknown Position";

        // 2. I-prepare ang data para sa "inquiries" collection (Firebase)
        const applicationData = {
            referenceId: referenceId,
            jobId: jobId,
            jobTitle: jobTitle,
            fullName: applicantName,
            email: applicantEmail,
            phone: formData.get("phone"),
            resumeUrl: resumeUrl,
            type: "job",           
            status: "unread",      
            internalStatus: "pending", 
            appliedAt: serverTimestamp(),
        };

        // Save to Firebase
        await addDoc(collection(db, "inquiries"), applicationData);

        // 3. I-SEND ANG EMAIL (Calling your API Route)
        const emailRes = await fetch("/api/apply", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                jobId: jobId || referenceId,
                jobTitle: jobTitle,
                name: applicantName,
                email: applicantEmail,
                phone: formData.get("phone"),
                linkedin: "", // Optional field
                message: `New application received via website. Resume link: ${resumeUrl}`
            }),
        });

        if (!emailRes.ok) {
            console.warn("Firebase saved but email failed to send.");
        }

        alert("Application submitted successfully!");
        router.push("/careers"); 

    } catch (error: any) {
        console.error("Submission Error:", error);
        alert(error.message || "Something went wrong.");
    } finally {
        setIsSubmitting(false);
    }
};

    return (
        <div className="min-h-screen bg-[#fafafa] font-sans selection:bg-[#d11a2a]/10">
            <FloatingChatWidget/>
            <nav className="max-w-7xl mx-auto p-6 md:p-10">
                <Link href="/careers" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#d11a2a] transition-all group">
                    <div className="p-2 rounded-full bg-white shadow-sm group-hover:bg-red-50 transition-all">
                        <ArrowLeft size={14} />
                    </div>
                    Back to Job Openings
                </Link>
            </nav>

            <main className="max-w-7xl mx-auto px-6 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT SIDE: JOB DESCRIPTION & SUMMARY */}
                    <div className="lg:col-span-5 space-y-8">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <span className="text-[#d11a2a] text-[11px] font-black uppercase tracking-[0.4em] mb-4 block italic">
                                {loadingJob ? "Loading Position..." : `Applying for ${jobData?.category || "Position"}`}
                            </span>
                            <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-[0.9] mb-6">
                                {jobData?.title || searchParams.get("jobTitle")}
                            </h1>

                            <div className="flex flex-wrap gap-4 mt-6">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-gray-100">
                                    <MapPin size={12} className="text-[#d11a2a]" /> {jobData?.location || "Remote / Office"}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-gray-100">
                                    <Clock size={12} className="text-[#d11a2a]" /> {jobData?.jobType || "Full-time"}
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                            className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8"
                        >
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d11a2a] mb-4">Job Overview</h3>
                                <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                    {jobData?.description || "Join our team and help us build the future of tech infrastructure."}
                                </p>
                            </div>

                            {jobData?.qualifications && jobData.qualifications.length > 0 && (
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d11a2a] mb-4">Key Qualifications</h3>
                                    <ul className="space-y-3">
                                        {jobData.qualifications.map((q: string, i: number) => (
                                            <motion.li
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                key={i}
                                                className="flex items-start gap-3 text-[13px] font-medium text-gray-700"
                                            >
                                                <CheckCircle2 size={16} className="text-[#d11a2a] mt-0.5 shrink-0" />
                                                <span>{q}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-50">
                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Reference ID: {jobId?.substring(0, 8).toUpperCase()}</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT SIDE: THE FORM */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-7 bg-white p-8 md:p-14 rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-white"
                    >
                        <form onSubmit={handleSubmit} className="space-y-7">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input required name="fullName" type="text" placeholder="Juan Dela Cruz" className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-[#d11a2a] transition-all outline-none text-sm font-bold" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input required name="email" type="email" placeholder="juan@gmail.com" className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-[#d11a2a] transition-all outline-none text-sm font-bold" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input required name="phone" type="tel" placeholder="0912 345 6789" className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-[#d11a2a] transition-all outline-none text-sm font-bold" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Resume / CV (PDF Only)</label>
                                <div className="relative">
                                    <input type="file" id="resume" accept=".pdf" className="hidden" onChange={handleFileChange} required />
                                    <label htmlFor="resume" className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-[2.5rem] bg-gray-50 hover:bg-red-50 hover:border-[#d11a2a] transition-all cursor-pointer group text-center">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                            {isSubmitting ? <Loader2 className="animate-spin text-[#d11a2a]" size={32} /> : (fileName ? <CheckCircle2 className="text-green-500" size={32} /> : <UploadCloud className="text-[#d11a2a]" size={32} />)}
                                        </div>
                                        <p className="text-sm font-black uppercase tracking-tight text-gray-900">
                                            {fileName ? fileName : "Click to upload resume"}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Maximum size: 5MB</p>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button type="submit" disabled={isSubmitting} className="w-full bg-gray-900 text-white py-6 rounded-[1.5rem] font-black uppercase text-[12px] tracking-[0.3em] shadow-xl hover:bg-[#d11a2a] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50">
                                    {isSubmitting ? "Sending..." : "Submit Application"} <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

export default function ApplyPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading Form...</div>}>
            <ApplyFormContent />
        </Suspense>
    );
}