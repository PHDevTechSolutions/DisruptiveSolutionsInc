"use client";

import React, { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import SignUpNewsletter from "../components/SignUpNewsletter" 

import { 
  Menu,
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Facebook, 
  Instagram, 
  Linkedin, 
  ChevronUp,
  LogOut,
  User,
  X,
  FileSignature,
  ShieldCheck, 
  Zap,
} from "lucide-react";
import Link from "next/link";

// Swiper Styles
import "swiper/css";
import "swiper/css/navigation";

const BRANDS_CONFIG = [
  {
    id: "zumtobel",
    name: "ZUMTOBEL",
    logo: "https://disruptivesolutionsinc.com/wp-content/uploads/2025/11/ZUMTOBELs.png",
    description: "Global leader in holistic lighting solutions for professional applications.",
    bgColor: "bg-[#f9f9f9]",
    accentColor: "text-[#d11a2a]",
  },
  {
    id: "lit",
    name: "LIT",
    logo: "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/Lit-Rectangle-black-scaled-e1754460691526.png",
    description: "Architectural lighting for modern, energy-efficient environments.",
    bgColor: "bg-[#ffffff]",
    accentColor: "text-blue-600",
  }
];

export default function BrandsShowcase() {
  const [brandProducts, setBrandProducts] = useState<any>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);
  const LOGO_RED = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-red-scaled.png";
  const LOGO_WHITE = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-white-scaled.png";

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products & Solutions", href: "/lighting-products-smart-solutions" },
    { name: "Brands", href: "/trusted-technology-brands" },
    { name: "Contact Us", href: "/contact-us" },
  ];

  const socials = [
    { icon: Facebook, color: "hover:text-blue-500", href: "#" },
    { icon: Instagram, color: "hover:text-pink-500", href: "#" },
    { icon: Linkedin, color: "hover:text-blue-700", href: "#" },
  ];

  const footerLinks = [
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact Us", href: "/contact-us" },
  ];

  const BRANDS_CONFIG = [
  {
    id: "zumtobel",
    name: "ZUMTOBEL",
    slug: "/zumtobel-lighting-solutions", // Papunta sa ZumtobelHybridPage
    logo: "https://disruptivesolutionsinc.com/wp-content/uploads/2025/11/ZUMTOBELs.png",
    description: "Global leader in holistic lighting solutions for professional applications.",
    bgColor: "bg-[#f9f9f9]",
    accentColor: "text-[#d11a2a]",
  },
  {
    id: "lit",
    name: "LIT",
    slug: "/lit-lighting-solutions", // Papunta sa LitRedBlackPage
    logo: "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/Lit-Rectangle-black-scaled-e1754460691526.png",
    description: "Architectural lighting for modern, energy-efficient environments.",
    bgColor: "bg-[#ffffff]",
    accentColor: "text-black",
  }
];
     // Logout function
  const handleLogout = () => {
    localStorage.removeItem("disruptive_user_session");
    setUserSession(null);
    window.location.reload(); // Refresh para bumalik sa default nav
  };
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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    
    const fetchBrandProducts = async () => {
      const results: any = {};
      for (const brand of BRANDS_CONFIG) {
        try {
          const q = query(
            collection(db, "products"),
            where("brands", "array-contains", brand.name),
            limit(10)
          );
          const querySnapshot = await getDocs(q);
          results[brand.id] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
          console.error(`Error fetching ${brand.name}:`, error);
        }
      }
      setBrandProducts(results);
    };

    fetchBrandProducts();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans antialiased text-slate-900 overflow-x-hidden">
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

      {/* --- 2. NEW DISRUPTIVE HERO SECTION --- */}
      <section className="relative h-[70vh] w-full flex items-center justify-center overflow-hidden bg-[#050505]">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" 
            className="w-full h-full object-cover opacity-40 brightness-50" 
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-white" />
          <motion.div 
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-[#d11a2a]/20 blur-[120px] rounded-full"
          />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <span className="bg-[#d11a2a] text-white text-[9px] font-black uppercase tracking-[0.5em] px-5 py-2 rounded-sm mb-6 inline-block">
              Premium Partnerships
            </span>
            <h1 className="text-white text-6xl md:text-[8rem] font-black uppercase tracking-tighter leading-[0.85] italic mb-6">
              THE BRANDS<br/>
              <span className="text-transparent stroke-white" style={{ WebkitTextStroke: "1px white" }}>WE TRUST</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-xl font-bold uppercase tracking-[0.2em] leading-relaxed mx-auto md:mx-0">
              Curating the world's most <span className="text-white">advanced lighting technologies</span> for high-stakes environments.
            </p>
          </motion.div>
        </div>

        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <div className="w-[1px] h-16 bg-gradient-to-b from-[#d11a2a] to-transparent" />
        </motion.div>
      </section>
{/* --- MAIN CONTENT (BRAND SHOWCASE) --- */}
<main className="flex-grow w-full relative z-20">
  {BRANDS_CONFIG.map((brand) => (
    <section key={brand.id} className={`w-full py-24 border-b border-gray-50 ${brand.bgColor} flex items-center justify-center`}>
      <div className="max-w-[1400px] w-full px-8 md:px-12">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          
          {/* --- LEFT SIDE: Brand Identity --- */}
          <div className="w-full lg:w-[350px] shrink-0 flex flex-col items-center lg:items-start text-center lg:text-left space-y-10">
            <div className="h-16 md:h-20">
              <img src={brand.logo} alt={brand.name} className="h-full w-auto object-contain" />
            </div>
            
            <div className="space-y-4">
              <h2 className={`text-3xl font-black italic tracking-tighter uppercase leading-tight ${brand.accentColor}`}>
                {brand.name} <span className="text-black">COLLECTION</span>
              </h2>
              <p className="text-[13px] text-gray-500 font-bold uppercase tracking-wide leading-relaxed">
                {brand.description}
              </p>
            </div>

            {/* HIWALAY NA BUTTON PARA SA CATALOGUE */}
            <div className="w-full pt-4">
              <Link 
                href={brand.slug} 
                className="group relative inline-flex items-center justify-between w-full md:w-auto md:min-w-[240px] px-8 py-5 bg-black text-white overflow-hidden transition-all hover:bg-[#d11a2a]"
              >
                <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.4em]">
                  Enter {brand.name}
                </span>
                <ArrowRight size={18} className="relative z-10 group-hover:translate-x-3 transition-transform duration-500" />
                
                {/* Background Animation Effect */}
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </Link>
              
              <p className="mt-4 text-[9px] font-black text-gray-300 uppercase tracking-widest italic">
                Explore dedicated technical solutions →
              </p>
            </div>
          </div>

          {/* --- RIGHT SIDE: Swiper remains the same but with improved card links --- */}
                {/* --- RIGHT SIDE: Swiper --- */}
                <div className="flex-1 w-full relative min-w-0">
<Swiper
  modules={[Navigation, Autoplay]}
  spaceBetween={16} // Mas maliit na gap sa mobile
  slidesPerView={1.2} // Pakitang-tao yung susunod na card
  breakpoints={{
    640: { slidesPerView: 2, spaceBetween: 24 },
    1024: { slidesPerView: 3, spaceBetween: 30 }
  }}
  autoplay={{ delay: 5000 }}
  navigation={{
    prevEl: `.prev-${brand.id}`,
    nextEl: `.next-${brand.id}`,
  }}
  className="w-full rounded-2xl"
>
                    {brandProducts[brand.id]?.map((product: any) => (
                      <SwiperSlide key={product.id} className="pb-10">
                        <Link href={`/lighting-products-smart-solutions/${product.id}`}>
                          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-700 h-full flex flex-col group/card border-b-4 hover:border-b-[#d11a2a]">
                            <div className="aspect-[4/5] bg-gray-50/50 p-8 flex items-center justify-center relative overflow-hidden">
                              <img src={product.mainImage} alt={product.name} className="w-full h-full object-contain group-hover/card:scale-110 transition-transform duration-1000" />
                              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                              <div className="absolute bottom-4 right-4 translate-y-10 group-hover/card:translate-y-0 opacity-0 group-hover/card:opacity-100 transition-all duration-500">
                                <div className="bg-white p-3 rounded-full shadow-xl text-[#d11a2a]">
                                  <Plus size={18} />
                                </div>
                              </div>
                            </div>
                            <div className="p-8 space-y-2 flex-grow">
                              <h4 className="text-[11px] font-black uppercase tracking-tight text-gray-900 line-clamp-2 leading-snug">
                                {product.name}
                              </h4>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                SKU: {product.sku || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Custom Navigation */}
                  <div className="flex gap-4 mt-4 justify-center lg:justify-start">
                    <button className={`prev-${brand.id} w-12 h-12 flex items-center justify-center border border-gray-200 rounded-full text-gray-400 hover:bg-black hover:text-white transition-all active:scale-90 shadow-sm`}>
                      <ChevronLeft size={20} />
                    </button>
                    <button className={`next-${brand.id} w-12 h-12 flex items-center justify-center border border-gray-200 rounded-full text-gray-400 hover:bg-black hover:text-white transition-all active:scale-90 shadow-sm`}>
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
        </div>
      </div>
    </section>
  ))}
</main>

      {/* --- 4. FOOTER --- */}
      <footer className="bg-[#0a0a0a] text-white pt-32 pb-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-24">
            
            <div className="md:col-span-1 space-y-10">
              <img src={LOGO_WHITE} alt="Logo" className="h-12" />
              <p className="text-gray-500 text-sm leading-relaxed italic">
                The convergence of light and intelligent engineering. Disrupting the standard since 2026.
              </p>
              <div className="flex gap-4">
                {socials.map((soc, i) => (
                  <Link key={i} href={soc.href} className={`h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 hover:bg-[#d11a2a] group`}>
                    <soc.icon size={18} className={`transition-colors group-hover:text-white text-gray-400`} />
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#d11a2a]">Navigation</h4>
              <ul className="space-y-4">
                {footerLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:text-white transition-all group">
                      <span className="h-[1px] w-0 bg-[#d11a2a] group-hover:w-4 transition-all" />
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

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">© 2026 Disruptive Solutions Inc.</p>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#d11a2a] transition-all group">
              Scroll to Top <div className="p-3 bg-white/5 rounded-full group-hover:bg-[#d11a2a] group-hover:text-white transition-all"><ChevronUp size={16} /></div>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}