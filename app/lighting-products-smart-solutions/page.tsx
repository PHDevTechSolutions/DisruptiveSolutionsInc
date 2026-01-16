"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";
import Navbar from "../components/navigation/navbar";
import Footer from "../components/navigation/footer";
import Application from "../components/application";
import ProductFilter from "../components/ProductFilter"; 
import {
  Loader2,
  X,
  ShoppingBag,
  Plus,
  Trash2,
  Check,
  Minus,
  ChevronRight
} from "lucide-react";

// --- INTERFACES ---
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
  const [dbCategories, setDbCategories] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quoteCart, setQuoteCart] = useState<any[]>([]);
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState("CATEGORIES"); 
  
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

  // --- 1. FETCH CATEGORIES ---
  useEffect(() => {
    const q = query(
      collection(db, "categoriesmaintenance"),
      where("isActive", "==", true), 
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDbCategories(cats);
    });

    return () => unsubscribe();
  }, []);

  // --- 2. FETCH PRODUCTS ---
  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("website", "==", "Disruptive Solutions Inc"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- SYNC CART ---
  const syncCart = useCallback(() => {
    const savedCart = localStorage.getItem("disruptive_quote_cart");
    if (savedCart) {
      try { setQuoteCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    } else { setQuoteCart([]); }
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

  // --- FILTER LOGIC ---
  const filteredProducts = useMemo(() => {
    const activeCategoryNames = dbCategories.map((cat: any) => cat.title?.trim().toUpperCase());

    return products.filter((product) => {
      const hasActiveCategory = product.dynamicSpecs?.some((spec: any) => 
        activeCategoryNames.includes(spec.value?.trim().toUpperCase())
      );

      if (!hasActiveCategory) return false;

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
              (key === "lampType" && r.name.toLowerCase() === "lamp type") ||
              (key === "mountingType" && r.name.toLowerCase() === "mounting type")
            );
            if (foundRow) productValue = foundRow.value;
          });
        }
        if (!productValue) return false;
        if (Array.isArray(productValue)) {
          if (!productValue.some(val => val.toLowerCase().includes(filterValue.toLowerCase()))) return false;
        } else {
          if (!productValue.toString().toLowerCase().includes(filterValue.toLowerCase())) return false;
        }
      }

      if (filters.fluxFrom || filters.fluxTo) {
        let productFlux = 0;
        product.technicalSpecs?.forEach((spec: any) => {
          const row = spec.rows?.find((r: any) => r.name.toLowerCase().includes("lumen") || r.name.toLowerCase().includes("flux"));
          if (row) productFlux = parseInt(row.value.replace(/[^0-9]/g, "")) || 0;
        });
        const from = parseInt(filters.fluxFrom) || 0;
        const to = parseInt(filters.fluxTo) || Infinity;
        if (productFlux < from || productFlux > to) return false;
      }
      return true;
    });
  }, [products, filters, dbCategories]);

  const addToQuote = (product: any) => {
    const currentCart = JSON.parse(localStorage.getItem("disruptive_quote_cart") || "[]");
    if (!currentCart.find((item: any) => item.id === product.id)) {
      const updatedCart = [...currentCart, { ...product, quantity: 1 }];
      localStorage.setItem("disruptive_quote_cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cartUpdated"));
      setIsCartOpen(true);
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

      <section className="relative h-[25vh] md:h-[40vh] w-full flex overflow-hidden bg-black">
        <img src="https://images.unsplash.com/photo-1558403194-611308249627?auto=format&fit=crop&q=80" className="w-full h-full object-cover brightness-[0.3]" alt="Hero" />
        <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 z-10">
          <h1 className="text-white text-3xl md:text-7xl font-black uppercase tracking-tighter opacity-20 italic leading-none">
            DISRUPTIVE <br /> SOLUTIONS
          </h1>
        </div>
      </section>

      <section className="py-6 md:py-12 px-4 md:px-6 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
          
          <div className="lg:col-span-9 order-2 lg:order-1">
            
            {/* TAB SYSTEM */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4 border-b border-gray-200">
              <span className="text-[11px] font-bold uppercase tracking-tight text-gray-900 pb-4 md:pb-0">Sort view according to:</span>
              <div className="flex">
                {["CATEGORIES", "APPLICATIONS", "HIGHLIGHTS"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveView(tab)}
                    className={`px-6 py-3 text-[11px] font-black tracking-widest transition-all border-t border-x border-transparent ${
                      activeView === tab 
                        ? "bg-white border-gray-200 text-gray-900 -mb-[1px]" 
                        : "bg-gray-100 text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#d11a2a]" /></div>
            ) : (
              <>
                {/* 1. CATEGORIES VIEW */}
                {activeView === "CATEGORIES" && (
                  <div className="divide-y divide-gray-100">
                    {dbCategories.map((category, index) => {
                      const categoryProducts = filteredProducts.filter((p) => 
                        p.dynamicSpecs?.some((spec: any) => 
                          spec.value?.trim().toUpperCase() === category.title?.trim().toUpperCase()
                        )
                      );

                      const isOpen = openCategoryId === category.id;
                      if (Object.values(filters).some(v => v !== "*" && v !== "") && categoryProducts.length === 0) return null;

                      return (
                        <div key={category.id} className="overflow-hidden border-b border-gray-50">
                          <button 
                            onClick={() => setOpenCategoryId(isOpen ? null : category.id)}
                            className={`w-full flex items-start justify-between p-4 md:p-8 transition-all hover:bg-gray-50 ${isOpen ? 'bg-gray-50' : ''}`}
                          >
                            <div className="flex gap-4 md:gap-8 text-left">
                              <div className="w-10 h-10 md:w-14 md:h-14 bg-white border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden rounded-lg shadow-sm">
                                {category.imageUrl ? (
                                  <img src={category.imageUrl} className="w-full h-full object-cover" alt={category.title} />
                                ) : (
                                  <span className="text-[10px] font-bold text-gray-300">0{index + 1}</span>
                                )}
                              </div>
                              <h3 className={`text-sm md:text-xl font-black tracking-tighter uppercase ${isOpen ? 'text-[#d11a2a]' : 'text-gray-900'}`}>{category.title}</h3>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="hidden md:block text-[9px] font-black bg-white border px-3 py-1 rounded-full uppercase italic">{categoryProducts.length} Items</span>
                              {isOpen ? <Minus size={16} className="text-[#d11a2a]" /> : <Plus size={16} className="text-gray-300" />}
                            </div>
                          </button>

                          <AnimatePresence>
                            {isOpen && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-[#fcfcfc]">
                                <div className="p-4 md:p-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                  {categoryProducts.map((product) => {
                                    const isInCart = quoteCart.some(item => item.id === product.id);
                                    const firstGroup = product.technicalSpecs?.[0];

                                    return (
                                      <div key={product.id} className="bg-white rounded-xl md:rounded-[24px] overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 flex flex-col group/card relative">
                                        <Link href={`/lighting-products-smart-solutions/${product.id}`}>
                                          <div className="relative h-40 sm:h-48 md:h-56 w-full bg-[#fcfcfc] p-4 flex items-center justify-center overflow-hidden">
                                            <img src={product.mainImage} className="max-w-[85%] max-h-[85%] object-contain group-hover/card:scale-110 group-hover/card:blur-[4px] transition-all duration-700" alt={product.name} />
                                            
                                            {/* HOVER SPECS TABLE */}
                                            <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-[3px] flex flex-col justify-center items-center p-4 opacity-0 group-hover/card:opacity-100 transition-all duration-300 z-30">
                                              <p className="text-[8px] font-black text-[#d11a2a] uppercase tracking-widest mb-3 italic border-b border-[#d11a2a]/40 pb-1 w-full text-center">Technical Specs</p>
                                              <table className="w-full border-collapse">
                                                <tbody className="divide-y divide-white/10">
                                                  {firstGroup?.rows?.slice(0, 5).map((row: any, i: number) => (
                                                    <tr key={i}>
                                                      <td className="py-1.5 text-[7px] md:text-[8px] font-bold text-gray-400 uppercase italic">{row.name}</td>
                                                      <td className="py-1.5 text-[8px] md:text-[9px] font-black text-white uppercase text-right">{row.value || "—"}</td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                              <div className="mt-4 flex items-center gap-1 text-white text-[7px] font-black uppercase bg-[#d11a2a] px-3 py-1.5 rounded-full">Full Details <ChevronRight size={10} /></div>
                                            </motion.div>

                                            <div className="absolute top-2 left-2 bg-white/95 px-2 py-1 rounded-lg text-[7px] md:text-[8px] font-black uppercase border border-gray-100 z-10">{product.sku}</div>
                                          </div>
                                        </Link>
                                        <div className="p-4 md:p-5 flex flex-col flex-1 border-t border-gray-50 bg-white z-20">
                                          <h4 className="text-[10px] md:text-[11px] font-black uppercase italic leading-tight line-clamp-2 min-h-[32px]">{product.name}</h4>
                                          <button onClick={() => addToQuote(product)} className={`mt-4 w-full py-2.5 md:py-3 text-[8px] md:text-[9px] font-black uppercase rounded-xl flex items-center justify-center gap-2 transition-all ${isInCart ? "bg-green-600 text-white" : "bg-gray-900 text-white hover:bg-[#d11a2a]"}`}>
                                            {isInCart ? <><Check size={12} strokeWidth={3} /> Added</> : <><Plus size={12} strokeWidth={3} /> Add to Quote</>}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. APPLICATIONS VIEW */}
                {activeView === "APPLICATIONS" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    
                  </div>
                )}

                {/* 3. HIGHLIGHTS VIEW */}
                {activeView === "HIGHLIGHTS" && (
                  <div className="py-20 text-center text-[10px] font-black uppercase italic tracking-widest text-gray-300">Highlights Section Coming Soon</div>
                )}
              </>
            )}
          </div>

          <aside className="lg:col-span-3 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
               <ProductFilter products={products} productCount={filteredProducts.length} filters={filters} setFilters={setFilters} />
            </div>
          </aside>
        </div>
      </section>

      <Footer />

      {/* FLOATING CART */}
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsCartOpen(true)} className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[1001] bg-[#d11a2a] text-white p-4 md:p-6 rounded-full shadow-2xl border-4 border-white">
        <ShoppingBag size={22} />
        {quoteCart.length > 0 && <span className="absolute -top-2 -right-2 bg-black text-white text-[11px] w-8 h-8 flex items-center justify-center rounded-full font-black border-2 border-white">{quoteCart.length}</span>}
      </motion.button>

      {/* CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-md z-[2000]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[2001] shadow-2xl flex flex-col" >
              <div className="p-8 border-b flex items-center justify-between">
                <h2 className="text-2xl font-black uppercase italic">My Quote List</h2>
                <button onClick={() => setIsCartOpen(false)}><X size={20}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {quoteCart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-[28px] items-center">
                    <div className="w-16 h-16 bg-white p-2 rounded-xl flex items-center justify-center"><img src={item.mainImage} className="max-h-full object-contain" alt={item.name} /></div>
                    <div className="flex-1"><h4 className="text-[12px] font-black uppercase truncate">{item.name}</h4></div>
                    <button onClick={() => removeFromQuote(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
              <div className="p-8 border-t">
                <Link href="/quote-request-form" className="block w-full py-6 text-center rounded-[24px] font-black uppercase bg-[#d11a2a] text-white shadow-xl hover:bg-black transition-all">Confirm & Request Quote</Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}