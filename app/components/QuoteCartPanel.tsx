"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, X, Trash2, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function QuoteCartPanel({ 
  embedded = false,
  onClose 
}: { 
  embedded?: boolean;
  onClose?: () => void;
}) {
  const [quoteCart, setQuoteCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const refreshCart = () => {
    const cart = JSON.parse(localStorage.getItem("disruptive_quote_cart") || "[]");
    setQuoteCart(cart);
  };

  useEffect(() => {
    refreshCart();
    const handleUpdate = () => {
      refreshCart();
      if (!embedded) setIsCartOpen(true);
    };

    window.addEventListener("cartUpdated", handleUpdate);
    window.addEventListener("storage", refreshCart);

    return () => {
      window.removeEventListener("cartUpdated", handleUpdate);
      window.removeEventListener("storage", refreshCart);
    };
  }, [embedded]);

  const updateQuantity = (productId: string, delta: number) => {
    const updatedCart = quoteCart.map((item) => {
      if (item.id === productId) {
        const newQty = (item.quantity || 1) + delta;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    });
    setQuoteCart(updatedCart);
    localStorage.setItem("disruptive_quote_cart", JSON.stringify(updatedCart));
  };

  const removeFromQuote = (productId: string) => {
    const updated = quoteCart.filter((item: any) => item.id !== productId);
    localStorage.setItem("disruptive_quote_cart", JSON.stringify(updated));
    refreshCart();
  };

  const totalItems = quoteCart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <>
      {/* FLOATING BUTTON - Hide kung embedded */}
      {!embedded && (
        <AnimatePresence>
          {quoteCart.length > 0 && !isCartOpen && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0, opacity: 0 }}
              className="fixed bottom-10 right-10 z-[1000]"
            >
              <button 
                onClick={() => setIsCartOpen(true)} 
                className="group relative flex items-center gap-4 bg-black text-white pl-6 pr-2 py-2 rounded-full shadow-2xl hover:scale-105 transition-all border border-white/10"
              >
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">Your Quote</span>
                  <span className="text-[8px] font-bold text-gray-500 uppercase">{totalItems} Total Qty</span>
                </div>
                <div className="w-12 h-12 bg-[#d11a2a] rounded-full flex items-center justify-center shadow-lg">
                  <ShoppingBag size={20} className="text-white" />
                  <span className="absolute -top-1 -right-1 bg-white text-[#d11a2a] text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black border-2 border-[#d11a2a]">
                    {quoteCart.length}
                  </span>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* SIDE PANEL - Always show kung embedded */}
      <AnimatePresence>
        {(embedded || isCartOpen) && (
          <>
            {!embedded && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setIsCartOpen(false)} 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]" 
              />
            )}
            <motion.div 
              initial={embedded ? {} : { x: "100%" }}
              animate={embedded ? {} : { x: 0 }}
              exit={embedded ? {} : { x: "100%" }}
              transition={embedded ? {} : { type: "spring", damping: 25 }}
              className={cn(
                "bg-white shadow-2xl flex flex-col",
                embedded 
                  ? "w-full rounded-2xl max-h-[500px]" 
                  : "fixed top-0 right-0 h-full w-full max-w-sm z-[2001]"
              )}
            >
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase italic leading-none">Quote List</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">{totalItems} total pieces</p>
                </div>
                
                {/* Close Button - works for both embedded and standalone */}
                <button 
                  onClick={() => {
                    if (embedded && onClose) {
                      onClose();
                    } else {
                      setIsCartOpen(false);
                    }
                  }} 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20}/>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {quoteCart.length === 0 ? (
                  <div className="text-center py-10 opacity-20">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs text-gray-400">Your quote cart is empty</p>
                  </div>
                ) : (
                  quoteCart.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-[20px] relative border border-transparent hover:border-gray-100 transition-all">
                      <img src={item.mainImage} className="w-16 h-16 object-contain bg-white rounded-xl p-2" alt={item.name} />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[10px] font-black uppercase truncate">{item.name}</h4>
                        <p className="text-[9px] text-gray-400 font-bold uppercase mb-2">SKU: {item.sku}</p>
                        
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-black w-4 text-center">{item.quantity || 1}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <button onClick={() => removeFromQuote(item.id)} className="text-gray-300 hover:text-red-500 transition-colors self-start">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {quoteCart.length > 0 && (
                <div className="p-6 border-t">
                  <Link 
                    href="/checkout" 
                    onClick={() => !embedded && setIsCartOpen(false)} 
                    className="block w-full py-5 bg-[#d11a2a] text-white text-center rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg hover:bg-black transition-all active:scale-95"
                  >
                    Proceed to Inquiry
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}