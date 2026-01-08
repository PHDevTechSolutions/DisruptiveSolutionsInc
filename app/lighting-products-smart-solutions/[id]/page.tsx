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
  FileText, 
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
  
  // States
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quoteCart, setQuoteCart] = useState<any[]>([]);
  const [selectedQty, setSelectedQty] = useState(1);
  // --- 1. SYNC LOGIC ---
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

  // --- 2. FETCH DATA ---
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

  // --- 3. CART ACTIONS (With Quantity Logic) ---
const addToQuote = (prod: any) => {
  const currentCart = JSON.parse(localStorage.getItem("disruptive_quote_cart") || "[]");
  const existingItemIndex = currentCart.findIndex((item: any) => item.id === prod.id);

  let updatedCart;
  if (existingItemIndex > -1) {
    // Idagdag ang napiling quantity sa kasalukuyang nasa cart
    updatedCart = [...currentCart];
    updatedCart[existingItemIndex].quantity = (updatedCart[existingItemIndex].quantity || 1) + selectedQty;
  } else {
    // Add new entry gamit ang napiling quantity
    updatedCart = [...currentCart, { ...prod, quantity: selectedQty }];
  }

  localStorage.setItem("disruptive_quote_cart", JSON.stringify(updatedCart));
  window.dispatchEvent(new Event("cartUpdated"));
  setIsCartOpen(true);
  setSelectedQty(1); // Reset back to 1 pagkatapos mag-add
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
  if (!product) return <div className="h-screen flex items-center justify-center text-xs font-black uppercase">Product Not Found</div>;

  const isInCart = quoteCart.some(item => item.id === product.id);
  const totalItemsCount = quoteCart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-white pb-20 relative overflow-x-hidden selection:bg-[#d11a2a] selection:text-white font-sans">
      
      {/* --- FLOATING CART BUTTON --- */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-8 right-8 z-[1001] bg-[#d11a2a] text-white p-5 rounded-full shadow-2xl shadow-red-500/40 flex items-center justify-center"
      >
        <ShoppingBag size={24} />
        {totalItemsCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-[#d11a2a] text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-black border-2 border-[#d11a2a]">
            {totalItemsCount}
          </span>
        )}
      </motion.button>

      {/* --- QUOTE CART PANEL --- */}
      <AnimatePresence>
  {isCartOpen && (
    <>
      {/* Overlay / Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={() => setIsCartOpen(false)} 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]" 
      />

      {/* Side Panel Content */}
      <motion.div 
        initial={{ x: "100%" }} 
        animate={{ x: 0 }} 
        exit={{ x: "100%" }} 
        transition={{ type: "spring", damping: 25, stiffness: 200 }} 
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[2001] shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter italic text-gray-900">Quote List</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} total
            </p>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black"
          >
            <X size={20}/>
          </button>
        </div>
        
        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {quoteCart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={40} className="text-gray-200 mb-4" />
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                Your selection is empty.
              </p>
            </div>
          ) : (
            quoteCart.map((item) => (
              <div 
                key={item.id} 
                className="flex gap-4 p-4 bg-gray-50 rounded-[24px] relative group hover:bg-white border border-transparent hover:border-gray-100 transition-all duration-300"
              >
                {/* Item Image */}
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2 shadow-sm flex-shrink-0">
                  <img src={item.mainImage} className="w-full h-full object-contain" alt={item.name} />
                </div>

                {/* Item Info & Quantity */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-[10px] font-black uppercase leading-tight truncate text-gray-800">
                    {item.name}
                  </h4>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-tighter">
                    SKU: {item.sku}
                  </p>
                  
                  {/* QUANTITY CONTROLS */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-gray-200 rounded-full bg-white p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)} 
                        className="p-1 text-gray-400 hover:text-[#d11a2a] transition-colors"
                      >
                        <Minus size={12} strokeWidth={3} />
                      </button>
                      <span className="text-[11px] font-black w-7 text-center text-gray-900">
                        {item.quantity || 1}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)} 
                        className="p-1 text-gray-400 hover:text-[#d11a2a] transition-colors"
                      >
                        <Plus size={12} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <button 
                  onClick={() => removeFromQuote(item.id)} 
                  className="text-gray-300 hover:text-red-500 transition-colors p-1 self-start"
                >
                  <Trash2 size={16}/>
                </button>
              </div>
            ))
          )}
        </div>
        
        {/* Sticky Bottom Button */}
        <div className="p-6 border-t bg-white">
          <Link 
            href="/checkout" 
            className={`block w-full py-5 text-center rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all duration-300 ${
              quoteCart.length > 0 
                ? "bg-[#d11a2a] text-white shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-95" 
                : "bg-gray-100 text-gray-400 pointer-events-none"
            }`}
          >
            Proceed to Checkout
          </Link>
          <p className="text-[8px] text-gray-400 text-center mt-4 font-bold uppercase tracking-widest">
            Free Technical Consultation Included
          </p>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>

      {/* --- NAVIGATION --- */}
      <nav className="p-6 border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-[#d11a2a] transition-colors">
            <ArrowLeft size={16}/> Back to Gallery
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-24">
          {/* IMAGE SECTION */}
          <div className="bg-white rounded-[40px] p-12 border border-gray-100 shadow-sm flex items-center justify-center sticky top-28">
            <img src={product.mainImage} className="max-h-[500px] w-full object-contain" alt={product.name} />
          </div>

          {/* INFO SECTION */}
          <div className="space-y-10">
            <div>
              <div className="flex gap-2 mb-4">
                {product.brands?.map((brand: string) => (
                  <span key={brand} className="px-3 py-1 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-md">{brand}</span>
                ))}
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-4 text-gray-900 italic">{product.name}</h1>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">SKU: {product.sku || "N/A"}</p>
            </div>

            {/* SPECS TABLE */}
            <div className="space-y-10">
              {product.descriptionBlocks?.map((block: any) => (
                <div key={block.id} className="space-y-4">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 border-b pb-2 italic">{block.label}</h3>
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white text-left">
                    <table className="w-full border-collapse">
                      <tbody>
                        {block.value.split('\n').filter((l:any)=>l.trim() !== "").map((line: string, idx: number) => {
                          const [label, ...val] = line.split(':');
                          return (
                            <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                              <td className="w-1/3 p-4 bg-gray-50/30 text-[10px] font-bold text-gray-500 uppercase border-r border-gray-100 italic">{label.trim()}</td>
                              <td className="p-4 text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">{val.join(':').trim() || "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

{/* ACTION BUTTONS WITH QUANTITY SELECTOR */}
<div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
  
  {/* Quantity Selector on Main Page */}
  <div className="flex items-center border-2 border-gray-100 rounded-2xl px-4 bg-gray-50/50">
    <button 
      onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
      className="p-2 hover:text-[#d11a2a] transition-colors"
    >
      <Minus size={16} strokeWidth={3} />
    </button>
    <span className="text-sm font-black w-10 text-center">{selectedQty}</span>
    <button 
      onClick={() => setSelectedQty(selectedQty + 1)}
      className="p-2 hover:text-[#d11a2a] transition-colors"
    >
      <Plus size={16} strokeWidth={3} />
    </button>
  </div>

  <button 
    onClick={() => addToQuote(product)} 
    className={`flex-1 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
      isInCart ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "bg-[#d11a2a] text-white shadow-xl shadow-red-500/20 hover:scale-[1.02]"
    }`}
  >
    {isInCart ? (
      <><Check size={18}/> Add More to Quote</> 
    ) : (
      <><Plus size={18}/> Add to Quote</>
    )}
  </button>
</div>
          </div>
        </div>

        {/* RELATED PRODUCTS SWIPER */}
        <div className="space-y-8 pt-12 border-t border-gray-100">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">Discover More</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Recommended Solutions</p>
            </div>
            <div className="flex gap-2">
                <button className="swiper-prev p-3 bg-white border border-gray-200 rounded-full hover:bg-black hover:text-white transition-all"><ChevronLeft size={18}/></button>
                <button className="swiper-next p-3 bg-white border border-gray-200 rounded-full hover:bg-black hover:text-white transition-all"><ChevronRight size={18}/></button>
            </div>
          </div>

          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            navigation={{ prevEl: '.swiper-prev', nextEl: '.swiper-next' }}
            autoplay={{ delay: 4000 }}
            breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
            className="pb-12"
          >
            {relatedProducts.map((p) => (
              <SwiperSlide key={p.id}>
                <Link href={`/lighting-products-smart-solutions/${p.id}`}>
                  <div className="group bg-white border border-gray-100 rounded-[32px] overflow-hidden hover:shadow-xl transition-all h-full flex flex-col">
                    <div className="aspect-square bg-gray-50 p-8 flex items-center justify-center">
                       <img src={p.mainImage} alt={p.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h4 className="text-[11px] font-black uppercase tracking-tight text-gray-900 line-clamp-2 mb-4 group-hover:text-[#d11a2a] transition-colors">{p.name}</h4>
                      <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                         <span>View Product</span>
                         <Plus size={14} className="text-gray-900 group-hover:text-[#d11a2a]"/>
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
      <footer className="max-w-7xl mx-auto px-6 flex justify-between items-center py-12 border-t border-gray-100 mt-20">
        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">© 2026 Disruptive Solutions Inc.</span>
        <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="p-3 bg-gray-50 rounded-full hover:bg-[#d11a2a] hover:text-white transition-all">
          <ChevronUp size={18} />
        </button>
      </footer>
    </div>
  );
}