"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { 
    collection, query, orderBy, onSnapshot, doc, 
    deleteDoc, updateDoc, where, getDocs, getDoc 
} from "firebase/firestore";
import { 
    Star, X, Trash2, Mail, CheckCircle2, RefreshCw, Eye, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "product_reviews"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const updateProductStats = async (productName: string) => {
        // Kunin lahat ng reviews na "shown" lang (optional, pero mas safe kunin lahat ng existing reviews)
        const reviewsRef = collection(db, "product_reviews");
        const qReviews = query(reviewsRef, where("productName", "==", productName), where("status", "==", "shown"));
        const reviewSnapshot = await getDocs(qReviews);

        let totalStars = 0;
        const shownCount = reviewSnapshot.size;

        reviewSnapshot.forEach((doc) => {
            totalStars += doc.data().rating;
        });

        const averageRating = shownCount > 0 ? totalStars / shownCount : 0;

        // Hanapin ang product document
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

    const handleToggleShow = async (review: any, shouldShow: boolean) => {
        setIsProcessing(true);
        try {
            // 1. Update ang status ng review mismo
            const reviewRef = doc(db, "product_reviews", review.id);
            await updateDoc(reviewRef, {
                status: shouldShow ? "shown" : "hidden"
            });

            // 2. Recalculate at update ang product stats
            await updateProductStats(review.productName);

            alert(shouldShow ? "Review is now SHOWN and added to stats!" : "Review is now HIDDEN and removed from stats!");
            setSelectedReview(null);
        } catch (error) {
            console.error(error);
            alert("Error toggling review status.");
        } finally {
            setIsProcessing(false);
        }
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
        <div className="min-h-screen bg-black flex items-center justify-center">
            <RefreshCw className="text-[#d11a2a] animate-spin" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] p-6 lg:p-12 text-white font-sans">
            <div className="max-w-7xl mx-auto mb-16">
                <h1 className="text-5xl font-black italic uppercase text-white tracking-tighter mb-2">
                    Review <span className="text-[#d11a2a]">Control.</span>
                </h1>
                <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.4em]">
                    Visibility: Show (+Stats) | Hide (-Stats)
                </p>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reviews.map((review) => (
                    <motion.div
                        key={review.id}
                        whileHover={{ y: -5 }}
                        onClick={() => setSelectedReview(review)}
                        className={`bg-[#0a0a0a] border ${review.status === 'shown' ? 'border-green-500/30' : 'border-white/5'} p-8 rounded-[40px] cursor-pointer hover:border-[#d11a2a]/30 transition-all relative`}
                    >
                        {review.status === 'shown' && (
                            <div className="absolute top-4 right-8 text-green-500 flex items-center gap-1 text-[8px] font-black uppercase">
                                <Eye size={10} /> Live
                            </div>
                        )}
                        <div className="flex gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} className={`${i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-zinc-800"}`} />
                            ))}
                        </div>
                        <h3 className="text-lg font-black uppercase italic truncate">{review.productName}</h3>
                        <p className="text-gray-500 text-xs italic line-clamp-2 mt-2">"{review.comment}"</p>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {selectedReview && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setSelectedReview(null)} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#080808] border border-white/10 rounded-[60px] w-full max-w-2xl p-12 relative z-[210]">
                            <h2 className="text-4xl font-black italic text-white uppercase mb-6 tracking-tighter">{selectedReview.productName}</h2>
                            
                            <div className="bg-white/[0.03] p-10 rounded-[45px] border-l-[12px] border-[#d11a2a] mb-10">
                                <p className="text-2xl text-gray-200 italic font-serif leading-tight">"{selectedReview.comment}"</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    {/* SHOW BUTTON */}
                                    <button 
                                        onClick={() => handleToggleShow(selectedReview, true)}
                                        disabled={isProcessing || selectedReview.status === 'shown'}
                                        className={`flex-1 py-6 rounded-[30px] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all ${selectedReview.status === 'shown' ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-900/20'}`}
                                    >
                                        <Eye size={18}/> Show Review
                                    </button>

                                    {/* HIDE BUTTON */}
                                    <button 
                                        onClick={() => handleToggleShow(selectedReview, false)}
                                        disabled={isProcessing || selectedReview.status !== 'shown'}
                                        className={`flex-1 py-6 rounded-[30px] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all ${selectedReview.status !== 'shown' ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-500 shadow-lg shadow-orange-900/20'}`}
                                    >
                                        <EyeOff size={18}/> Hide Review
                                    </button>
                                </div>

                                <div className="flex gap-4">
                                    <a href={`mailto:${selectedReview.customerEmail}`} className="flex-1 bg-white text-black py-5 rounded-[25px] font-black uppercase text-[10px] flex items-center justify-center gap-2">
                                        <Mail size={16} /> Contact Customer
                                    </a>
                                    <button onClick={() => handleDelete(selectedReview)} className="w-24 bg-red-900/10 text-red-600 py-5 rounded-[25px] flex items-center justify-center border border-red-600/20">
                                        <Trash2 size={20} />
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