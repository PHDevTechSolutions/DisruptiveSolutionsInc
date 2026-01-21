"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Calendar, Package, CheckCircle2, MessageSquare } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, addDoc, collection, arrayUnion } from "firebase/firestore";

interface QuotationModalProps {
    isOpen: boolean;
    onClose: () => void;
    inquiry: any;
    userData: any;
    email: string;
    onUpdate: (id: string, newStatus: string) => void;
}

export default function QuotationModal({ isOpen, onClose, inquiry, userData, email, onUpdate }: QuotationModalProps) {
    const [ratings, setRatings] = useState<{ [key: number]: number }>({});
    const [comments, setComments] = useState<{ [key: number]: string }>({});
    const [loadingItem, setLoadingItem] = useState<number | null>(null);

    if (!inquiry) return null;

    // Kunin natin ang listahan ng items na na-review na base sa inquiry data
    // (Dapat may field na `reviewedItems` array sa inquiries doc mo sa Firestore)
    const reviewedItems = inquiry.reviewedItems || [];
    const status = inquiry.status?.toLowerCase() || "pending";

    const handleSubmitReview = async (item: any, index: number) => {
        const itemComment = comments[index] || "";
        const itemRating = ratings[index] || 5;

        if (!itemComment.trim()) {
            alert("Par, paki-sulat naman yung feedback mo para sa item na 'to.");
            return;
        }

        setLoadingItem(index);
        try {
            // 1. ADD TO product_reviews Collection
            await addDoc(collection(db, "product_reviews"), {
                productId: item.id || "N/A",
                productName: item.name,
                productImage: item.image, // Sinama ko na para sa UI ng Admin
                customerName: userData?.fullName || "Anonymous",
                customerEmail: email,
                rating: itemRating,
                comment: itemComment,
                createdAt: new Date(),
                inquiryRef: inquiry.id
            });

            // 2. UPDATE INQUIRY - I-mark itong specific item as reviewed
            const docRef = doc(db, "inquiries", inquiry.id);
            
            // Nag-aadd tayo sa array para malaman kung anong index na ang tapos
            await updateDoc(docRef, { 
                reviewedItems: arrayUnion(index) 
            });

            // 3. CHECK KUNG LAHAT NG ITEMS TAPOS NA
            // Kung ang length ng reviewedItems + 1 (itong current) ay equal sa total items
            const totalItems = inquiry.items?.length || 0;
            const newlyReviewedCount = reviewedItems.length + 1;

            if (newlyReviewedCount === totalItems) {
                await updateDoc(docRef, { status: "reviewed" });
                onUpdate(inquiry.id, "reviewed");
                alert("Salamat par! Lahat ng items sa order na 'to ay na-review mo na.");
                onClose();
            } else {
                alert(`Review submitted for ${item.name}! May ${totalItems - newlyReviewedCount} item(s) pa na natitira.`);
            }

        } catch (error: any) {
            console.error("Review Error:", error);
            alert("Error posting review: " + error.message);
        } finally {
            setLoadingItem(null);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* HEADER */}
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <div>
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white">Item <span className="text-[#d11a2a]">Reviews</span></h3>
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">Order Ref: #{inquiry.id.slice(-8)}</p>
                            </div>
                            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-[#d11a2a] rounded-full transition-all text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {/* ITEMS LIST */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                            {inquiry.items?.map((item: any, i: number) => {
                                const isAlreadyReviewed = reviewedItems.includes(i);

                                return (
                                    <div key={i} className="relative group">
                                        <div className={`flex flex-col md:flex-row gap-6 p-6 rounded-[32px] border transition-all ${
                                            isAlreadyReviewed 
                                            ? "bg-green-500/5 border-green-500/20 opacity-80" 
                                            : "bg-white/[0.03] border-white/5 hover:border-white/10"
                                        }`}>
                                            {/* Product Info */}
                                            <div className="w-full md:w-32 flex-shrink-0">
                                                <div className="aspect-square bg-white rounded-2xl p-2 flex items-center justify-center relative overflow-hidden">
                                                    <img src={item.image} className="object-contain w-full h-full" alt={item.name} />
                                                    {isAlreadyReviewed && (
                                                        <div className="absolute inset-0 bg-green-600/80 flex items-center justify-center">
                                                            <CheckCircle2 size={32} className="text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-3 text-center md:text-left">
                                                    <h5 className="text-[10px] font-black uppercase text-white line-clamp-1">{item.name}</h5>
                                                    <p className="text-[9px] text-gray-500 font-bold uppercase">Qty: {item.quantity}</p>
                                                </div>
                                            </div>

                                            {/* Review Action Area */}
                                            <div className="flex-1">
                                                {status === "finished" && !isAlreadyReviewed ? (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Rate this product</span>
                                                            <div className="flex gap-1 bg-black/40 p-2 rounded-full border border-white/5">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <button key={star} onClick={() => setRatings({...ratings, [i]: star})}>
                                                                        <Star size={16} className={`${star <= (ratings[i] || 5) ? "fill-yellow-500 text-yellow-500" : "text-zinc-700"} transition-all hover:scale-120`} />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <textarea 
                                                            value={comments[i] || ""} 
                                                            onChange={(e) => setComments({...comments, [i]: e.target.value})}
                                                            placeholder="Write your honest feedback here par..."
                                                            className="w-full bg-black/60 border border-white/5 rounded-2xl p-4 text-xs font-medium outline-none focus:border-[#d11a2a]/50 text-white h-24 resize-none transition-all"
                                                        />
                                                        <button 
                                                            onClick={() => handleSubmitReview(item, i)} 
                                                            disabled={loadingItem !== null}
                                                            className="w-full bg-[#d11a2a] hover:bg-white hover:text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                        >
                                                            {loadingItem === i ? "Saving Feedback..." : <><MessageSquare size={14}/> Submit Feedback</>}
                                                        </button>
                                                    </div>
                                                ) : isAlreadyReviewed ? (
                                                    <div className="h-full flex flex-col justify-center items-center py-6 text-green-500">
                                                        <CheckCircle2 size={24} className="mb-2" />
                                                        <p className="text-[10px] font-black uppercase tracking-tighter">Review Recorded</p>
                                                    </div>
                                                ) : (
                                                    <div className="h-full flex items-center justify-center p-6 border-2 border-dashed border-white/5 rounded-3xl">
                                                        <p className="text-[10px] font-bold text-gray-600 uppercase italic">Review opens when order is finished</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}