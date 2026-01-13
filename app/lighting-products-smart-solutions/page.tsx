"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import SignUpNewsletter from "../components/SignUpNewsletter"    
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
  ArrowRight,
  ShieldCheck,
  FileSignature,
  Zap,
  User,
  LogOut,
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
  const [userSession, setUserSession] = useState<any>(null);

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
 
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setUserSession(user); // Dito natin ise-set yung userSession
    } else {
      setUserSession(null);
    }
  });
  return () => unsubscribe();
}, [])
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

    // Logout function
  const handleLogout = () => {
    localStorage.removeItem("disruptive_user_session");
    setUserSession(null);
    window.location.reload(); // Refresh para bumalik sa default nav
  };

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
      {/* --- NEW INDUSTRIAL MOBILE NAV (LEFT SIDE) --- */}
     
           <AnimatePresence>
             {isNavOpen && (
               <>
                 {/* Backdrop */}
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   onClick={() => setIsNavOpen(false)}
                   className="fixed inset-0 bg-black/40 backdrop-blur-md z-[2000] lg:hidden"
                 />
     
                 {/* Sidebar - Left Side */}
                 <motion.div
                   initial={{ x: "-100%" }}
                   animate={{ x: 0 }}
                   exit={{ x: "-100%" }}
                   transition={{ type: "tween", duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                   className="fixed top-0 left-0 h-full w-[80%] bg-[#0a0a0a] z-[2001] lg:hidden flex flex-col shadow-2xl"
                 >
                   {/* --- SIDEBAR HEADER (Pinalaking Logo) --- */}
                   <div className="p-8 flex items-center justify-between border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
                     <motion.img
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       src={LOGO_WHITE}
                       alt="Logo"
                       // Mula h-5, ginawa nating h-11 para solid ang projection sa mobile
                       className="h-11 w-auto object-contain brightness-110"
                     />
     
                     <button
                       onClick={() => setIsNavOpen(false)}
                       className="w-10 h-10 flex items-center justify-center border border-white/10 rounded-full text-white/40 hover:text-white hover:bg-[#d11a2a] hover:border-[#d11a2a] transition-all duration-300"
                     >
                       <X size={20} />
                     </button>
                   </div>
     
                   {/* Horizontal List Navigation */}
                   <div className="flex-grow py-4 px-2">
                     {navLinks.map((link, idx) => (
                       <Link
                         key={link.name}
                         href={link.href}
                         onClick={() => setIsNavOpen(false)}
                         className="group flex items-center justify-between px-6 py-5 border-b border-white/5 relative overflow-hidden transition-all"
                       >
                         <div className="flex items-center gap-4 relative z-10">
                           <span className="text-[10px] font-mono text-[#d11a2a] opacity-50 group-hover:opacity-100">0{idx + 1}</span>
                           <span className="text-xs font-black uppercase tracking-[0.2em] text-white group-hover:translate-x-2 transition-transform duration-300">
                             {link.name}
                           </span>
                         </div>
                         <ArrowRight size={14} className="text-white/20 group-hover:text-[#d11a2a] group-hover:translate-x-1 transition-all" />
     
                         {/* Hover Background Accent */}
                         <div className="absolute inset-0 bg-gradient-to-r from-[#d11a2a]/10 to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                       </Link>
                     ))}
     
                     {/* Partner Links (Slim Version) */}
                     {userSession && (
                       <div className="mt-8 px-6 space-y-4">
                         <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">Internal Systems</p>
                         <div className="grid gap-2">
                           <Link href="/catalog" onClick={() => setIsNavOpen(false)} className="flex items-center gap-3 text-[10px] font-bold text-white/70 uppercase tracking-widest hover:text-[#d11a2a] transition-colors">
                             <FileSignature size={14} /> Catalog
                           </Link>
                           <Link href="/portal" onClick={() => setIsNavOpen(false)} className="flex items-center gap-3 text-[10px] font-bold text-white/70 uppercase tracking-widest hover:text-[#d11a2a] transition-colors">
                             <ShieldCheck size={14} /> Client Portal
                           </Link>
                         </div>
                       </div>
                     )}
                   </div>
     
                   {/* Bottom Contact/Action */}
                   <div className="p-6 border-t border-white/5 bg-white/[0.02]">
                     <Link
                       href="/quote"
                       onClick={() => setIsNavOpen(false)}
                       className="flex items-center justify-between group"
                     >
                       <span className="text-[11px] font-black uppercase tracking-widest text-white">Start a Project</span>
                       <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#d11a2a] group-hover:border-[#d11a2a] transition-all">
                         <Zap size={14} className="text-white fill-white" />
                       </div>
                     </Link>
     
                     <div className="mt-8 flex justify-between items-center opacity-30">
                       <span className="text-[8px] font-bold text-white uppercase tracking-widest italic flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> System Active
                       </span>
                       <span className="text-[8px] font-bold text-white uppercase tracking-widest">v2.0.26</span>
                     </div>
                   </div>
                 </motion.div>
               </>
             )}
           </AnimatePresence>
           {/* --- 1. NAVIGATION (FROSTED GLASS / MALIWANAG STYLE) --- */}
           <nav className="fixed top-0 left-0 w-full z-[1000] py-4 transition-all duration-500">
             {/* Background Layer */}
             <motion.div
               initial={false}
               animate={{
                 backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.75)" : "rgba(255, 255, 255, 0)",
                 backdropFilter: isScrolled ? "blur(16px)" : "blur(0px)",
                 boxShadow: isScrolled ? "0 4px 30px rgba(0, 0, 0, 0.05)" : "0 0px 0px rgba(0, 0, 0, 0)",
                 height: isScrolled ? "70px" : "90px",
               }}
               className="absolute inset-0 transition-all duration-500"
             />
     
             <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative z-10 h-full">
     
               {/* LOGO */}
               <div className="relative shrink-0">
                 <Link href="/">
                   <motion.img
                     animate={{ scale: isScrolled ? 0.85 : 1 }}
                     src={isScrolled ? LOGO_RED : LOGO_WHITE}
                     alt="Logo"
                     className="h-10 md:h-12 w-auto object-contain transition-all duration-500"
                   />
                 </Link>
               </div>
     
               {/* THE COMPACT "MAGDIDIKIT" MENU (Desktop) */}
               <motion.div
                 initial={false}
                 animate={{
                   gap: isScrolled ? "2px" : "12px",
                   backgroundColor: isScrolled ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.15)",
                 }}
                 className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center py-1.5 rounded-full transition-all duration-500 ease-in-out border border-white/10"
               >
                 {navLinks.map((link) => (
                   <Link
                     key={link.name}
                     href={link.href}
                     className={`px-5 py-2 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-500 rounded-full relative group ${isScrolled ? "text-gray-900" : "text-white"
                       }`}
                   >
                     <motion.span className="absolute inset-0 bg-[#d11a2a] rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100" />
                     <span className="relative z-10 group-hover:text-white transition-colors">
                       {link.name}
                     </span>
                   </Link>
                 ))}
               </motion.div>
     
               {/* RIGHT SIDE ACTIONS (Quote + Private Actions) */}
               <div className="hidden lg:flex items-center gap-4">
     
                 {/* --- PRIVATE SECTION (Lilitaw lang kapag may disruptive_user_session) --- */}
                 {userSession && (
                   <div className="flex items-center gap-4 pl-4 border-l border-white/10">
     
                     {/* 2. CATALOG BUTTON (Private) */}
                     <motion.div
                       initial={{ opacity: 0, x: 10 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ duration: 0.5 }}
                     >
                       <Link
                         href="/catalog"
                         className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 border-2 flex items-center gap-2 ${isScrolled
                             ? "border-gray-200 text-gray-900 hover:bg-gray-100"
                             : "border-white/20 text-white hover:bg-white/10"
                           }`}
                       >
                         <FileSignature size={14} className="text-[#d11a2a]" />
                         Catalog
                       </Link>
                     </motion.div>
     
                     {/* 3. PROFILE ICON (Private) */}
                     <div className="relative group">
                       <div className="flex items-center cursor-pointer py-2">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isScrolled ? "border-[#d11a2a] bg-red-50" : "border-white/30 bg-white/10"
                           }`}>
                           <User size={18} className={isScrolled ? "text-[#d11a2a]" : "text-white"} />
                         </div>
     
                         {/* HOVER DROPDOWN CARD */}
                         <div className="absolute top-full right-0 mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[1001]">
                           <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden text-left">
                             <div className="p-5 bg-gray-50 border-b border-gray-100">
                               <p className="text-[9px] font-black text-[#d11a2a] uppercase tracking-widest mb-1 italic">Active Partner</p>
                               <h4 className="text-sm font-black text-gray-900 uppercase truncate">
                                 {userSession.displayName || "Disruptive User"}
                               </h4>
                               <p className="text-[10px] font-medium text-gray-400 truncate lowercase">
                                 {userSession.email}
                               </p>
                             </div>
     
                             <div className="p-2">
                               <Link href="/portal" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-50 text-gray-600 hover:text-[#d11a2a] transition-colors">
                                 <ShieldCheck size={16} />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Client Portal</span>
                               </Link>
                               <button
                                 onClick={handleLogout}
                                 className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-900 hover:text-white text-gray-400 transition-all"
                               >
                                 <LogOut size={16} />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                               </button>
                             </div>
     
                             <div className="px-5 py-3 bg-gray-900 flex justify-between items-center">
                               <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Source</span>
                               <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">{userSession.website}</span>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
     
                 )}
                 {/* 1. FREE QUOTE BUTTON (Laging Visible - Public) */}
                 <motion.div animate={{ scale: isScrolled ? 0.9 : 1 }}>
                   <Link
                     href="/quote"
                     className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 shadow-xl ${isScrolled
                         ? "bg-[#d11a2a] text-white shadow-red-500/20"
                         : "bg-white text-gray-900"
                       }`}
                   >
                     Free Quote
                   </Link>
                 </motion.div>
               </div>
     
               {/* MOBILE TOGGLE ICON */}
               <button
                 className="lg:hidden p-2 relative z-[1001]"
                 onClick={() => setIsNavOpen(true)}
               >
                 {/* Modern hamburger: thin lines */}
                 <div className="space-y-1.5">
                   <div className={`w-6 h-0.5 transition-all ${isScrolled ? "bg-black" : "bg-white"}`}></div>
                   <div className={`w-4 h-0.5 transition-all ${isScrolled ? "bg-[#d11a2a]" : "bg-white/60"}`}></div>
                 </div>
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

            <div className="md:col-span-2 bg-white/5 backdrop-blur-xl rounded-[32px] p-10 border border-white/10 shadow-xl flex flex-col justify-between">
                <SignUpNewsletter></SignUpNewsletter>
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
