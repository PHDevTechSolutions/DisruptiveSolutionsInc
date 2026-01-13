"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";
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
  ChevronUp 
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
      
      {/* --- 1. NAVIGATION --- */}
      <nav className="fixed top-0 left-0 w-full z-[1000] py-4 transition-all duration-500">
        <motion.div
          initial={false}
          animate={{
            backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0)",
            backdropFilter: isScrolled ? "blur(20px)" : "blur(0px)",
            boxShadow: isScrolled ? "0 4px 30px rgba(0, 0, 0, 0.05)" : "0 0px 0px rgba(0, 0, 0, 0)",
            height: isScrolled ? "70px" : "90px",
          }}
          className="absolute inset-0 transition-all duration-500"
        />

        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative z-10 h-full">
          <Link href="/">
            <motion.img
              animate={{ scale: isScrolled ? 0.85 : 1 }}
              src={isScrolled ? LOGO_RED : LOGO_WHITE}
              alt="Logo"
              className="h-12 w-auto object-contain transition-all duration-500"
            />
          </Link>

          <motion.div
            initial={false}
            animate={{
              gap: isScrolled ? "4px" : "12px",
              backgroundColor: isScrolled ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.15)",
              border: isScrolled ? "1px solid rgba(0, 0, 0, 0.05)" : "1px solid rgba(255, 255, 255, 0.2)",
            }}
            className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center py-1.5 px-4 rounded-full transition-all duration-500"
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
                <span className="relative z-10 group-hover:text-white transition-colors">{link.name}</span>
              </Link>
            ))}
          </motion.div>

          <div className="hidden lg:block">
            <Link
              href="/quote"
              className={`px-7 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-500 shadow-xl ${
                isScrolled ? "bg-[#d11a2a] text-white" : "bg-white text-gray-900"
              }`}
            >
              Free Quote
            </Link>
          </div>

          <button className="lg:hidden p-2" onClick={() => setIsNavOpen(true)}>
            <Menu className={isScrolled ? "text-gray-900" : "text-white"} size={28} />
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