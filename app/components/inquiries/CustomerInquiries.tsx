"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { 
    collection, query, orderBy, onSnapshot, 
    deleteDoc, doc, updateDoc 
} from "firebase/firestore";
import { 
    Mail, Phone, Trash2, Search, Clock, 
    Calendar, MessageSquare, Eye, X, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BroadcastDialog from "../BroadcastDialog";


interface Inquiry {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    message: string;
    submittedAt: any;
    status?: string; // Idinagdag natin ito para sa Read/Unread
    website?: string; // Added website field
}

export default function CustomerInquiries() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedWebsite, setSelectedWebsite] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [availableWebsites, setAvailableWebsites] = useState<any[]>([]);
    const itemsPerPage = 10;

    const COLLECTION_NAME = "inquiries"; // Siguraduhing tugma sa Firebase mo

    // --- REAL-TIME FETCH ---
    useEffect(() => {
        const q = query(collection(db, COLLECTION_NAME), orderBy("submittedAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Inquiry[];
            setInquiries(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- FETCH WEBSITES ---
    useEffect(() => {
        const qWeb = query(collection(db, "websites"), orderBy("name", "asc"));
        const unsubscribe = onSnapshot(qWeb, (snapshot) => {
            const webs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAvailableWebsites(webs);
        });
        return () => unsubscribe();
    }, []);

    // --- VIEW & MARK AS READ ---
    const handleViewInquiry = async (item: Inquiry) => {
        setSelectedInquiry(item);
        
        // Pag-click, automatic magiging 'read' sa database
        if (item.status !== "read") {
            try {
                await updateDoc(doc(db, COLLECTION_NAME, item.id), {
                    status: "read"
                });
            } catch (error) {
                console.error("Error updating status:", error);
            }
        }
    };

    // --- DELETE FUNCTION ---
    const deleteInquiry = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this inquiry?")) {
            try {
                await deleteDoc(doc(db, COLLECTION_NAME, id));
                if (selectedInquiry?.id === id) setSelectedInquiry(null);
            } catch (error) {
                console.error("Delete error:", error);
            }
        }
    };
const formatFullDate = (timestamp: any) => {
    if (!timestamp) return "---";
    try {
        // Gagamit tayo ng toLocaleString para kasama ang time
        return timestamp.toDate().toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true // Para sa AM/PM format
        });
    } catch (e) { 
        return "Invalid Date"; 
    }
};

    const filteredInquiries = inquiries.filter(item => {
        const matchesSearch = item.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesWebsite = selectedWebsite === "all" || item.website === selectedWebsite;
        const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
        
        return matchesSearch && matchesWebsite && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
    const paginatedInquiries = filteredInquiries.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedWebsite, selectedStatus]);

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-gray-400 font-bold uppercase tracking-widest text-xs">
            <Clock className="animate-spin mr-2" size={16} /> Loading Inquiries...
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Customer Inquiries</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">General messages and project leads</p>
                </div>
                
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#d11a2a] transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl w-full md:w-80 shadow-sm focus:ring-2 focus:ring-[#d11a2a]/10 outline-none font-medium text-sm transition-all"
                    />
                </div>
            </div>

            {/* Filter Section */}
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                <BroadcastDialog/>
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
                    {availableWebsites.map((website) => (
                        <option key={website.id} value={website.name || website.id}>
                            {website.name || website.id}
                        </option>
                    ))}
                </select>

                {/* Results Count */}
                <div className="flex items-center justify-center px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-600">
                    {filteredInquiries.length} result{filteredInquiries.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Inquiries List */}
            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                    {paginatedInquiries.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={() => handleViewInquiry(item)}
                            className={`bg-white border p-6 rounded-[2rem] hover:shadow-xl transition-all group cursor-pointer relative ${
                                item.status !== "read" ? "border-l-4 border-l-[#d11a2a] border-gray-100" : "border-gray-100"
                            }`}
                        >
                            {/* Unread Indicator Dot */}
                            {item.status !== "read" && (
                                <span className="absolute top-6 right-6 w-2 h-2 bg-[#d11a2a] rounded-full animate-pulse" />
                            )}
                            {/* Inquiry Details */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold">{item.fullName}</h3>
                                    <p className="text-sm text-gray-600">Submitted: {formatFullDate(item.submittedAt)}</p>
                                </div>
                                <button onClick={(e) => deleteInquiry(item.id, e)}>
                                    <Trash2 className="text-gray-400 hover:text-[#d11a2a]" size={20} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between gap-4 mt-6 flex-wrap">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-6 py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed hover:bg-gray-50 disabled:hover:bg-white transition-all"
                    >
                        Previous
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
                        Next
                    </button>
                </div>
            )}

            {/* Info Text */}
            {filteredInquiries.length > 0 && (
                <div className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredInquiries.length)} of {filteredInquiries.length} inquiries
                </div>
            )}

            {/* --- MODAL DIALOG --- */}
            <AnimatePresence>
                {selectedInquiry && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedInquiry(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                            <button onClick={() => setSelectedInquiry(null)} className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={24} /></button>
                            
                            <div className="mb-8">
                                <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center text-[#d11a2a] mb-6">
                                    <MessageSquare size={32} />
                                </div>
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900">{selectedInquiry.fullName}</h2>
                                <p className="text-[#d11a2a] text-[10px] font-black uppercase tracking-[0.3em] mt-2">Submitted: {formatFullDate(selectedInquiry.submittedAt)}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <div className="p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Email</p>
                                    <p className="text-sm font-bold text-gray-800 break-words">{selectedInquiry.email}</p>
                                </div>
                                <div className="p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Phone</p>
                                    <p className="text-sm font-bold text-gray-800">{selectedInquiry.phone}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="p-8 bg-black rounded-[2rem] text-white text-sm leading-relaxed italic relative">
                                    <div className="absolute -top-3 left-6 bg-[#d11a2a] px-3 py-1 rounded-full text-[8px] font-black uppercase">Message</div>
                                    "{selectedInquiry.message}"
                                </div>
                            </div>

                            <button onClick={() => setSelectedInquiry(null)} className="w-full mt-8 py-5 bg-gray-100 text-gray-900 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-black hover:text-white transition-all">
                                Close Inquiry
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
