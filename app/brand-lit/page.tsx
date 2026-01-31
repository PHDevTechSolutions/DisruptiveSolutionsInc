"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";
import Navbar from "../components/navigation/navbar";
import Footer from "../components/navigation/footer";
import Application from "../components/application";
import ProductFilter from "../components/zumtobelfilter"; 
import Highlights from "../components/Highlights";
import {
  Loader2,
  X,
  ShoppingBag,
  Plus,
  Trash2,
  Check,
  Minus,
  Star
} from "lucide-react";
import FloatingChatWidget  from "../components/chat-widget";

// --- INTERFACES ---
interface FilterState {
  [key: string]: any; 
}

export default function BrandsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quoteCart, setQuoteCart] = useState<any[]>([]);
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState("CATEGORIES"); 
  const [filters, setFilters] = useState<FilterState>({});

  // --- 1. FETCH CATEGORIES ---
  useEffect(() => {
    const q = query(
      collection(db, "categoriesmaintenance"),
      where("isActive", "==", true), 
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDbCategories(cats);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. FETCH PRODUCTS (LIT ONLY) ---
  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("website", "==", "Disruptive Solutions Inc"),
      where("brand", "==", "LIT"), 
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
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
      const hasCategoryMatch = dbCategories.length === 0 || product.dynamicSpecs?.some((spec: any) => 
        activeCategoryNames.includes(spec.value?.trim().toUpperCase())
      );
      if (!hasCategoryMatch) return false;

      const activeEntries = Object.entries(filters).filter(([_, value]) => value !== "*" && value !== "");
      for (const [key, filterValue] of activeEntries) {
        let hasMatch = false;
        const inDynamic = product.dynamicSpecs?.some((spec: any) => 
          spec.title?.toLowerCase() === key.toLowerCase() && 
          spec.value?.toLowerCase() === filterValue.toString().toLowerCase()
        );
        const inTechnical = product.technicalSpecs?.some((group: any) => 
          group.rows?.some((row: any) => 
            row.name?.toLowerCase() === key.toLowerCase() && 
            row.value?.toLowerCase().includes(filterValue.toString().toLowerCase())
          )
        );
        hasMatch = inDynamic || inTechnical;
        if (!hasMatch) return false;
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

  const removeFromQuote = (id: string) => {
    const updatedCart = quoteCart.filter((item: any) => item.id !== id);
    setQuoteCart(updatedCart);
    localStorage.setItem("disruptive_quote_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#d11a2a] selection:text-white overflow-x-hidden">
      <Navbar />
      <FloatingChatWidget/>

      {/* HERO */}
      <section className="relative h-[60vh] w-full flex items-center justify-center bg-black">
        <div className="absolute inset-0 opacity-40">
          <img src="https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/Lit-Rectangle-black-scaled-e1754460691526.png" className="w-full h-full object-cover" alt="LIT" />
        </div>
      </section>

      <section className="py-12 px-4 md:px-6 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-9 order-2 lg:order-1">
            <div className="mb-8 flex items-center gap-4 border-b border-gray-100">
              {["CATEGORIES", "APPLICATIONS", "HIGHLIGHTS"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveView(tab)}
                  className={`px-6 py-4 text-[11px] font-black tracking-widest transition-all ${
                    activeView === tab ? "border-b-2 border-[#d11a2a] text-gray-900" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#d11a2a]" /></div>
            ) : (
              <div className="space-y-4">
                {activeView === "CATEGORIES" && dbCategories.map((category) => {
                  const categoryProducts = filteredProducts.filter((p) =>
                    p.dynamicSpecs?.some((spec: any) => spec.value?.trim().toUpperCase() === category.title?.trim().toUpperCase())
                  );
                  if (categoryProducts.length === 0) return null;
                  return (
                    <div key={category.id} className="border border-gray-100 rounded-[24px] overflow-hidden">
                      <button onClick={() => setOpenCategoryId(openCategoryId === category.id ? null : category.id)} className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-white border rounded-xl overflow-hidden flex items-center justify-center">
                            {category.imageUrl ? <img src={category.imageUrl} className="w-full h-full object-cover" /> : <Star size={20} className="text-gray-200" />}
                          </div>
                          <div className="text-left">
                            <h3 className="font-black uppercase italic text-lg">{category.title}</h3>
                            <p className="text-[10px] font-bold text-gray-400">{categoryProducts.length} PRODUCTS</p>
                          </div>
                        </div>
                        {openCategoryId === category.id ? <Minus size={20} /> : <Plus size={20} />}
                      </button>
                      <AnimatePresence>
                        {openCategoryId === category.id && (
                          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden bg-[#fcfcfc]">
                            <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                              {categoryProducts.map((product) => (
                                <ProductCard key={product.id} product={product} addToQuote={addToQuote} isInCart={quoteCart.some(i => i.id === product.id)} />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
                {activeView === "APPLICATIONS" && <Application filteredProducts={filteredProducts} addToQuote={addToQuote} quoteCart={quoteCart} />}
                {activeView === "HIGHLIGHTS" && <Highlights products={filteredProducts} addToQuote={addToQuote} quoteCart={quoteCart} />}
              </div>
            )}
          </div>

          <aside className="lg:col-span-3 order-1 lg:order-2">
            <ProductFilter products={products} productCount={filteredProducts.length} filters={filters} setFilters={setFilters} activeView={activeView} />
          </aside>
        </div>
      </section>

      <Footer />

      {/* CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[2000]">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="absolute right-0 top-0 h-full w-full max-w-md bg-white p-8">
               <div className="flex justify-between mb-8">
                  <h2 className="text-2xl font-black italic uppercase">Quote List</h2>
                  <X onClick={() => setIsCartOpen(false)} className="cursor-pointer" />
               </div>
               <div className="space-y-4 overflow-y-auto max-h-[60vh]">
                 {quoteCart.map(item => (
                   <div key={item.id} className="flex gap-4 p-4 border rounded-2xl items-center">
                     <img src={item.mainImage} className="w-12 h-12 object-contain" />
                     <div className="flex-1">
                        <p className="text-[10px] font-black uppercase italic">{item.name}</p>
                        <div className="flex items-center gap-4 mt-2">
                           <Minus size={12} className="cursor-pointer" onClick={() => updateQuantity(item.id, -1)} />
                           <span className="text-xs font-bold">{item.quantity}</span>
                           <Plus size={12} className="cursor-pointer" onClick={() => updateQuantity(item.id, 1)} />
                        </div>
                     </div>
                     <Trash2 size={16} className="text-gray-300 cursor-pointer" onClick={() => removeFromQuote(item.id)} />
                   </div>
                 ))}
               </div>
               <Link href="/checkout" className="block w-full py-4 bg-[#d11a2a] text-white text-center rounded-xl font-black uppercase text-[10px] mt-8">Confirm Quote</Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- UPDATED PRODUCT CARD WITH HOVER SPECS ---
function ProductCard({ product, addToQuote, isInCart }: any) {
  const firstSpecGroup = product.technicalSpecs?.[0];

  return (
    <div className="bg-white rounded-[28px] border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 group/card flex flex-col relative">
      <Link href={`brand-lit/${product.slug}`}>
        <div className="h-64 md:h-72 bg-[#fcfcfc] p-6 flex items-center justify-center relative overflow-hidden">
          {/* Main Image */}
          <img 
            src={product.mainImage} 
            className="max-h-full object-contain group-hover/card:scale-110 group-hover/card:blur-[2px] transition-all duration-700" 
          />
          
          {/* Technical Specs Overlay */}
          <motion.div 
            initial={{ opacity: 0 }} 
            whileHover={{ opacity: 1 }} 
            className="absolute inset-0 bg-black/85 backdrop-blur-[2px] flex flex-col justify-center items-center p-6 opacity-0 transition-all duration-300 z-30"
          >
            <p className="text-[10px] font-black text-[#d11a2a] uppercase tracking-widest mb-4 italic border-b border-[#d11a2a]/40 pb-1 w-full text-center">Technical Data</p>
            <table className="w-full border-collapse">
              <tbody className="divide-y divide-white/10">
                {firstSpecGroup?.rows?.slice(0, 5).map((row: any, i: number) => (
                  <tr key={i}>
                    <td className="py-2 text-[8px] font-bold text-gray-400 uppercase italic">{row.name}</td>
                    <td className="py-2 text-[9px] font-black text-white uppercase text-right">{row.value || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-[7px] text-white/40 font-bold uppercase tracking-tighter">Click for more details</p>
          </motion.div>

          {/* SKU TAG */}
          <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-lg text-[8px] font-black uppercase border z-10">{product.sku}</div>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1 bg-white">
        <h4 className="text-[11px] font-black uppercase italic line-clamp-2 min-h-[32px] text-gray-900 group-hover/card:text-[#d11a2a] transition-colors">
            {product.name}
        </h4>
        <button 
          onClick={() => addToQuote(product)}
          className={`w-full mt-5 py-3.5 text-[9px] font-black uppercase rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
            isInCart ? "bg-green-600 text-white" : "bg-black text-white hover:bg-[#d11a2a]"
          }`}
        >
          {isInCart ? <><Check size={14} /> Added</> : <><Plus size={14} /> Add to Quote</>}
        </button>
      </div>
    </div>
  );
}