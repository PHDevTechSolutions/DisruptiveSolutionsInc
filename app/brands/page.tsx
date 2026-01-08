"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase"; // Siguraduhing tama ang path
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { 
  ArrowRight, 
  ChevronUp, 
  Menu, 
  Search,
  LayoutGrid,
  Loader2
} from "lucide-react";

export default function BrandsPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
    const [isNavOpen, setIsNavOpen] = useState(false); // Mobile Nav Toggle
  const LOGO_RED = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-red-scaled.png";
  const LOGO_WHITE = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-white-scaled.png";

      // In-define ang navLinks para gumana ang menu
    const navLinks = [
        { name: "Home", href: "/dashboard" },
        { name: "Products & Solutions", href: "/lighting-products-smart-solutions" },
        { name: "Brands", href: "/trusted-technology-brands" },
        { name: "Contact", href: "/contact-us" },
    ];
  // --- 1. FETCH PRODUCTS FROM FIRESTORE ---
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- 2. FILTER LOGIC ---
  // Tinitignan kung ang napiling Brand ay kasama sa array ng brands ng product
  const filteredProducts = activeFilter === "All" 
    ? products 
    : products.filter(p => p.brands?.includes(activeFilter));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#d11a2a] selection:text-white overflow-x-hidden">
      
     {/* --- 1. NAVIGATION (ALWAYS VISIBLE STYLE) --- */}
                 {/* --- 1. NAVIGATION (FROSTED GLASS / MALIWANAG STYLE) --- */}
      <nav className="fixed top-0 left-0 w-full z-[1000] py-4 transition-all duration-500">
        {/* Background Layer: Dito ang "Maliwanag" effect */}
        <motion.div
          initial={false}
          animate={{
            // Kapag scrolled: maputi na semi-transparent (parang frosted glass)
            // Kapag hindi scrolled: full transparent
            backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.75)" : "rgba(255, 255, 255, 0)",
            backdropFilter: isScrolled ? "blur(16px)" : "blur(0px)",
            boxShadow: isScrolled ? "0 4px 30px rgba(0, 0, 0, 0.05)" : "0 0px 0px rgba(0, 0, 0, 0)",
            borderBottom: isScrolled ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid rgba(255, 255, 255, 0)",
            height: isScrolled ? "70px" : "90px", // Nababawasan ang taas pag nag-scroll
          }}
          className="absolute inset-0 transition-all duration-500"
        />

        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative z-10 h-full">

          {/* LOGO */}
          <div className="relative">
            <Link href="/">
              <motion.img
                animate={{ scale: isScrolled ? 0.85 : 1 }}
                // Dahil maliwanag ang BG, RED logo ang gagamitin natin pag scrolled para kita agad
                src={isScrolled ? LOGO_RED : LOGO_WHITE}
                alt="Logo"
                className="h-12 w-auto object-contain transition-all duration-500"
              />
            </Link>
          </div>

          {/* THE COMPACT "MAGDIDIKIT" MENU (White/Glass Style) */}
          <motion.div
            initial={false}
            animate={{
              gap: isScrolled ? "2px" : "12px",
              // Mas madilim ng konti ang capsule pag malinaw ang main nav bg
              backgroundColor: isScrolled ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.15)",
              paddingLeft: isScrolled ? "6px" : "16px",
              paddingRight: isScrolled ? "6px" : "16px",
              border: isScrolled ? "1px solid rgba(0, 0, 0, 0.05)" : "1px solid rgba(255, 255, 255, 0.2)",
            }}
            className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center py-1.5 rounded-full transition-all duration-500 ease-in-out"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-5 py-2 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-500 rounded-full relative group ${isScrolled ? "text-gray-900" : "text-white"
                  }`}
              >
                {/* Sliding Red Hover Effect */}
                <motion.span
                  className="absolute inset-0 bg-[#d11a2a] rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100"
                />
                <span className="relative z-10 group-hover:text-white transition-colors">
                  {link.name}
                </span>
              </Link>
            ))}
          </motion.div>

          {/* RIGHT SIDE BUTTON */}
          <div className="hidden lg:block">
            <motion.div animate={{ scale: isScrolled ? 0.9 : 1 }}>
              <Link
                href="/quote"
                className={`px-7 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-500 shadow-xl ${isScrolled
                  ? "bg-[#d11a2a] text-white shadow-red-500/20"
                  : "bg-white text-gray-900"
                  }`}
              >
                Free Quote
              </Link>
            </motion.div>
          </div>

          {/* MOBILE TOGGLE ICON */}
          <button className="lg:hidden p-2" onClick={() => setIsNavOpen(true)}>
            <Menu className={isScrolled ? "text-gray-900" : "text-white"} size={28} />
          </button>
        </div>
      </nav>
      {/* --- HERO --- */}
      <section className="relative h-[60vh] w-full flex overflow-hidden bg-black">
        <div className="flex w-full h-full">
            <motion.div initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 2 }} className="w-full h-full relative">
                <img src="https://images.unsplash.com/photo-1558403194-611308249627?auto=format&fit=crop&q=80" className="w-full h-full object-cover brightness-[0.3]" />
            </motion.div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/40 pointer-events-none" />
        <div className="absolute bottom-12 left-12 z-10">
            <h1 className="text-white text-7xl md:text-9xl font-black uppercase tracking-tighter leading-none opacity-20">DISRUPTIVE <br/> PRODUCTS</h1>
        </div>
      </section>

      {/* --- FILTER SECTION --- */}
      <section className="py-12 px-6 bg-white sticky top-[70px] z-[50] border-b border-gray-100 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
                <LayoutGrid size={18} className="text-[#d11a2a]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900">Filter by brand</span>
            </div>
            
            <div className="flex flex-wrap justify-center p-1.5 bg-gray-100 rounded-2xl border border-gray-200">
                {["All", "LIT", "ZUMTOBEL"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveFilter(tab)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                            activeFilter === tab 
                            ? "bg-white text-[#d11a2a] shadow-sm" 
                            : "text-gray-400 hover:text-gray-900"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
      </section>

    {/* --- PRODUCT GRID --- */}
<section className="py-24 px-6 bg-white min-h-[400px]">
  <div className="max-w-7xl mx-auto">
    {loading ? (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-[#d11a2a]" />
        <p className="mt-4 text-xs font-black uppercase tracking-widest text-gray-400">Loading Masterpieces...</p>
      </div>
    ) : (
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode='popLayout'>
          {filteredProducts.map((product) => (
            <motion.div 
              key={product.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative h-[500px] rounded-[40px] overflow-hidden bg-gray-900"
            >
              {/* Background Image (Main Image from Cloudinary) */}
              <div className="absolute inset-0">
                <img 
                    src={product.mainImage || "https://via.placeholder.com/800"} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-[0.7] group-hover:brightness-[0.4]" 
                    alt={product.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-10 flex flex-col justify-end z-10 transition-transform duration-500 group-hover:translate-y-[-10px]">
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.brands?.map((brand: string) => (
                    <span key={brand} className="px-3 py-1 rounded-lg bg-[#d11a2a] text-white text-[8px] font-black uppercase tracking-widest">
                      {brand}
                    </span>
                  ))}
                </div>
                
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 leading-tight">
                  {product.name}
                </h3>
                
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                  SKU: {product.sku || "N/A"}
                </p>

                <div className="flex items-center gap-4 text-white opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="h-[2px] w-0 bg-[#d11a2a] group-hover:w-12 transition-all duration-700" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Explore Product</span>
                </div>
              </div>

              {/* BINURA NATIN DITO YUNG PRICE TAG OVERLAY */}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    )}

    {!loading && filteredProducts.length === 0 && (
      <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-[40px]">
        <p className="text-gray-400 text-xs font-black uppercase tracking-widest">No products found in this category.</p>
      </div>
    )}
  </div>
</section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#0a0a0a] text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest">© 2026 Disruptive Solutions Inc.</span>
            <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#d11a2a] transition-all group">
              Back to Top <div className="p-3 bg-white/5 rounded-full group-hover:bg-[#d11a2a] transition-all"><ChevronUp size={16} /></div>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}