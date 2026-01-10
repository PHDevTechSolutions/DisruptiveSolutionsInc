"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";
import {
  Menu,
  Search,
  Loader2,
  X,
  ShoppingBag,
  Plus,
  Trash2,
  ChevronUp,
  Linkedin,
  Instagram,
  Facebook,
} from "lucide-react";

export default function BrandsPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quoteCart, setQuoteCart] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<"All" | "LIT" | "ZUMTOBEL">("All");


  const LOGO_RED =
    "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-red-scaled.png";
  const LOGO_WHITE =
    "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-white-scaled.png";
  const socials = [
    { icon: Facebook, href: "#", color: "hover:bg-[#1877F2]" },
    { icon: Instagram, href: "#", color: "hover:bg-[#E4405F]" },
    { icon: Linkedin, href: "#", color: "hover:bg-[#0A66C2]" },
  ];

  const footerLinks = [
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact Us", href: "/contact-us" },
  ];
  const navLinks = [
    { name: "Home", href: "/dashboard" },
    {
      name: "Products & Solutions",
      href: "/lighting-products-smart-solutions",
    },
    { name: "Brands", href: "/trusted-technology-brands" },
    { name: "Contact", href: "/contact-us" },
  ];

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

  // --- FETCH PRODUCTS ---
useEffect(() => {
  const q = query(
    collection(db, "products"),
    where("website", "==", "Disruptive"),
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


  // --- FILTER PRODUCTS: ONLY WEBSITES = "Disruptive" ---
  const filteredProducts = products.filter((p) => {
  const matchesSearch = p.name
    ?.toLowerCase()
    .includes(searchQuery.toLowerCase());

  const matchesBrand =
    activeFilter === "All"
      ? true
      : p.brands?.includes(activeFilter);

  return matchesSearch && matchesBrand;
});



  // --- CART ACTIONS ---
  const addToQuote = (product: any) => {
    const currentCart = JSON.parse(
      localStorage.getItem("disruptive_quote_cart") || "[]"
    );
    if (!currentCart.find((item: any) => item.id === product.id)) {
      const updatedCart = [...currentCart, product];
      localStorage.setItem(
        "disruptive_quote_cart",
        JSON.stringify(updatedCart)
      );
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  const removeFromQuote = (id: string) => {
    const currentCart = JSON.parse(
      localStorage.getItem("disruptive_quote_cart") || "[]"
    );
    const updatedCart = currentCart.filter((item: any) => item.id !== id);
    localStorage.setItem("disruptive_quote_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // --- SCROLL EFFECT ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#d11a2a] selection:text-white overflow-x-hidden">
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 left-0 w-full z-[1000] py-4 transition-all duration-500">
        <motion.div
          initial={false}
          animate={{
            backgroundColor: isScrolled
              ? "rgba(255, 255, 255, 0.75)"
              : "rgba(255, 255, 255, 0)",
            backdropFilter: isScrolled ? "blur(16px)" : "blur(0px)",
            boxShadow: isScrolled
              ? "0 4px 30px rgba(0, 0, 0, 0.05)"
              : "0 0px 0px rgba(0, 0, 0, 0)",
            borderBottom: isScrolled
              ? "1px solid rgba(255, 255, 255, 0.3)"
              : "1px solid rgba(255, 255, 255, 0)",
            height: isScrolled ? "70px" : "90px",
          }}
          className="absolute inset-0 transition-all duration-500"
        />
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative z-10 h-full">
          <div className="relative">
            <Link href="/">
              <motion.img
                animate={{ scale: isScrolled ? 0.85 : 1 }}
                src={isScrolled ? LOGO_RED : LOGO_WHITE}
                alt="Logo"
                className="h-12 w-auto object-contain transition-all duration-500"
              />
            </Link>
          </div>

          <motion.div
            initial={false}
            animate={{
              gap: isScrolled ? "2px" : "12px",
              backgroundColor: isScrolled
                ? "rgba(0, 0, 0, 0.03)"
                : "rgba(255, 255, 255, 0.15)",
              paddingLeft: isScrolled ? "6px" : "16px",
              paddingRight: isScrolled ? "6px" : "16px",
              border: isScrolled
                ? "1px solid rgba(0, 0, 0, 0.05)"
                : "1px solid rgba(255, 255, 255, 0.2)",
            }}
            className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center py-1.5 rounded-full transition-all duration-500 ease-in-out"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-5 py-2 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-500 rounded-full relative group ${
                  isScrolled ? "text-gray-900" : "text-white"
                }`}
              >
                <motion.span className="absolute inset-0 bg-[#d11a2a] rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100" />
                <span className="relative z-10 group-hover:text-white transition-colors">
                  {link.name}
                </span>
              </Link>
            ))}
          </motion.div>

          <div className="hidden lg:block">
            <motion.div animate={{ scale: isScrolled ? 0.9 : 1 }}>
              <Link
                href="/quote"
                className={`px-7 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all shadow-xl ${
                  isScrolled
                    ? "bg-[#d11a2a] text-white shadow-red-500/20"
                    : "bg-white text-gray-900"
                }`}
              >
                Free Quote
              </Link>
            </motion.div>
          </div>

          <button className="lg:hidden p-2" onClick={() => setIsNavOpen(true)}>
            <Menu
              className={isScrolled ? "text-gray-900" : "text-white"}
              size={28}
            />
          </button>
        </div>
      </nav>

      {/* --- FLOATING CART BUTTON --- */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-8 right-8 z-[1001] bg-[#d11a2a] text-white p-5 rounded-full shadow-2xl shadow-red-500/40 flex items-center justify-center"
      >
        <ShoppingBag size={24} />
        {quoteCart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-[#d11a2a] text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-black border-2 border-[#d11a2a]">
            {quoteCart.length}
          </span>
        )}
      </motion.button>

      {/* --- HERO --- */}
      <section className="relative h-[50vh] w-full flex overflow-hidden bg-black">
        <img
          src="https://images.unsplash.com/photo-1558403194-611308249627?auto=format&fit=crop&q=80"
          className="w-full h-full object-cover brightness-[0.3]"
        />
        <div className="absolute bottom-12 left-12 z-10">
          <h1 className="text-white text-5xl md:text-7xl font-black uppercase tracking-tighter opacity-20">
            DISRUPTIVE <br /> PRODUCTS
          </h1>
        </div>
      </section>

      {/* --- SEARCH --- */}
     <section className="py-10 px-6 bg-white border-b border-gray-100">
  <div className="max-w-5xl mx-auto space-y-8">
    <div className="relative max-w-xl mx-auto">
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        size={18}
      />
      <input
        type="text"
        placeholder="Search a product..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 focus:outline-none transition-all text-sm"
      />
    </div>

    <div className="flex flex-wrap justify-center gap-3">
      {["All", "LIT", "ZUMTOBEL"].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveFilter(tab as any)}
          className={`px-8 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
            activeFilter === tab
              ? "bg-[#d11a2a] text-white shadow-lg"
              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  </div>
</section>


      {/* --- PRODUCT GRID --- */}
       <section className="py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto"> 
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#d11a2a]" /></div>
          ) : (
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              <AnimatePresence mode='popLayout'>
                {filteredProducts.map((product) => (
                  <motion.div 
                    key={product.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-500"
                  >
                    <Link href={`/lighting-products-smart-solutions/${product.id}`}>
                      <div className="relative h-[250px] w-full bg-[#f8fafc] p-8 overflow-hidden cursor-pointer">
                        <img 
                          src={product.mainImage || "https://via.placeholder.com/400"} 
                          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" 
                          alt={product.name}
                        />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest text-gray-900 shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform">
                            View Specifications
                          </span>
                        </div>
                        <div className="absolute top-4 left-4 flex flex-wrap gap-1">
                          {product.brands?.map((brand: string) => (
                            <span key={brand} className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm border border-gray-100 text-[7px] font-black uppercase tracking-widest text-gray-900">
                              {brand}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>

                    <div className="p-5 flex flex-col flex-1 bg-white">
                      <div className="mb-4">
                        <Link href={`/lighting-products-smart-solutions/${product.id}`}>
                          <h3 className="text-[12px] font-black text-gray-900 uppercase tracking-tight leading-snug line-clamp-2 min-h-[35px] hover:text-[#d11a2a] transition-colors cursor-pointer">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          SKU: {product.sku || "N/A"}
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => addToQuote(product)}
                        className={`mt-auto w-full py-3 text-[8px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all ${
                          quoteCart.find(item => item.id === product.id)
                          ? "bg-green-50 text-green-600 cursor-default"
                          : "bg-gray-900 text-white hover:bg-[#d11a2a]"
                        }`}
                      >
                        {quoteCart.find(item => item.id === product.id) ? "In Your Quote" : <><Plus size={12} /> Add to Quote</>}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>
      <footer className="bg-[#0a0a0a] text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* TOP GRID */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20 items-start">
            {/* BRAND COLUMN */}
            <div className="space-y-8">
              <img src={LOGO_WHITE} alt="Logo" className="h-12" />

              <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                The leading edge of lighting technology. Disrupting the standard
                to build a brighter, smarter world.
              </p>

              <div className="flex gap-4">
                {socials.map((soc, i) => (
                  <div
                    key={i}
                    className={`
                h-10 w-10 rounded-full
                bg-white/5 border border-white/10
                flex items-center justify-center
                cursor-pointer
                transition-all duration-300
                hover:bg-white/10 hover:-translate-y-1
                ${soc.color}
              `}
                  >
                    <soc.icon size={18} />
                  </div>
                ))}
              </div>
            </div>

            {/* QUICK LINKS */}
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-[#d11a2a]">
                Quick Links
              </h4>

              <ul className="space-y-4">
                {footerLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="
                  text-gray-400 text-sm
                  flex items-center gap-2
                  hover:text-white
                  transition-colors
                  group
                "
                    >
                      <span className="h-[2px] w-0 bg-[#d11a2a] group-hover:w-3 transition-all" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* NEWSLETTER / INSIGHTS */}
            <div className="md:col-span-2 bg-white/5 backdrop-blur-xl rounded-[32px] p-10 border border-white/10 shadow-xl flex flex-col justify-between">
              <div>
                <h4 className="text-xl font-black uppercase tracking-tight mb-3">
                  Industry Insights
                </h4>

                <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
                  Receive curated updates on smart lighting innovations,
                  engineering breakthroughs, and industry best practices —
                  delivered straight to your inbox.
                </p>

                <div className="flex items-center gap-2 bg-black/40 p-2 rounded-2xl border border-white/10">
                  <input
                    type="email"
                    placeholder="Enter your business email"
                    className="
                bg-transparent flex-1 px-4 py-2
                text-sm text-white
                placeholder:text-gray-500
                outline-none
              "
                  />

                  <button
                    className="
                group flex items-center gap-2
                bg-[#d11a2a] px-4 py-3 rounded-xl
                hover:bg-[#b11422]
                transition-all duration-300
                shadow-lg
              "
                  >
                    <span className="hidden md:block text-[10px] font-black uppercase tracking-widest">
                      Subscribe
                    </span>
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-gray-500 mt-4">
                We respect your privacy. No spam, unsubscribe anytime.
              </p>
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-gray-500 tracking-[0.25em] uppercase">
            <p>© 2026 Disruptive Solutions Inc.</p>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="
          flex items-center gap-2
          hover:text-[#d11a2a]
          transition-all
        "
            >
              Top <ChevronUp size={16} />
            </button>
          </div>
        </div>
      </footer>

      {/* --- QUOTE CART PANEL --- */}
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
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[2001] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter italic">
                    Quote List
                  </h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {quoteCart.length} items
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {quoteCart.length === 0 ? (
                  <p className="text-center text-gray-400 text-[10px] font-bold uppercase py-10">
                    Cart is empty
                  </p>
                ) : (
                  quoteCart.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-3 bg-gray-50 rounded-2xl relative group hover:bg-white border border-transparent hover:border-gray-100 transition-all"
                    >
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2">
                        <img
                          src={item.mainImage}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[10px] font-black uppercase leading-tight truncate">
                          {item.name}
                        </h4>
                        <p className="text-[9px] text-gray-400 uppercase mt-1">
                          SKU: {item.sku}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromQuote(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="p-6 border-t bg-white">
                <Link
                  href="/quote-request-form"
                  className={`block w-full py-5 text-center rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all ${
                    quoteCart.length > 0
                      ? "bg-[#d11a2a] text-white shadow-lg shadow-red-500/20"
                      : "bg-gray-100 text-gray-400 pointer-events-none"
                  }`}
                >
                  Proceed to Inquiry
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
