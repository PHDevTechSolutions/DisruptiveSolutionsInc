"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    deleteDoc,
    updateDoc,
    where
} from "firebase/firestore";
import {
    Mail,
    Phone,
    FileText,
    Calendar,
    Briefcase,
    Trash2,
    ExternalLink,
    Search,
    User,
    CheckCircle,
    Clock,
    X,
    ChevronRight,
    Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BroadcastDialog from "../BroadcastDialog";

export default function ApplicationInquiries() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedApp, setSelectedApp] = useState<any | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedWebsite, setSelectedWebsite] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const itemsPerPage = 10;

    useEffect(() => {
        const q = query(
            collection(db, "inquiries"),
            where("type", "==", "job"),
            orderBy("appliedAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const appList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setApplications(appList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const formatDateTime = (timestamp: any) => {
        if (!timestamp) return "---";
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date);
    };

    const markAsRead = async (id: string, currentStatus: string) => {
        if (currentStatus === "unread") {
            try {
                await updateDoc(doc(db, "inquiries", id), { status: "read" });
            } catch (error) {
                console.error("Error marking as read:", error);
            }
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this application?")) {
            try {
                await deleteDoc(doc(db, "inquiries", id));
                if (selectedApp?.id === id) setSelectedApp(null);
            } catch (error) {
                console.error("Error deleting:", error);
            }
        }
    };

    const toggleInternalStatus = async (e: React.MouseEvent, id: string, currentStatus: string) => {
        e.stopPropagation();
        const nextStatus = currentStatus === "reviewed" ? "pending" : "reviewed";
        try {
            await updateDoc(doc(db, "inquiries", id), { internalStatus: nextStatus });
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const filteredApps = applications.filter(app => {
        const matchesSearch = app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesWebsite = selectedWebsite === "all" || app.website === selectedWebsite;
        const matchesStatus = selectedStatus === "all" || app.status === selectedStatus;
        
        return matchesSearch && matchesWebsite && matchesStatus;
    });

    // Get unique websites from applications
    const websites = ["all", ...Array.from(new Set(applications.map(app => app.website).filter(Boolean)))];

    // Pagination
    const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
    const paginatedApps = filteredApps.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedWebsite, selectedStatus]);

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-gray-400 font-bold uppercase tracking-widest text-xs">
            <Clock className="animate-spin mr-2" size={16} /> Loading Applications...
        </div>
    );

    return (
        <div className="space-y-8 relative">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Job Applications</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Manage resumes and candidates</p>
                    
                </div>
                
                <div className="relative group">
                    
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#d11a2a] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search candidates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl w-full md:w-80 shadow-sm focus:ring-2 focus:ring-[#d11a2a]/10 outline-none font-medium text-sm transition-all"
                    />
                </div>
                
            </div>
            
            <BroadcastDialog/>

            {/* Filter Section */}
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                {/* Status Filter */}
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-3 bg-white border border-gray-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-[#d11a2a]/10 cursor-pointer"
                >
                    <option value="all">All Status</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                </select>

                {/* Website Filter */}
                <select
                    value={selectedWebsite}
                    onChange={(e) => setSelectedWebsite(e.target.value)}
                    className="px-4 py-3 bg-white border border-gray-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-[#d11a2a]/10 cursor-pointer"
                >
                    <option value="all">All Websites</option>
                    {websites.slice(1).map((website) => (
                        <option key={website} value={website}>
                            {website}
                        </option>
                    ))}
                </select>

                {/* Results Count */}
                <div className="flex items-center justify-center px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-600">
                    {filteredApps.length} result{filteredApps.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* List Section */}
            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                    {paginatedApps.map((app) => (
                        <motion.div
                            key={app.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={() => {
                                setSelectedApp(app);
                                markAsRead(app.id, app.status);
                            }}
                            className={`bg-white border p-6 rounded-[2rem] hover:shadow-xl transition-all group cursor-pointer ${
                                app.status === "unread" ? "border-l-4 border-l-[#d11a2a] border-gray-100" : "border-gray-100"
                            }`}
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex items-start gap-5">
                                    <div className="relative">
                                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-red-50 transition-colors">
                                            <User className="text-gray-400 group-hover:text-[#d11a2a]" size={24} />
                                        </div>
                                        {app.status === "unread" && (
                                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#d11a2a] rounded-full border-2 border-white animate-pulse" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black text-gray-900 leading-none">{app.fullName}</h3>
                                        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <span className="flex items-center gap-1 text-[#d11a2a]">
                                                <Briefcase size={12} /> {app.jobTitle}
                                            </span>
                                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                                                <Calendar size={12} className="text-gray-400" />
                                                {formatDateTime(app.appliedAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={(e) => toggleInternalStatus(e, app.id, app.internalStatus)}
                                        className={`p-3 rounded-xl transition-all ${app.internalStatus === "reviewed" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400 hover:bg-green-50"}`}
                                    >
                                        <CheckCircle size={18} />
                                    </button>
                                    <button 
                                        onClick={(e) => handleDelete(e, app.id)}
                                        className="p-3 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <ChevronRight className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {paginatedApps.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
                        <p className="text-xs font-black text-gray-300 uppercase tracking-[0.3em]">No applications found</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between gap-4 mt-6 flex-wrap">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-6 py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed hover:bg-gray-50 disabled:hover:bg-white transition-all"
                    >
                        ← Previous
                    </button>

                    <div className="flex items-center gap-2 flex-wrap justify-center">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                                    currentPage === page
                                        ? "bg-[#d11a2a] text-white"
                                        : "bg-white border border-gray-100 text-gray-700 hover:border-[#d11a2a]/30"
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-6 py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed hover:bg-gray-50 disabled:hover:bg-white transition-all"
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* Info Text */}
            {filteredApps.length > 0 && (
                <div className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredApps.length)} of {filteredApps.length} applications
                </div>
            )}

            {/* Modal/Dialog Section */}
            <AnimatePresence>
                {selectedApp && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedApp(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 md:p-12">
                                <button 
                                    onClick={() => setSelectedApp(null)}
                                    className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center">
                                        <User className="text-[#d11a2a]" size={40} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">{selectedApp.fullName}</h2>
                                        <p className="text-[#d11a2a] font-bold uppercase tracking-widest text-sm">{selectedApp.jobTitle}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-gray-50 rounded-2xl"><Mail size={20} className="text-gray-400" /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                                                <p className="font-bold text-gray-700">{selectedApp.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-gray-50 rounded-2xl"><Phone size={20} className="text-gray-400" /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                                                <p className="font-bold text-gray-700">{selectedApp.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-gray-50 rounded-2xl"><Calendar size={20} className="text-gray-400" /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Applied On</p>
                                                <p className="font-bold text-gray-700">{formatDateTime(selectedApp.appliedAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
<div className="flex flex-col sm:flex-row gap-4">
    <button
        onClick={() => {
            if (!selectedApp.resumeUrl) return;

            // STEP 1: Linisin ang URL (Tanggalin ang f_auto,q_auto na nagiging WebP)
            const cleanResumeUrl = selectedApp.resumeUrl
                .replace("/f_auto,q_auto/", "/")
                .replace("/upload/", "/upload/fl_attachment/");

            // STEP 2: Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = cleanResumeUrl;
            // Pilitin ang filename na maging PDF
            link.download = `${selectedApp.fullName.replace(/\s+/g, '_')}_CV.pdf`;
            link.target = "_self";
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }}
        className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-5 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-[#d11a2a] transition-all cursor-pointer border-none"
    >
        <FileText size={18} /> Download CV <Download size={14} />
    </button>

    <button 
        onClick={() => setSelectedApp(null)}
        className="px-8 py-5 border-2 border-gray-100 text-gray-400 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all cursor-pointer"
    >
        Close
    </button>
</div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
