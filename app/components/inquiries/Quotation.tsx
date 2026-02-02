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
    Mail, Phone, FileText, Calendar, Trash2, 
    ExternalLink, Search, User, CheckCircle, 
    Clock, MapPin, Building2, X, Filter,
    ChevronLeft, ChevronRight, CheckCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BroadcastDialog from "../BroadcastDialog";
import { toast, Toaster } from "../../components/simple-toast";

type FilterType = "all" | "unread" | "read";
type SortType = "newest" | "oldest";

export default function Quotation() {
    const [quotes, setQuotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedQuote, setSelectedQuote] = useState<any>(null);
    
    // Filter & Sort States
    const [filterStatus, setFilterStatus] = useState<FilterType>("all");
    const [sortBy, setSortBy] = useState<SortType>("newest");
    
    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // --- REAL-TIME FETCH (FILTERED FOR QUOTATIONS ONLY) ---
    useEffect(() => {
        const q = query(
            collection(db, "inquiries"), 
            where("type", "==", "quotation"),
            orderBy("createdAt", "desc")
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const quoteList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setQuotes(quoteList);
            setLoading(false);
        }, (error) => {
            console.error("Firebase Fetch Error:", error);
            toast.error("Failed to load quotations");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // --- OPEN DIALOG & MARK AS READ ---
    const handleViewDetails = async (quote: any) => {
        setSelectedQuote(quote);
        
        if (quote.status === "unread") {
            try {
                await updateDoc(doc(db, "inquiries", quote.id), { 
                    status: "read" 
                });
                toast.success("Marked as read");
            } catch (error) {
                console.error("Error updating status:", error);
                toast.error("Failed to update status");
            }
        }
    };

    // --- DELETE FUNCTION ---
    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        
        const quote = quotes.find(q => q.id === id);
        const quoteName = quote ? `${quote.firstName} ${quote.lastName}` : "this quote";
        
        if (confirm(`Are you sure you want to delete the quote from ${quoteName}?`)) {
            try {
                await deleteDoc(doc(db, "inquiries", id));
                toast.success("Quote deleted successfully");
                
                // Close modal if the deleted quote was open
                if (selectedQuote?.id === id) {
                    setSelectedQuote(null);
                }
            } catch (error) {
                console.error("Error deleting:", error);
                toast.error("Failed to delete quote");
            }
        }
    };

    // --- MARK AS READ/UNREAD ---
    const handleToggleReadStatus = async (quote: any, e: React.MouseEvent) => {
        e.stopPropagation();
        
        const newStatus = quote.status === "read" ? "unread" : "read";
        
        try {
            await updateDoc(doc(db, "inquiries", quote.id), { 
                status: newStatus 
            });
            toast.success(`Marked as ${newStatus}`);
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        }
    };

    const formatDateTime = (timestamp: any) => {
        if (!timestamp) return "No Date";
        try {
            const date = timestamp.toDate();
            return new Intl.DateTimeFormat('en-US', {
                month: 'short', day: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true 
            }).format(date);
        } catch (e) {
            return "Invalid Date";
        }
    };

    // --- FILTERING & SORTING ---
    const filteredAndSortedQuotes = quotes
        .filter(quote => {
            // Search filter
            const searchMatch = 
                `${quote.firstName} ${quote.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quote.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quote.company?.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Status filter
            const statusMatch = 
                filterStatus === "all" ? true :
                filterStatus === "unread" ? quote.status === "unread" :
                quote.status === "read";
            
            return searchMatch && statusMatch;
        })
        .sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            const aTime = a.createdAt.toDate().getTime();
            const bTime = b.createdAt.toDate().getTime();
            return sortBy === "newest" ? bTime - aTime : aTime - bTime;
        });

    // --- PAGINATION ---
    const totalPages = Math.ceil(filteredAndSortedQuotes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentQuotes = filteredAndSortedQuotes.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, sortBy]);

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-gray-400 font-bold uppercase tracking-widest text-xs">
            <Clock className="animate-spin mr-2" size={16} /> Loading Quotations...
        </div>
    );

    return (
        <div className="space-y-7">
            <Toaster />
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Project Quotations</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        Manage incoming custom service requests • {filteredAndSortedQuotes.length} total
                    </p>
                </div>
                
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#d11a2a] transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search clients..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl w-full md:w-80 shadow-sm focus:ring-2 focus:ring-[#d11a2a]/10 outline-none font-medium text-sm transition-all"
                    />
                </div>
            </div>

            {/* Filters & Controls */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-400 uppercase">Status:</span>
                    <div className="flex gap-2">
                        {["all", "unread", "read"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status as FilterType)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                                    filterStatus === status
                                        ? "bg-[#d11a2a] text-white shadow-md"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-6 w-px bg-gray-200" />

                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-400 uppercase">Sort:</span>
                    <div className="flex gap-2">
                        {[
                            { value: "newest", label: "Newest First" },
                            { value: "oldest", label: "Oldest First" }
                        ].map((sort) => (
                            <button
                                key={sort.value}
                                onClick={() => setSortBy(sort.value as SortType)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                                    sortBy === sort.value
                                        ? "bg-gray-900 text-white shadow-md"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                {sort.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <BroadcastDialog />

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                    {currentQuotes.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16 text-gray-400"
                        >
                            <User size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-bold uppercase tracking-widest text-sm">No quotations found</p>
                            <p className="text-xs mt-2">Try adjusting your filters or search term</p>
                        </motion.div>
                    ) : (
                        currentQuotes.map((quote) => (
                            <motion.div
                                key={quote.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                onClick={() => handleViewDetails(quote)}
                                className={`bg-white border p-6 rounded-[2rem] hover:shadow-xl transition-all cursor-pointer relative group ${
                                    quote.status === "unread" ? "border-l-4 border-l-[#d11a2a] border-gray-100" : "border-gray-100"
                                }`}
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex items-start gap-5">
                                        <div className="relative">
                                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                                                <User className={quote.status === "unread" ? "text-[#d11a2a]" : "text-gray-400"} size={24} />
                                            </div>
                                            {quote.status === "unread" && (
                                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#d11a2a] rounded-full border-2 border-white animate-pulse" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-black text-gray-900 leading-none">{quote.firstName} {quote.lastName}</h3>
                                            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-400 uppercase">
                                                <span className="flex items-center gap-1 text-[#d11a2a]"><Building2 size={12} /> {quote.company || "Individual"}</span>
                                                <span className="flex items-center gap-1"><Calendar size={12} /> {formatDateTime(quote.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={(e) => handleToggleReadStatus(quote, e)} 
                                            className={`p-3 rounded-xl transition-all ${
                                                quote.status === "unread" 
                                                    ? "bg-blue-50 text-blue-500 hover:bg-blue-100" 
                                                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                                            }`}
                                            title={quote.status === "unread" ? "Mark as read" : "Mark as unread"}
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                        <button 
                                            onClick={(e) => handleDelete(quote.id, e)} 
                                            className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="Delete quote"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6">
                    <p className="text-xs font-bold text-gray-400 uppercase">
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedQuotes.length)} of {filteredAndSortedQuotes.length}
                    </p>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className={`p-3 rounded-xl transition-all ${
                                currentPage === 1
                                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                    : "bg-gray-900 text-white hover:bg-[#d11a2a]"
                            }`}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        
                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                // Smart pagination: show first, last, and nearby pages
                                let page;
                                if (totalPages <= 5) {
                                    page = i + 1;
                                } else if (currentPage <= 3) {
                                    page = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    page = totalPages - 4 + i;
                                } else {
                                    page = currentPage - 2 + i;
                                }
                                
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                            currentPage === page
                                                ? "bg-[#d11a2a] text-white shadow-md"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className={`p-3 rounded-xl transition-all ${
                                currentPage === totalPages
                                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                    : "bg-gray-900 text-white hover:bg-[#d11a2a]"
                            }`}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* --- DIALOG MODAL --- */}
            <AnimatePresence>
                {selectedQuote && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedQuote(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                            {selectedQuote.firstName} {selectedQuote.lastName}
                                        </h2>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                selectedQuote.status === "unread" 
                                                    ? "bg-red-100 text-red-600" 
                                                    : "bg-green-100 text-green-600"
                                            }`}>
                                                {selectedQuote.status}
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedQuote(null)} 
                                        className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-all"
                                    >
                                        <X size={20}/>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-3xl">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                            <Mail size={16}/> {selectedQuote.email}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                            <Phone size={16}/> {selectedQuote.contactNumber}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                            <MapPin size={16}/> {selectedQuote.streetAddress}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-bold text-gray-600 text-[#d11a2a]">
                                            <Building2 size={16}/> {selectedQuote.company || "Personal"}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Message:</p>
                                    <div className="p-6 bg-white border border-gray-100 rounded-2xl italic text-gray-700 text-sm leading-relaxed">
                                        "{selectedQuote.message || "No message provided."}"
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <a 
                                        href={selectedQuote.attachmentUrl} 
                                        target="_blank"
                                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                                            selectedQuote.attachmentUrl 
                                                ? "bg-gray-900 text-white hover:bg-[#d11a2a]" 
                                                : "bg-gray-100 text-gray-300 pointer-events-none"
                                        }`}
                                    >
                                        <FileText size={18}/> {selectedQuote.attachmentUrl ? "Download Brief" : "No Attachment"}
                                    </a>
                                    <button
                                        onClick={(e) => {
                                            handleDelete(selectedQuote.id, e);
                                        }}
                                        className="flex items-center justify-center gap-2 px-6 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all"
                                    >
                                        <Trash2 size={18}/> Delete
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