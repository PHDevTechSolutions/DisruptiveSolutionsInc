"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, limit, query } from "firebase/firestore";
import { 
  ArrowLeft, 
  Plus, 
  Check, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp,
  Minus
} from "lucide-react";
import { motion } from "framer-motion";

// --- COMPONENTS ---
import QuoteCartPanel from "../../components/QuoteCartPanel";

// --- SWIPER IMPORTS ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQty, setSelectedQty] = useState(1);
  const [isInCart, setIsInCart] = useState(false);

  // Check kung ang product ay nasa local storage cart na
  const checkCartStatus = useCallback(() => {
    const savedCart = JSON.parse(localStorage.getItem("disruptive_quote_cart") || "[]");
    setIsInCart(savedCart.some((item: any) => item.id === id));
  }, [id]);

  useEffect(() => {
    checkCartStatus();
    window.addEventListener("cartUpdated", checkCartStatus);
    return () => window.removeEventListener("cartUpdated", checkCartStatus);
  }, [checkCartStatus]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "products", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }

        const q = query(collection(db, "products"), limit(12));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.id !== id);
        
        setRelatedProducts(products.sort(() => 0.5 - Math.random()));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const addToQuote = (prod: any) => {
    const currentCart = JSON.parse(localStorage.getItem("disruptive_quote_cart") || "[]");
    const existingItemIndex = currentCart.findIndex((item: any) => item.id === prod.id);

    let updatedCart;
    if (existingItemIndex > -1) {
      updatedCart = [...currentCart];
      updatedCart[existingItemIndex].quantity = (updatedCart[existingItemIndex].quantity || 1) + selectedQty;
    } else {
      updatedCart = [...currentCart, { ...prod, quantity: selectedQty }];
    }

    localStorage.setItem("disruptive_quote_cart", JSON.stringify(updatedCart));
    // Ito ang magti-trigger sa QuoteCartPanel para magbukas at mag-update
    window.dispatchEvent(new Event("cartUpdated"));
    setSelectedQty(1);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#d11a2a]" /></div>;
  if (!product) return <div className="h-screen flex items-center justify-center text-xs font-black uppercase tracking-widest">Product Not Found</div>;

  return (
    <div className="min-h-screen bg-white pb-12 relative font-sans selection:bg-[#d11a2a] selection:text-white overflow-x-hidden">
      
      {/* --- NILAGAY NA NATIN ANG CART PANEL DITO --- */}
      <QuoteCartPanel />

      <nav className="p-4 md:p-5 border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] hover:text-[#d11a2a] transition-colors">
            <ArrowLeft size={14}/> Back
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-6 mt-8 md:mt-12">
        <div className="grid lg:grid-cols-12 gap-8 md:gap-12 items-start">
          
          <div className="lg:col-span-5 bg-white rounded-2xl md:rounded-[32px] p-6 md:p-10 border border-gray-100 shadow-sm md:sticky md:top-24 flex items-center justify-center">
            <img src={product.mainImage} className="max-h-[250px] md:max-h-[400px] w-full object-contain" alt={product.name} />
          </div>

          <div className="lg:col-span-7 space-y-8 md:space-y-10">
            <div>
              <div className="flex gap-2 mb-3">
                {product.brands?.map((brand: string) => (
                  <span key={brand} className="px-2 py-0.5 bg-gray-900 text-white text-[8px] font-black uppercase tracking-widest rounded">{brand}</span>
                ))}
              </div>
              <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-tight mb-4 text-gray-900 italic">
                {product.name}
              </h1>
              {product.shortDescription && (
                <p className="text-sm md:text-base font-medium text-gray-500 leading-relaxed mb-6 max-w-xl">
                  {product.shortDescription}
                </p>
              )}
              <p className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.2em]">SKU: {product.sku || "N/A"}</p>
            </div>

            {/* TECHNICAL SPECS */}
            <div className="space-y-6">
              {product.technicalSpecs?.map((specGroup: any) => (
                <div key={specGroup.id} className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#d11a2a]">{specGroup.label}</h3>
                  <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full border-collapse bg-white text-left">
                      <tbody>
                        {specGroup.rows?.map((row: any, idx: number) => (
                          <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                            <td className="w-2/5 p-3 md:p-3.5 bg-gray-50/30 text-[9px] md:text-[10px] font-bold text-gray-400 uppercase border-r border-gray-50 italic">{row.name}</td>
                            <td className="p-3 md:p-3.5 text-[10px] md:text-[12px] font-semibold text-gray-700 uppercase">{row.value || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t border-gray-100">
              <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-2 bg-gray-50">
                <button onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))} className="p-1 hover:text-[#d11a2a] transition-colors"><Minus size={14} /></button>
                <span className="w-10 text-center text-sm font-black">{selectedQty}</span>
                <button onClick={() => setSelectedQty(selectedQty + 1)} className="p-1 hover:text-[#d11a2a] transition-colors"><Plus size={14} /></button>
              </div>

              <button 
                onClick={() => addToQuote(product)}
                className={`flex-1 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${
                  isInCart ? "bg-green-600 text-white shadow-md" : "bg-[#d11a2a] text-white hover:bg-black"
                }`}
              >
                {isInCart ? <><Check size={14}/> Added</> : <><Plus size={14}/> Add to Quote</>}
              </button>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS SECTION (Swiper) */}
        {/* ... (Keep your existing Swiper code here) ... */}

      </main>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto px-6 py-8 border-t border-gray-100 mt-12 flex justify-between items-center">
        <span className="text-gray-300 text-[8px] font-black uppercase tracking-widest">© 2026 Disruptive Solutions Inc.</span>
        <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="p-2 bg-gray-50 rounded-full hover:bg-[#d11a2a] hover:text-white transition-all">
          <ChevronUp size={14} />
        </button>
      </footer>
    </div>
  );
}