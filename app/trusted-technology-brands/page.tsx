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
import Navbar from "../components/navigation/navbar";
import Footer from "../components/navigation/footer";
import QuoteCartPanel from "../components/QuoteCartPanel";
import FloatingChatWidget  from "../components/chat-widget";
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
    slug: "/lighting-products-smart-solutions",
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
      <Navbar/>
      <FloatingChatWidget/>

      {/* HERO SECTION */}
      <section className="relative h-[60vh] w-full flex items-center justify-center bg-[#050505]">
        <div className="absolute inset-0 opacity-40">
          <img src="https://disruptivesolutionsinc.com/wp-content/uploads/2025/11/image-2.png" className="w-full h-full object-cover" alt="Hero" />
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

      <Footer/>
    </div>
  );
}