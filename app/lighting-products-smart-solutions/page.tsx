"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";
import Navbar from "../components/navigation/navbar";
import Footer from "../components/navigation/footer";
import ProductFilter from "../components/ProductFilter"; 
import {
  Loader2,
  X,
  ShoppingBag,
  Plus,
  Trash2,
} from "lucide-react";

// 1. DEFINE FILTER INTERFACE
interface FilterState {
  [key: string]: string; 
  application: string;
  mountingType: string;
  colour: string;
  lightDistribution: string;
  lampType: string;
  lampColour: string;
  power: string;
  connection: string;
  fluxFrom: string;
  fluxTo: string;
}

export default function BrandsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quoteCart, setQuoteCart] = useState<any[]>([]);
  
  const [filters, setFilters] = useState<FilterState>({
    application: "*",
    mountingType: "*",
    colour: "*",
    lightDistribution: "*",
    lampType: "*",
    lampColour: "*",
    power: "*",
    connection: "*",
    fluxFrom: "",
    fluxTo: ""
  });

  // --- SYNC CART ---
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

  // --- FETCH PRODUCTS FROM FIREBASE ---
  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("website", "==", "Disruptive Solutions Inc"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- SMART FILTER LOGIC ---
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const activeEntries = Object.entries(filters).filter(([key, value]) => {
        return value !== "*" && value !== "" && key !== "fluxFrom" && key !== "fluxTo";
      });

      for (const [key, filterValue] of activeEntries) {
        let productValue = product[key];

        if (!productValue && product.technicalSpecs) {
          product.technicalSpecs.forEach((spec: any) => {
            const foundRow = spec.rows?.find((r: any) => 
              r.name.toLowerCase() === key.toLowerCase() || 
              (key === "power" && r.name.toLowerCase() === "wattage") ||
              (key === "lampType" && r.name.toLowerCase() === "lamp type")
            );
            if (foundRow) productValue = foundRow.value;
          });
        }

        if (Array.isArray(productValue)) {
          if (!productValue.includes(filterValue)) return false;
        } else {
          if (productValue !== filterValue) return false;
        }
      }

      if (filters.fluxFrom || filters.fluxTo) {
        let productFlux = 0;
        product.technicalSpecs?.forEach((spec: any) => {
          const row = spec.rows?.find((r: any) => r.name.toLowerCase() === "lumens" || r.name.toLowerCase() === "luminous flux");
          if (row) productFlux = parseInt(row.value.replace(/[^0-9]/g, "")) || 0;
        });
        const from = parseInt(filters.fluxFrom) || 0;
        const to = parseInt(filters.fluxTo) || Infinity;
        if (productFlux < from || productFlux > to) return false;
      }
      return true;
    });
  }, [products, filters]);

  const addToQuote = (product: any) => {
    const currentCart = JSON.parse(localStorage.getItem("disruptive_quote_cart") || "[]");
    if (!currentCart.find((item: any) => item.id === product.id)) {
      const updatedCart = [...currentCart, product];
      localStorage.setItem("disruptive_quote_cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  const removeFromQuote = (id: string) => {
    const currentCart = JSON.parse(localStorage.getItem("disruptive_quote_cart") || "[]");
    const updatedCart = currentCart.filter((item: any) => item.id !== id);
    localStorage.setItem("disruptive_quote_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#d11a2a] selection:text-white overflow-x-hidden">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative h-[30vh] md:h-[40vh] w-full flex overflow-hidden bg-black">
        <img
          src="https://images.unsplash.com/photo-1558403194-611308249627?auto=format&fit=crop&q=80"
          className="w-full h-full object-cover brightness-[0.3]"
          alt="Hero"
        />
        <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 z-10">
          <h1 className="text-white text-3xl md:text-7xl font-black uppercase tracking-tighter opacity-20 italic">
            DISRUPTIVE <br /> PRODUCTS
          </h1>
        </div>
      </section>

      <section className="py-8 md:py-16 px-4 md:px-6 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
          
          {/* PRODUCT LISTING (Left) */}
          <div className="lg:col-span-9 order-2 lg:order-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#d11a2a]" />
              </div>
            ) : (
              <>
                {filteredProducts.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[20px] md:rounded-[40px]">
                    <h3 className="text-xs md:text-xl font-black uppercase italic text-gray-300">No matches found</h3>
                  </div>
                ) : (
                  /* RESPONSIVE GRID: 3 COLS FOR MOBILE, 2 FOR TABLET, 3 FOR DESKTOP */
                  <motion.div layout className="grid grid-cols-3 sm:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-8">
                    <AnimatePresence mode='popLayout'>
                      {filteredProducts.map((product) => (
                        <motion.div 
                          key={product.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="group flex flex-col bg-white rounded-xl md:rounded-[32px] overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500"
                        >
                          <Link href={`/lighting-products-smart-solutions/${product.id}`}>
                            <div className="relative h-24 md:h-[300px] w-full bg-[#f8fafc] p-2 md:p-12 overflow-hidden flex items-center justify-center">
                              <img 
                                src={product.mainImage || "https://via.placeholder.com/400"} 
                                className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110" 
                                alt={product.name}
                              />
                            </div>
                          </Link>

                          <div className="p-2 md:p-8 flex flex-col flex-1 bg-white">
                            <Link href={`/lighting-products-smart-solutions/${product.id}`}>
                              <h3 className="text-[8px] md:text-[14px] font-black text-gray-900 uppercase tracking-tighter md:tracking-tight leading-tight md:leading-snug line-clamp-2 min-h-[20px] md:min-h-[40px] hover:text-[#d11a2a] transition-colors italic">
                                {product.name}
                              </h3>
                            </Link>
                            <p className="text-[7px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 md:mt-2 mb-2 md:mb-8 truncate">
                              {product.sku || "N/A"}
                            </p>
                            
                            <button 
                              onClick={() => addToQuote(product)}
                              className={`mt-auto w-full py-1.5 md:py-4 text-[7px] md:text-[10px] font-black uppercase tracking-tight md:tracking-widest rounded-md md:rounded-2xl flex items-center justify-center gap-1 transition-all ${
                                quoteCart.find(item => item.id === product.id)
                                ? "bg-green-50 text-green-600 cursor-default"
                                : "bg-gray-900 text-white hover:bg-[#d11a2a]"
                              }`}
                            >
                              {quoteCart.find(item => item.id === product.id) 
                                ? "In List" 
                                : <><Plus size={8} className="md:w-3 md:h-3" /> Add</>}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* SIDEBAR FILTER (Right) */}
          <aside className="lg:col-span-3 order-1 lg:order-2">
            <ProductFilter 
              products={products} 
              productCount={filteredProducts.length} 
              filters={filters}
              setFilters={setFilters}
            />
          </aside>
        </div>
      </section>

      <Footer />

      {/* FLOATING CART BUTTON */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[1001] bg-[#d11a2a] text-white p-4 md:p-6 rounded-full shadow-2xl"
      >
        <ShoppingBag size={20} className="md:w-6 md:h-6" />
        {quoteCart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-[#d11a2a] text-[8px] md:text-[10px] w-5 h-5 md:w-7 md:h-7 flex items-center justify-center rounded-full font-black border-2 border-[#d11a2a]">
            {quoteCart.length}
          </span>
        )}
      </motion.button>

      {/* CART PANEL */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed top-0 right-0 h-full w-full max-w-xs md:max-w-sm bg-white z-[2001] shadow-2xl flex flex-col">
              <div className="p-6 md:p-8 border-b flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">Quote List</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
                {quoteCart.map((item) => (
                  <div key={item.id} className="flex gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-[24px] items-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-lg p-2 flex items-center justify-center shadow-sm">
                      <img src={item.mainImage} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[9px] md:text-[11px] font-black uppercase truncate italic">{item.name}</h4>
                      <p className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase truncate">SKU: {item.sku}</p>
                    </div>
                    <button onClick={() => removeFromQuote(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
              <div className="p-6 md:p-8 border-t bg-white">
                <Link href="/quote-request-form" className={`block w-full py-4 md:py-5 text-center rounded-xl md:rounded-[20px] font-black uppercase tracking-widest text-[10px] md:text-[11px] transition-all ${quoteCart.length > 0 ? "bg-[#d11a2a] text-white" : "bg-gray-100 text-gray-400 pointer-events-none"}`}>Proceed to Inquiry</Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}