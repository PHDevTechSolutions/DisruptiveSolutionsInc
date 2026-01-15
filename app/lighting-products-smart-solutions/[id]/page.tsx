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
  ShoppingBag, 
  X, 
  Trash2,
  ChevronUp,
  Minus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quoteCart, setQuoteCart] = useState<any[]>([]);
  const [selectedQty, setSelectedQty] = useState(1);

  const syncCart = useCallback(() => {
    const savedCart = localStorage.getItem("disruptive_quote_cart");
    if (savedCart) {
      try {
        setQuoteCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error parsing cart", error);
      }
    } else {
      setQuoteCart([]);
    }
  }, []);

  useEffect(() => {
    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("cartUpdated", syncCart);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("cartUpdated", syncCart);
    };
  }, [syncCart]);

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
    window.dispatchEvent(new Event("cartUpdated"));
    setIsCartOpen(true);
    setSelectedQty(1);
  };

  const updateQuantity = (productId: string, delta: number) => {
    const currentCart = JSON.parse(localStorage.getItem("disruptive_quote_cart") || "[]");
    const updatedCart = currentCart.map((item: any) => {
      if (item.id === productId) {
        const newQty = (item.quantity || 1) + delta;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    });
    localStorage.setItem("disruptive_quote_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeFromQuote = (productId: string) => {
    const currentCart = JSON.parse(localStorage.getItem("disruptive_quote_cart") || "[]");
    const updatedCart = currentCart.filter((item: any) => item.id !== productId);
    localStorage.setItem("disruptive_quote_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#d11a2a]" /></div>;
  if (!product) return <div className="h-screen flex items-center justify-center text-xs font-black uppercase tracking-widest">Product Not Found</div>;

  const isInCart = quoteCart.some(item => item.id === product.id);
  const totalItemsCount = quoteCart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-white pb-12 relative font-sans selection:bg-[#d11a2a] selection:text-white overflow-x-hidden">
      
      {/* --- CART PANEL --- */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed top-0 right-0 h-full w-full max-w-[320px] bg-white z-[2001] shadow-2xl flex flex-col">
              <div className="p-5 border-b flex items-center justify-between">
                <h2 className="text-lg font-black uppercase italic tracking-tighter">Quote List</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={18}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {quoteCart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <ShoppingBag size={30} className="mb-4 opacity-20" />
                    <p className="text-[9px] font-bold uppercase tracking-widest">Empty</p>
                  </div>
                ) : (
                  quoteCart.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl relative border border-gray-100">
                      <img src={item.mainImage} className="w-10 h-10 object-contain bg-white rounded-lg p-1" alt={item.name} />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[9px] font-black uppercase truncate italic">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-0.5 border rounded hover:bg-white"><Minus size={8}/></button>
                          <span className="text-[10px] font-bold w-3 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-0.5 border rounded hover:bg-white"><Plus size={8}/></button>
                        </div>
                      </div>
                      <button onClick={() => removeFromQuote(item.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                    </div>
                  ))
                )}
              </div>
              <div className="p-5 border-t">
                <Link href="/quote-request-form" className="block w-full py-3.5 bg-[#d11a2a] text-white text-center rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-black transition-colors">Submit Inquiry</Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- NAVIGATION --- */}
      <nav className="p-4 md:p-5 border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] hover:text-[#d11a2a] transition-colors">
            <ArrowLeft size={14}/> Back
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-6 mt-8 md:mt-12">
        <div className="grid lg:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* LEFT: IMAGE SECTION (Compact on Desktop) */}
          <div className="lg:col-span-5 bg-white rounded-2xl md:rounded-[32px] p-6 md:p-10 border border-gray-100 shadow-sm md:sticky md:top-24 flex items-center justify-center">
            <img src={product.mainImage} className="max-h-[250px] md:max-h-[400px] w-full object-contain" alt={product.name} />
          </div>

          {/* RIGHT: INFO & SPECS SECTION */}
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

            {/* TECHNICAL SPECIFICATIONS (Clean & Compact) */}
            <div className="space-y-6">
              {product.technicalSpecs?.map((specGroup: any) => (
                <div key={specGroup.id} className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#d11a2a]">
                    {specGroup.label}
                  </h3>
                  <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full border-collapse bg-white text-left">
                      <tbody>
                        {specGroup.rows?.map((row: any, idx: number) => (
                          <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                            <td className="w-2/5 p-3 md:p-3.5 bg-gray-50/30 text-[9px] md:text-[10px] font-bold text-gray-400 uppercase border-r border-gray-50 italic">
                              {row.name}
                            </td>
                            <td className="p-3 md:p-3.5 text-[10px] md:text-[12px] font-semibold text-gray-700 uppercase">
                              {row.value || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* ACTION BUTTONS (Compact) */}
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

        {/* RELATED PRODUCTS */}
        <div className="mt-24 pt-10 border-t border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic leading-none">More Solutions</h2>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Recommended</p>
            </div>
            <div className="flex gap-1.5">
              <button className="swiper-prev p-2 bg-white border border-gray-200 rounded-full hover:bg-black hover:text-white transition-all"><ChevronLeft size={14}/></button>
              <button className="swiper-next p-2 bg-white border border-gray-200 rounded-full hover:bg-black hover:text-white transition-all"><ChevronRight size={14}/></button>
            </div>
          </div>

          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={8}
            slidesPerView={3}
            navigation={{ prevEl: '.swiper-prev', nextEl: '.swiper-next' }}
            autoplay={{ delay: 4000 }}
            breakpoints={{ 
              640: { slidesPerView: 3, spaceBetween: 16 }, 
              1024: { slidesPerView: 5, spaceBetween: 20 } 
            }}
            className="pb-8"
          >
            {relatedProducts.map((p) => (
              <SwiperSlide key={p.id}>
                <Link href={`/lighting-products-smart-solutions/${p.id}`}>
                  <div className="group bg-white border border-gray-100 rounded-xl md:rounded-2xl overflow-hidden hover:shadow-lg transition-all h-full flex flex-col">
                    <div className="aspect-square bg-gray-50/50 p-3 md:p-6 flex items-center justify-center">
                       <img src={p.mainImage} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-2 md:p-4 flex flex-col flex-1">
                      <h4 className="text-[7px] md:text-[10px] font-black uppercase line-clamp-2 mb-2 group-hover:text-[#d11a2a] transition-colors italic leading-tight">
                        {p.name}
                      </h4>
                      <div className="mt-auto flex justify-between items-center text-[6px] md:text-[8px] font-bold text-gray-300 uppercase tracking-widest">
                         <span>Details</span>
                         <Plus size={8} />
                      </div>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto px-6 py-8 border-t border-gray-100 mt-12 flex justify-between items-center">
        <span className="text-gray-300 text-[8px] font-black uppercase tracking-widest">© 2026 Disruptive Solutions Inc.</span>
        <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="p-2 bg-gray-50 rounded-full hover:bg-[#d11a2a] hover:text-white transition-all">
          <ChevronUp size={14} />
        </button>
      </footer>

      {/* MOBILE FAB */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 bg-[#d11a2a] text-white p-4 rounded-full shadow-2xl z-[1000] lg:hidden"
      >
        <ShoppingBag size={20} />
        {totalItemsCount > 0 && <span className="absolute -top-1 -right-1 bg-white text-[#d11a2a] text-[9px] w-5 h-5 flex items-center justify-center rounded-full font-black border-2 border-[#d11a2a]">{totalItemsCount}</span>}
      </motion.button>

    </div>
  );
}