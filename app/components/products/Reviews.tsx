"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { 
    collection, query, orderBy, onSnapshot, doc, 
    deleteDoc, updateDoc, where, getDocs, writeBatch 
} from "firebase/firestore";
import { 
    Star, Trash2, Mail, RefreshCw, Eye, EyeOff, Calendar, User, Search, FilterX, CheckSquare, Square
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // BULK SELECTION STATE
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // FILTER STATES
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        const q = query(collection(db, "product_reviews"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredReviews = reviews.filter((review) => {
        const matchesSearch = review.productName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             review.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             review.comment?.toLowerCase().includes(searchQuery.toLowerCase());
        if (!startDate || !endDate) return matchesSearch;
        const reviewDate = review.createdAt?.toDate();
        if (!reviewDate) return matchesSearch;
        const isWithinDate = isWithinInterval(reviewDate, {
            start: startOfDay(new Date(startDate)),
            end: endOfDay(new Date(endDate)),
        });
        return matchesSearch && isWithinDate;
    });

    // --- BULK ACTION LOGIC ---
    const toggleSelect = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Iwasan bumukas yung modal
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedIds.length === filteredReviews.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredReviews.map(r => r.id));
        }
    };

    const handleBulkAction = async (action: 'show' | 'hide' | 'delete') => {
        if (action === 'delete' && !confirm(`Burahin ang ${selectedIds.length} napiling reviews?`)) return;
        
        setIsProcessing(true);
        const batch = writeBatch(db);
        const affectedProducts = new Set<string>();

        try {
            for (const id of selectedIds) {
                const review = reviews.find(r => r.id === id);
                if (!review) continue;
                affectedProducts.add(review.productName);

                const ref = doc(db, "product_reviews", id);
                if (action === 'delete') {
                    batch.delete(ref);
                } else {
                    batch.update(ref, { status: action === 'show' ? 'shown' : 'hidden' });
                }
            }

            await batch.commit();

            // Update product stats for all affected products
            for (const productName of Array.from(affectedProducts)) {
                await updateProductStats(productName);
            }

            alert(`Bulk ${action} successful!`);
            setSelectedIds([]);
        } catch (error) {
            console.error(error);
            alert("Error in bulk action.");
        } finally {
            setIsProcessing(false);
        }
    };

    // --- EXISTING STATS LOGIC ---
    const updateProductStats = async (productName: string) => {
        const reviewsRef = collection(db, "product_reviews");
        const qReviews = query(reviewsRef, where("productName", "==", productName), where("status", "==", "shown"));
        const reviewSnapshot = await getDocs(qReviews);

        let totalStars = 0;
        const shownCount = reviewSnapshot.size;
        reviewSnapshot.forEach((doc) => { totalStars += doc.data().rating; });

        const averageRating = shownCount > 0 ? totalStars / shownCount : 0;
        const productsRef = collection(db, "products");
        const qProducts = query(productsRef, where("name", "==", productName));
        const productSnapshot = await getDocs(qProducts);

        const updatePromises = productSnapshot.docs.map((productDoc) => 
            updateDoc(doc(db, "products", productDoc.id), {
                rating: Number(averageRating.toFixed(1)),
                reviewCount: shownCount
            })
        );
        await Promise.all(updatePromises);
    };

    // --- INDIVIDUAL ACTIONS (FROM MODAL) ---
    const handleToggleShow = async (review: any, shouldShow: boolean) => {
        setIsProcessing(true);
        try {
            const reviewRef = doc(db, "product_reviews", review.id);
            await updateDoc(reviewRef, { status: shouldShow ? "shown" : "hidden" });
            await updateProductStats(review.productName);
            alert(shouldShow ? "Review is now SHOWN!" : "Review is now HIDDEN!");
            setSelectedReview(null);
        } catch (error) {
            console.error(error);
            alert("Error toggling review status.");
        } finally { setIsProcessing(false); }
    };

    const handleDelete = async (review: any) => {
        if (!confirm("Burahin na ba natin 'to?")) return;
        setIsProcessing(true);
        try {
            await deleteDoc(doc(db, "product_reviews", review.id));
            await updateProductStats(review.productName);
            setSelectedReview(null);
        } catch (error) { console.error(error); } finally { setIsProcessing(false); }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <RefreshCw className="text-[#d11a2a] animate-spin" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-white p-6 lg:p-12 text-black font-sans relative">
            <div className="max-w-7xl mx-auto mb-10">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-5xl font-black italic uppercase text-black tracking-tighter mb-2">
                            Review <span className="text-[#d11a2a]">Control.</span>
                        </h1>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em]">
                            Manage Customer Feedback & Product Ratings
                        </p>
                    </div>
                    <button 
                        onClick={selectAll}
                        className="text-[10px] font-black uppercase tracking-widest border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-all"
                    >
                        {selectedIds.length === filteredReviews.length ? "Deselect All" : "Select All Visible"}
                    </button>
                </div>
            </div>

            {/* FILTER SECTION */}
            <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1 w-full">
                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">Search</label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={18} />
                        <input 
                            type="text" 
                            placeholder="PRODUCT, CUSTOMER, OR KEYWORD..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-black rounded-none text-xs font-bold focus:outline-none focus:bg-gray-50 text-black placeholder:text-gray-300 uppercase italic"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap md:flex-nowrap gap-4 w-full md:w-auto">
                    <div className="w-full md:w-40">
                        <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">Start Date</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border-2 border-black p-3 text-[11px] font-black uppercase" />
                    </div>
                    <div className="w-full md:w-40">
                        <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">End Date</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border-2 border-black p-3 text-[11px] font-black uppercase" />
                    </div>
                    <button onClick={() => { setSearchQuery(""); setStartDate(""); setEndDate(""); }} className="w-full md:w-14 mt-5 h-[48px] bg-black text-white flex items-center justify-center hover:bg-[#d11a2a]">
                        <FilterX size={20} />
                    </button>
                </div>
            </div>

            {/* REVIEWS GRID */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
                {filteredReviews.length > 0 ? filteredReviews.map((review) => {
                    const isSelected = selectedIds.includes(review.id);
                    return (
                        <motion.div
                            key={review.id}
                            whileHover={{ y: -5 }}
                            onClick={() => setSelectedReview(review)}
                            className={`bg-white border-2 ${isSelected ? 'border-black bg-gray-50' : review.status === 'shown' ? 'border-green-500/30' : 'border-gray-100'} p-8 rounded-[40px] cursor-pointer relative group transition-all`}
                        >
                            {/* CHECKBOX OVERLAY */}
                            <div 
                                onClick={(e) => toggleSelect(review.id, e)}
                                className="absolute top-6 left-6 z-10 p-1 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                {isSelected ? <CheckSquare size={20} className="text-[#d11a2a]" /> : <Square size={20} className="text-gray-300" />}
                            </div>

                            {review.status === 'shown' && (
                                <div className="absolute top-6 right-8 text-green-600 flex items-center gap-1 text-[8px] font-black uppercase tracking-widest">
                                    <Eye size={10} /> Live
                                </div>
                            )}

                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-4 mb-4 flex items-center gap-2">
                                <Calendar size={12} className="text-[#d11a2a]" />
                                {review.createdAt ? format(review.createdAt.toDate(), "MMM dd, yyyy") : "No Date"}
                            </div>

                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={12} className={`${i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-200"}`} />
                                ))}
                            </div>

                            <h3 className="text-lg font-black uppercase italic truncate text-black group-hover:text-[#d11a2a] transition-colors">
                                {review.productName}
                            </h3>
                            <p className="text-[10px] font-bold text-gray-500 uppercase mt-1 flex items-center gap-1">
                                <User size={10} /> {review.customerName || "Anonymous"}
                            </p>
                            <p className="text-gray-600 text-xs italic line-clamp-3 mt-4 leading-relaxed border-t border-gray-50 pt-4">
                                "{review.comment}"
                            </p>
                        </motion.div>
                    );
                }) : (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-[40px]">
                        <p className="text-gray-400 font-black uppercase italic tracking-widest">No reviews found.</p>
                    </div>
                )}
            </div>

            {/* --- FLOATING BULK ACTION BAR --- */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div 
                        initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] w-full max-w-xl px-4"
                    >
                        <div className="bg-black text-white p-6 rounded-[30px] shadow-2xl flex items-center justify-between border-t-4 border-[#d11a2a]">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Bulk Actions</span>
                                <span className="text-lg font-black italic">{selectedIds.length} Selected</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleBulkAction('show')} className="p-3 bg-green-600 hover:bg-green-700 rounded-2xl transition-all" title="Show All">
                                    <Eye size={20} />
                                </button>
                                <button onClick={() => handleBulkAction('hide')} className="p-3 bg-gray-700 hover:bg-gray-800 rounded-2xl transition-all" title="Hide All">
                                    <EyeOff size={20} />
                                </button>
                                <button onClick={() => handleBulkAction('delete')} className="p-3 bg-[#d11a2a] hover:bg-red-700 rounded-2xl transition-all" title="Delete All">
                                    <Trash2 size={20} />
                                </button>
                                <button onClick={() => setSelectedIds([])} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all ml-2">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- MODAL (HINDI NALAGYAN NG GALAW PARA SA DIALOG) --- */}
            <AnimatePresence>
                {selectedReview && (
                    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedReview(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[60px] w-full max-w-2xl p-12 relative z-[410] shadow-2xl overflow-hidden border border-gray-100 text-black">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-[#d11a2a] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase">{selectedReview.rating} Stars</span>
                                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                            <Calendar size={12} />
                                            {selectedReview.createdAt ? format(selectedReview.createdAt.toDate(), "MMMM dd, yyyy | hh:mm a") : "---"}
                                        </span>
                                    </div>
                                    <h2 className="text-4xl font-black italic text-black uppercase tracking-tighter">{selectedReview.productName}</h2>
                                    <p className="text-gray-500 text-xs font-bold uppercase mt-2 flex items-center gap-2"><User size={14} className="text-[#d11a2a]" /> {selectedReview.customerName}</p>
                                </div>
                                <button onClick={() => setSelectedReview(null)} className="p-4 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"><X size={20}/></button>
                            </div>
                            <div className="bg-gray-50 p-10 rounded-[45px] border-l-[12px] border-[#d11a2a] mb-10 shadow-inner">
                                <p className="text-2xl text-gray-800 italic font-serif leading-tight">"{selectedReview.comment}"</p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <button onClick={() => handleToggleShow(selectedReview, true)} disabled={isProcessing || selectedReview.status === 'shown'} className={`flex-1 py-6 rounded-[30px] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all ${selectedReview.status === 'shown' ? 'bg-gray-100 text-gray-300' : 'bg-green-600 text-white hover:bg-green-700'}`}><Eye size={18}/> Show</button>
                                    <button onClick={() => handleToggleShow(selectedReview, false)} disabled={isProcessing || selectedReview.status !== 'shown'} className={`flex-1 py-6 rounded-[30px] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all ${selectedReview.status !== 'shown' ? 'bg-gray-100 text-gray-300' : 'bg-black text-white hover:bg-gray-900'}`}><EyeOff size={18}/> Hide</button>
                                </div>
                                <div className="flex gap-4">
                                    <a href={`mailto:${selectedReview.customerEmail}`} className="flex-1 bg-gray-100 text-black py-5 rounded-[25px] font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-gray-200 transition-all border border-gray-200"><Mail size={16} /> Email Customer</a>
                                    <button onClick={() => handleDelete(selectedReview)} className="w-24 bg-red-50 text-red-600 py-5 rounded-[25px] flex items-center justify-center border border-red-100 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={20} /></button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Helper icon
function X({ size }: { size: number }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
}