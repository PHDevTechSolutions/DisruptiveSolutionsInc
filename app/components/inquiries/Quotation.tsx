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
    Clock, MapPin, Building2, X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Quotation() {
    const [quotes, setQuotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedQuote, setSelectedQuote] = useState<any>(null);

   // --- REAL-TIME FETCH (FILTERED FOR QUOTATIONS ONLY) ---
    useEffect(() => {
        // Nagdagdag tayo ng where("type", "==", "quotation")
        // para hindi sumama ang mga "product" inquiries o orders dito.
        const q = query(
            collection(db, "inquiries"), 
            where("type", "==", "quotation"), // FILTER: Quotes lang kukunin
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
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // --- OPEN DIALOG & MARK AS READ ---
    const handleViewDetails = async (quote: any) => {
        setSelectedQuote(quote);
        
        // Pagbukas, matic na mag-uupdate ang unread status sa database
        if (quote.status === "unread") {
            try {
                await updateDoc(doc(db, "inquiries", quote.id), { 
                    status: "read" 
                });
            } catch (error) {
                console.error("Error updating status:", error);
            }
        }
    };

    // --- DELETE FUNCTION ---
    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Iwasan na bumukas ang dialog pag nag-delete
        if (confirm("Are you sure you want to delete this quote request?")) {
            try {
                await deleteDoc(doc(db, "inquiries", id));
            } catch (error) {
                console.error("Error deleting:", error);
            }
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

    const filteredQuotes = quotes.filter(quote => 
        `${quote.firstName} ${quote.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-gray-400 font-bold uppercase tracking-widest text-xs">
            <Clock className="animate-spin mr-2" size={16} /> Loading Quotations...
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Project Quotations</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Manage incoming custom service requests</p>
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

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredQuotes.map((quote) => (
                        <motion.div
                            key={quote.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
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
                                    <button onClick={(e) => handleDelete(quote.id, e)} className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 rounded-xl">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* --- DIALOG MODAL --- */}
            <AnimatePresence>
                {selectedQuote && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedQuote(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{selectedQuote.firstName} {selectedQuote.lastName}</h2>
                                    <button onClick={() => setSelectedQuote(null)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><X size={20}/></button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-3xl">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm font-bold text-gray-600"><Mail size={16}/> {selectedQuote.email}</div>
                                        <div className="flex items-center gap-3 text-sm font-bold text-gray-600"><Phone size={16}/> {selectedQuote.contactNumber}</div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm font-bold text-gray-600"><MapPin size={16}/> {selectedQuote.streetAddress}</div>
                                        <div className="flex items-center gap-3 text-sm font-bold text-gray-600 text-[#d11a2a]"><Building2 size={16}/> {selectedQuote.company || "Personal"}</div>
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
                                        href={selectedQuote.attachmentUrl} target="_blank"
                                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                                            selectedQuote.attachmentUrl ? "bg-gray-900 text-white hover:bg-red-600" : "bg-gray-100 text-gray-300 pointer-events-none"
                                        }`}
                                    >
                                        <FileText size={18}/> {selectedQuote.attachmentUrl ? "Download Brief" : "No Attachment"}
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}