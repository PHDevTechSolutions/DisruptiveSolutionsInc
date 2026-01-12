"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import {
    ArrowRight,
    ChevronUp,
    Briefcase,
    Globe,
    ChevronDown,
    CheckCircle2,
    Star,
    Lightbulb,
    Target,
    Zap,
    Users
} from "lucide-react";

export default function CareersPage() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedJob, setExpandedJob] = useState<string | null>(null);

    const LOGO_RED = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-red-scaled.png";
    const LOGO_WHITE = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-white-scaled.png";

    useEffect(() => {
        const q = query(collection(db, "careers"), orderBy("createdAt", "desc"), where("website", "==", "Disruptive"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setJobs(jobsData.filter((job: any) => job.status === "Open"));
            setLoading(false);
        }, () => setLoading(false));
        return () => unsubscribe();
    }, []);

    const [activeCategory, setActiveCategory] = useState("All");

    // Kunin ang lahat ng unique categories mula sa jobs data
    const categories = ["All", ...Array.from(new Set(jobs.map(job => job.category)))];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const benefits = [
        { icon: <Zap className="text-[#d11a2a]" />, title: "Fast-Growing and Innovative", desc: "Be at the forefront of the Philippine tech-infrastructure shift." },
        { icon: <Target className="text-[#d11a2a]" />, title: "Learn and Grow", desc: "Mentorship and hands-on training to become an industry expert." },
        { icon: <Users className="text-[#d11a2a]" />, title: "Collaborative Team Culture", desc: "Work in a dynamic, fun, and supportive environment." },
        { icon: <Lightbulb className="text-[#d11a2a]" />, title: "Driven by Sustainability and Tech", desc: "Contribute to projects that make a real impact." },
        { icon: <Star className="text-[#d11a2a]" />, title: "Competitive Compensation", desc: "We value top talent and offer excellent benefits." },
    ];

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-[#d11a2a]/10 selection:text-[#d11a2a] overflow-x-hidden">

            {/* --- NAVIGATION --- */}
            <nav className="fixed top-0 left-0 w-full z-[1000] py-3 md:py-4 transition-all">
                <motion.div
                    animate={{
                        backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.98)" : "rgba(255, 255, 255, 0)",
                        boxShadow: isScrolled ? "0 4px 20px rgba(0,0,0,0.05)" : "none"
                    }}
                    className="absolute inset-0"
                />
                <div className="max-w-7xl mx-auto px-5 flex items-center justify-between relative z-10">
                    <Link href="/">
                        <img src={LOGO_RED} alt="Logo" className="h-7 md:h-10 transition-all" />
                    </Link>
                    <Link href="/dashboard" className="bg-[#d11a2a] text-white px-5 py-2 md:px-7 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                        back home
                    </Link>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-16 md:pt-48 md:pb-32 px-5">
                <div className="max-w-7xl mx-auto text-center md:text-left">
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#d11a2a] text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] mb-4 block italic">
                        Career Opportunities
                    </motion.span>
                    <h1 className="text-6xl md:text-7xl font-black text-gray-900 tracking-tighter uppercase leading-[0.9] mb-10">
                        Join the <br className="hidden md:block" /> <span className="text-[#d11a2a]">Revolution</span>
                    </h1>
                </div>

                <br></br>

                {/* --- JOB LIST --- */}

                <div className="max-w-7xl mx-auto">
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
                    >
                        {loading ? (
                            [1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-64 w-full bg-gray-50 animate-pulse rounded-[2.5rem]" />
                            ))
                        ) : (
                            jobs
                                .filter(job => activeCategory === "All" || job.category === activeCategory)
                                .map((job) => (
                                    <motion.div
                                        layout // Ito ang magic para sa smooth transition ng surrounding elements
                                        key={job.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        className={`relative rounded-[2rem] md:rounded-[2.5rem] border transition-shadow duration-500 h-fit ${expandedJob === job.id
                                                ? 'bg-gray-50 border-[#d11a2a] shadow-2xl z-10'
                                                : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-lg z-0'
                                            }`}
                                    >
                                        <div
                                            className="p-8 md:p-10 cursor-pointer flex flex-col gap-6"
                                            onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase rounded-md tracking-widest">{job.category}</span>
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">{job.jobType}</span>
                                                </div>
                                                <motion.div
                                                    animate={{ rotate: expandedJob === job.id ? 180 : 0 }}
                                                    className={`w-10 h-10 flex items-center justify-center rounded-full ${expandedJob === job.id ? 'bg-[#d11a2a] text-white' : 'bg-gray-50 text-gray-400'}`}
                                                >
                                                    <ChevronDown size={20} />
                                                </motion.div>
                                            </div>

                                            <div>
                                                <h3 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight leading-[1.1] mb-2 group-hover:text-[#d11a2a] transition-colors">
                                                    {job.title}
                                                </h3>
                                                <p className="text-gray-500 text-[13px] flex items-center gap-1.5 font-bold italic">
                                                    <Globe size={14} className="text-[#d11a2a]" /> {job.location}
                                                </p>
                                            </div>
                                        </div>

                                       {/* Hanapin ang part na ito sa page.tsx mo */}
<AnimatePresence>
    {expandedJob === job.id && (
        <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden"
        >
            <div className="px-6 md:px-10 pb-10 pt-6 border-t border-gray-200">
                <h4 className="text-[9px] font-black uppercase text-[#d11a2a] tracking-widest mb-4">Qualifications:</h4>
                <ul className="space-y-3 mb-8">
                    {job.qualifications?.map((q: string, i: number) => (
                        <li key={i} className="flex gap-3 text-sm text-gray-700 font-medium leading-tight">
                            <CheckCircle2 size={16} className="text-[#d11a2a] shrink-0 mt-0.5" /> {q}
                        </li>
                    ))}
                </ul>

                {/* DITO MO ILALAGAY YUNG <Link> COMPONENT */}
                <Link 
                    href={{
                        pathname: '/careers/apply',
                        query: { 
                            jobId: job.id, 
                            jobTitle: job.title 
                        },
                    }}
                    className="w-full md:w-auto bg-gray-900 text-white px-8 py-5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#d11a2a] transition-all shadow-lg flex items-center justify-center gap-3"
                >
                    Apply for this position <ArrowRight size={16} />
                </Link>
                
            </div>
        </motion.div>
    )}
</AnimatePresence>
                                    </motion.div>
                                ))
                        )}
                    </motion.div>
                </div>
            </section>

            {/* --- WHY WORK WITH US SECTION --- */}
            <section className="py-20 md:py-32 bg-gray-50 px-5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 mb-4">
                            <Star className="text-yellow-500 fill-yellow-500" size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">Why Work With Us</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-gray-900 leading-[0.9]">
                            Our Culture & <span className="text-[#d11a2a]">Benefits</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {benefits.map((b, i) => (
                            <motion.div
                                whileHover={{ y: -5 }}
                                key={i}
                                className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center md:items-start md:text-left gap-4"
                            >
                                <div className="p-4 bg-red-50 rounded-2xl">
                                    {/* Ganito ang tamang paraan para i-render ang Lucide icons na nasa array */}
                                    {React.cloneElement(b.icon as React.ReactElement<any>, { size: 28 })}
                                </div>
                                <div>
                                    <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-gray-900 mb-2 leading-tight">{b.title}</h3>
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{b.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* FOOTER CTA */}
                    <div className="mt-24 text-center">
                        <div className="bg-white p-8 md:p-16 rounded-[3rem] border border-gray-100 shadow-xl max-w-4xl mx-auto relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><Lightbulb size={120} /></div>
                            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 mb-6">
                                Still looking for your <br /> <span className="text-[#d11a2a]">spot on the team?</span>
                            </h3>
                            <p className="text-gray-500 font-medium mb-8 max-w-xl mx-auto text-sm md:text-base italic">
                                We're always on the lookout for passionate people who want to make an impact.
                            </p>
                            <a href="mailto:info@disruptivesolutions.ph" className="inline-flex items-center gap-2 text-sm md:text-lg font-black text-[#d11a2a] border-b-2 border-[#d11a2a] pb-1 hover:text-gray-900 hover:border-gray-900 transition-all uppercase tracking-widest">
                                info@disruptivesolutions.ph
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-black text-white py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <img src={LOGO_WHITE} alt="Logo" className="h-6 md:h-8 opacity-50" />
                    <p className="text-[10px] font-bold text-gray-600 tracking-[0.3em] uppercase">© 2026 Disruptive Solutions Inc.</p>
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 text-gray-500 hover:text-white transition-all text-[10px] font-black uppercase">
                        Back to Top <ChevronUp size={16} />
                    </button>
                </div>
            </footer>
        </div>
    );
}