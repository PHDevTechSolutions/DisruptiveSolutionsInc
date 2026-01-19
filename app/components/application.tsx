"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { 
    collection, 
    onSnapshot, 
    query, 
    orderBy, 
    where, 
    QuerySnapshot, 
    DocumentData 
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Plus, 
    ImageIcon, 
    Check, 
    ChevronRight 
} from "lucide-react";

interface ApplicationProps {
    filteredProducts: any[];
    addToQuote: (product: any) => void;
    quoteCart: any[];
}

export default function ApplicationList({ filteredProducts, addToQuote, quoteCart }: ApplicationProps) {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openId, setOpenId] = useState<string | null>(null);

    useEffect(() => {
        const q = query(
            collection(db, "applications"),
            where("isActive", "==", true),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setApplications(list);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4 p-6">
                {[1, 2, 3].map((n) => (
                    <div key={n} className="h-24 w-full bg-gray-50 animate-pulse rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="border-t border-gray-100">
            {applications.map((app) => {
                const appProducts = filteredProducts.filter((product: any) => {
                    const targetAppTitle = app.title?.toUpperCase();
                    return product.dynamicSpecs?.some((spec: any) => 
                        spec.title?.toUpperCase() === "APPLICATION" && 
                        spec.value?.toUpperCase() === targetAppTitle
                    );
                });

                if (appProducts.length === 0) return null;

                const isOpen = openId === app.id;

                return (
                    <div 
                        key={app.id} 
                        className={`border-b border-gray-100 transition-all duration-300 ${isOpen ? 'bg-gray-50/50' : 'bg-white'}`}
                    >
                        {/* APPLICATION ROW HEADER */}
                        <button
                            onClick={() => setOpenId(isOpen ? null : app.id)}
                            className="w-full flex items-center justify-between p-5 md:p-7 transition-all text-left group"
                        >
                            <div className="flex items-center gap-5 md:gap-8 flex-1">
                                <div className="w-20 h-14 md:w-28 md:h-16 bg-white shrink-0 overflow-hidden rounded-xl border border-gray-100 shadow-sm relative transition-all group-hover:border-[#d11a2a]/30">
                                    {app.imageUrl ? (
                                        <img
                                            src={app.imageUrl}
                                            alt={app.title}
                                            // INALIS ANG GRayscale: Naka-original color na agad
                                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                            <ImageIcon className="text-gray-300" size={20} />
                                        </div>
                                    )}
                                </div>

                                <div className="max-w-xl">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className={`text-sm md:text-base font-black uppercase tracking-tight transition-colors group-hover:text-[#d11a2a] ${isOpen ? 'text-[#d11a2a]' : 'text-gray-900'}`}>
                                            {app.title}
                                        </h3>
                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold shadow-sm transition-all border ${isOpen ? 'bg-[#d11a2a] text-white border-[#d11a2a]' : 'bg-gray-100 text-gray-500 border-gray-200 group-hover:bg-[#d11a2a] group-hover:text-white group-hover:border-[#d11a2a]'}`}>
                                            {appProducts.length}
                                        </span>
                                    </div>
                                    <p className="text-[10px] md:text-[11px] text-gray-600 font-semibold leading-tight line-clamp-1 uppercase tracking-wide italic">
                                        {app.description || "Explore specialized lighting solutions for this application."}
                                    </p>
                                </div>
                            </div>

                            <div className={`p-2 rounded-full transition-all ${isOpen ? 'bg-[#d11a2a] text-white rotate-90' : 'bg-gray-50 text-gray-400 group-hover:text-gray-900'}`}>
                                <ChevronRight size={18} strokeWidth={3} />
                            </div>
                        </button>

                        {/* PRODUCT GRID SECTION */}
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-4 md:p-8 pt-0">
                                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                            {appProducts.map((product: any) => {
                                                const isInCart = quoteCart.some((item: any) => item.id === product.id);
                                                const firstSpecGroup = product.technicalSpecs?.[0];

                                                return (
                                                    <div key={product.id} className="bg-white rounded-xl md:rounded-[24px] overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-gray-300/50 transition-all duration-500 flex flex-col group/card relative">
                                                        <Link href={`/lighting-products-smart-solutions/${product.id}`}>
                                                            <div className="relative h-40 sm:h-48 md:h-56 w-full bg-white p-4 flex items-center justify-center overflow-hidden">
                                                                <img 
                                                                    src={product.mainImage} 
                                                                    // INALIS ANG Grayscale: Malasado at colored na agad ang product images
                                                                    className="max-w-[85%] max-h-[85%] object-contain group-hover/card:scale-110 group-hover/card:blur-[2px] transition-all duration-700" 
                                                                    alt={product.name} 
                                                                />
                                                                
                                                                <motion.div 
                                                                    initial={{ opacity: 0 }} 
                                                                    whileHover={{ opacity: 1 }} 
                                                                    className="absolute inset-0 bg-black/85 backdrop-blur-[2px] flex flex-col justify-center items-center p-4 opacity-0 group-hover/card:opacity-100 transition-all duration-300 z-30"
                                                                >
                                                                    <p className="text-[8px] font-black text-[#d11a2a] uppercase tracking-widest mb-3 italic border-b border-[#d11a2a]/40 pb-1 w-full text-center">Technical Specs</p>
                                                                    <table className="w-full border-collapse">
                                                                        <tbody className="divide-y divide-white/10">
                                                                            {firstSpecGroup?.rows?.slice(0, 5).map((row: any, i: number) => (
                                                                                <tr key={i}>
                                                                                    <td className="py-1.5 text-[7px] md:text-[8px] font-bold text-gray-400 uppercase italic">{row.name}</td>
                                                                                    <td className="py-1.5 text-[8px] md:text-[9px] font-black text-white uppercase text-right">{row.value || "—"}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </motion.div>

                                                                <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-lg text-[7px] md:text-[8px] font-black uppercase tracking-tighter border border-gray-100 shadow-sm z-10">
                                                                    {product.sku}
                                                                </div>
                                                            </div>
                                                        </Link>
                                                        
                                                        <div className="p-4 md:p-5 flex flex-col flex-1 border-t border-gray-50 bg-white z-20">
                                                            <h4 className="text-[10px] md:text-[11px] font-black uppercase italic leading-tight line-clamp-2 min-h-[32px] text-gray-900 group-hover/card:text-[#d11a2a] transition-colors">
                                                                {product.name}
                                                            </h4>
                                                            <button 
                                                                onClick={() => addToQuote(product)}
                                                                className={`mt-4 w-full py-2.5 md:py-3 text-[8px] md:text-[9px] font-black uppercase rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
                                                                    isInCart ? "bg-green-600 text-white" : "bg-gray-900 text-white hover:bg-[#d11a2a]"
                                                                }`}
                                                            >
                                                                {isInCart ? <><Check size={12} strokeWidth={3} /> Added</> : <><Plus size={12} strokeWidth={3} /> Add to Quote</>}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}