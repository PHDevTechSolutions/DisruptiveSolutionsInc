"use client";

import React, { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import SignUpNewsletter from "../components/SignUpNewsletter";
import Link from "next/link";

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

// Swiper Styles
import "swiper/css";
import "swiper/css/navigation";

// 1. CONFIGURATION: Dito natin ididikta kung anong brand ang hahanapin sa DB
const BRANDS_CONFIG = [
  {
    id: "zumtobel",
    name: "Zumtobel", // Exact match sa "brand" field sa Firestore mo
    slug: "/zumtobel-lighting-solutions",
    logo: "https://disruptivesolutionsinc.com/wp-content/uploads/2025/11/ZUMTOBELs.png",
    description: "Global leader in holistic lighting solutions for professional applications.",
    bgColor: "bg-[#f9f9f9]",
    accentColor: "text-[#d11a2a]",
  },
  {
    id: "lit",
    name: "LIT", // Case sensitive match para sa brand na "LIT"
    slug: "/lit-lighting-solutions",
    logo: "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/Lit-Rectangle-black-scaled-e1754460691526.png",
    description: "Architectural lighting for modern, energy-efficient environments.",
    bgColor: "bg-[#ffffff]",
    accentColor: "text-black",
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

  // 2. FETCH LOGIC: Dito natin ina-apply yung where("brand", "==", brand.name)
  const fetchBrandProducts = async () => {
    const results: any = {};
    
    await Promise.all(BRANDS_CONFIG.map(async (brand) => {
      try {
        const q = query(
          collection(db, "products"),
          where("website", "==", "Disruptive Solutions Inc"),
          where("brand", "==", brand.name), // Dynamically filters by Zumtobel or LIT
          limit(10)
        );

        const querySnapshot = await getDocs(q);
        results[brand.id] = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
      } catch (error) {
        console.error(`Error fetching ${brand.name}:`, error);
      }
    }));
    
    setBrandProducts(results);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserSession(user || null);
    });

    fetchBrandProducts();

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    return () => {
      unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    auth.signOut();
    setUserSession(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans antialiased text-slate-900 overflow-x-hidden">
      
      {/* MOBILE NAV SIDEBAR */}
      <AnimatePresence>
        {isNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNavOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[2000] lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="fixed top-0 left-0 h-full w-[80%] bg-[#0a0a0a] z-[2001] lg:hidden flex flex-col shadow-2xl"
            >
              <div className="p-8 flex items-center justify-between border-b border-white/5">
                <img src={LOGO_WHITE} alt="Logo" className="h-11 w-auto object-contain" />
                <button onClick={() => setIsNavOpen(false)} className="text-white/40"><X size={20} /></button>
              </div>
              <div className="flex-grow py-4 px-2">
                {navLinks.map((link, idx) => (
                  <Link key={link.name} href={link.href} onClick={() => setIsNavOpen(false)} className="group flex items-center justify-between px-6 py-5 border-b border-white/5 relative">
                    <span className="text-xs font-black uppercase tracking-widest text-white">{link.name}</span>
                    <ArrowRight size={14} className="text-white/20" />
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP NAV */}
      <nav className="fixed top-0 left-0 w-full z-[1000] py-4 transition-all duration-500">
        <motion.div
          animate={{
            backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0)",
            backdropFilter: isScrolled ? "blur(16px)" : "blur(0px)",
            height: isScrolled ? "70px" : "90px",
          }}
          className="absolute inset-0 -z-10"
        />
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-full">
          <Link href="/">
            <img src={isScrolled ? LOGO_RED : LOGO_WHITE} alt="Logo" className="h-10 md:h-12 object-contain" />
          </Link>

          <div className="hidden lg:flex items-center gap-1 bg-white/10 rounded-full px-2 py-1 border border-white/10">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className={`px-5 py-2 text-[11px] font-black uppercase tracking-widest rounded-full transition-colors ${isScrolled ? "text-gray-900" : "text-white"} hover:bg-[#d11a2a] hover:text-white`}>
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
             {userSession && (
                <Link href="/catalog" className={`hidden lg:flex px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${isScrolled ? "border-gray-200 text-gray-900" : "border-white/20 text-white"}`}>
                  Catalog
                </Link>
             )}
             <Link href="/quote" className="px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#d11a2a] text-white">
               Free Quote
             </Link>
             <button className="lg:hidden p-2" onClick={() => setIsNavOpen(true)}>
                <Menu className={isScrolled ? "text-black" : "text-white"} />
             </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-[60vh] w-full flex items-center justify-center bg-[#050505]">
        <div className="absolute inset-0 opacity-40">
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="Hero" />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-white text-5xl md:text-[7rem] font-black uppercase tracking-tighter italic leading-none">
            THE BRANDS<br /><span className="text-transparent" style={{ WebkitTextStroke: "1px white" }}>WE TRUST</span>
          </h1>
        </div>
      </section>

      {/* DYNAMIC BRAND SHOWCASE MAIN LOOP */}
      <main className="flex-grow w-full relative z-20">
        {BRANDS_CONFIG.map((brand) => (
          <section key={brand.id} className={`w-full py-24 border-b border-gray-50 ${brand.bgColor}`}>
            <div className="max-w-[1400px] mx-auto px-8 md:px-12 flex flex-col lg:flex-row gap-20 items-center">
              
              {/* BRAND SIDEBAR */}
              <div className="w-full lg:w-[350px] space-y-10 text-center lg:text-left">
                <img src={brand.logo} alt={brand.name} className="h-16 md:h-20 mx-auto lg:mx-0 object-contain" />
                <div className="space-y-4">
                  <h2 className={`text-3xl font-black italic uppercase ${brand.accentColor}`}>{brand.name} SELECTION</h2>
                  <p className="text-[13px] text-gray-500 font-bold uppercase tracking-wide leading-relaxed">{brand.description}</p>
                </div>
                <Link href={brand.slug} className="inline-flex items-center justify-between w-full md:w-auto md:min-w-[240px] px-8 py-5 bg-black text-white hover:bg-[#d11a2a] transition-all">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">View {brand.name} Portal</span>
                  <ArrowRight size={18} />
                </Link>
              </div>

              {/* PRODUCTS SLIDER FOR THIS BRAND */}
              <div className="flex-1 w-full min-w-0">
                <Swiper
                  modules={[Navigation, Autoplay]}
                  spaceBetween={24}
                  slidesPerView={1.2}
                  breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
                  autoplay={{ delay: 4000 }}
                  navigation={{ prevEl: `.prev-${brand.id}`, nextEl: `.next-${brand.id}` }}
                >
                  {brandProducts[brand.id]?.map((product: any) => (
                    <SwiperSlide key={product.id} className="pb-10">
                      <Link href={`/lighting-products-smart-solutions/${product.id}`}>
                        <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 h-full group flex flex-col border-b-4 hover:border-b-[#d11a2a]">
                          <div className="aspect-[4/5] bg-gray-50/50 p-8 flex items-center justify-center relative">
                            <img src={product.mainImage} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus size={16} className="text-[#d11a2a]" />
                            </div>
                          </div>
                          <div className="p-8 flex-grow">
                            <h4 className="text-[11px] font-black uppercase text-gray-900 line-clamp-2 leading-tight">{product.name}</h4>
                            <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Brand: {product.brand}</p>
                          </div>
                        </div>
                      </Link>
                    </SwiperSlide>
                  ))}
                </Swiper>
                
                {/* Custom Nav Buttons based on brand ID */}
                <div className="flex gap-4 mt-4 justify-center lg:justify-start">
                  <button className={`prev-${brand.id} w-12 h-12 flex items-center justify-center border rounded-full hover:bg-black hover:text-white transition-all`}><ChevronLeft /></button>
                  <button className={`next-${brand.id} w-12 h-12 flex items-center justify-center border rounded-full hover:bg-black hover:text-white transition-all`}><ChevronRight /></button>
                </div>
              </div>

            </div>
          </section>
        ))}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0a0a0a] text-white pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-6">
           <SignUpNewsletter />
           <div className="mt-20 pt-12 border-t border-white/5 flex justify-between items-center">
             <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">© 2026 Disruptive Solutions Inc.</p>
             <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-gray-500 hover:text-white transition-colors"><ChevronUp /></button>
           </div>
        </div>
      </footer>
    </div>
  );
}