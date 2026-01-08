"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuoteCartPanel() {
  const [quoteCart, setQuoteCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Function para basahin ang localStorage
  const refreshCart = () => {
    const cart = JSON.parse(localStorage.getItem("disruptive_quote_cart") || "[]");
    setQuoteCart(cart);
  };

  useEffect(() => {
    refreshCart();

    // Makinig sa custom events at storage changes
    window.addEventListener("cartUpdated", refreshCart);
    window.addEventListener("storage", refreshCart);

    return () => {
      window.removeEventListener("cartUpdated", refreshCart);
      window.removeEventListener("storage", refreshCart);
    };
  }, []);

  const removeFromQuote = (productId: string) => {
    const cart = JSON.parse(localStorage.getItem("disruptive_quote_cart") || "[]");
    const updated = cart.filter((item: any) => item.id !== productId);
    localStorage.setItem("disruptive_quote_cart", JSON.stringify(updated));
    refreshCart();
    // I-notify ang product details page na nagbago ang cart
    window.dispatchEvent(new Event("cartUpdated"));
  };

  if (quoteCart.length === 0) return null;

  return (
    <>
      {/* --- FLOATING BUTTON --- */}
      {!isCartOpen && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          className="fixed bottom-10 right-10 z-[100]"
        >
          <button 
            onClick={() => setIsCartOpen(true)} 
            className="group relative flex items-center gap-4 bg-black text-white pl-6 pr-2 py-2 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all border border-white/10"
          >
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">Your Quote</span>
              <span className="text-[8px] font-bold text-gray-500 uppercase mt-1">{quoteCart.length} Items</span>
            </div>
            <div className="w-12 h-12 bg-[#d11a2a] rounded-full flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
              <ShoppingBag size={20} className="text-white" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-white text-[#d11a2a] text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
                {quoteCart.length}
              </div>
            </div>
          </button>
        </motion.div>
      )}

      {/* --- SIDE PANEL --- */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsCartOpen(false)} 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]" 
            />
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }} 
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[2001] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter italic">Quote List</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{quoteCart.length} items</p>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20}/>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {quoteCart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-[20px] relative group hover:bg-white border border-transparent hover:border-gray-100 transition-all">
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2 shadow-sm">
                      <img src={item.mainImage} className="w-full h-full object-contain" alt={item.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[10px] font-black uppercase leading-tight truncate">{item.name}</h4>
                      <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">SKU: {item.sku}</p>
                    </div>
                    <button onClick={() => removeFromQuote(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="p-6 border-t bg-white">
                <Link 
                  href="/quote-request-form" 
                  className="block w-full py-5 bg-[#d11a2a] text-white text-center rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-all"
                >
                  Proceed to Inquiry
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}