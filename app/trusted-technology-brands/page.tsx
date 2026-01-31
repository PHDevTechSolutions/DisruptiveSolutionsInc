"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  orderBy, 
  onSnapshot 
} from "firebase/firestore";

// UI Components
import Navbar from "../components/navigation/navbar"; 
import Footer from "../components/navigation/footer";
import FloatingChatWidget from "../components/chat-widget";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

// Icons
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Loader2 
} from "lucide-react";

export default function BrandsShowcase() {
  const [dynamicBrands, setDynamicBrands] = useState<any[]>([]);
  const [brandProducts, setBrandProducts] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [userSession, setUserSession] = useState<any>(null);

  // --- 1. AUTH & SESSION ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserSession(user || null);
    });
    return () => unsubscribe();
  }, []);

// --- 2. FETCH BRANDS FROM DATABASE (DYNAMIC) ---
  useEffect(() => {
    const q = query(
      collection(db, "brand_name"),
      where("website", "==", "Disruptive Solutions Inc"),
      orderBy("title", "asc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const brandsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDynamicBrands(brandsData);
      
      // Isang tawag lang para makuha lahat ng products
      await fetchProductsForBrands(brandsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- 3. UPDATED FRONT-END FILTERING ---
  const fetchProductsForBrands = async (brandsList: any[]) => {
    try {
      const q = query(
        collection(db, "products"),
        where("website", "==", "Disruptive Solutions Inc")
      );

      const querySnapshot = await getDocs(q);
      const allProducts = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));

      const results: any = {};
      
      brandsList.forEach(brand => {
        // Hahanapin lahat ng products na tumutugma sa brand title
        const matchedProducts = allProducts.filter((p: any) => 
          p.brand?.toString().toLowerCase().trim() === brand.title?.toString().toLowerCase().trim()
        );
        results[brand.id] = matchedProducts;
      });
      
      setBrandProducts(results);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans antialiased text-slate-900 overflow-x-hidden">
      <Navbar />
      <FloatingChatWidget />

      {/* HERO SECTION */}
      <section className="relative h-[60vh] w-full flex items-center justify-center bg-[#050505]">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://disruptivesolutionsinc.com/wp-content/uploads/2025/11/image-2.png" 
            className="w-full h-full object-cover" 
            alt="Hero Background" 
          />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-white text-5xl md:text-[7rem] font-black uppercase tracking-tighter italic leading-none">
            THE BRANDS<br />
            <span className="text-transparent" style={{ WebkitTextStroke: "1px white" }}>
              WE TRUST
            </span>
          </h1>
        </div>
      </section>

      {/* DYNAMIC BRAND SHOWCASE */}
      <main className="flex-grow w-full relative z-20">
        {loading ? (
          <div className="py-40 text-center flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#d11a2a] mb-4" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              Synchronizing Forge Data...
            </p>
          </div>
        ) : (
          dynamicBrands.map((brand) => (
            <section key={brand.id} className="w-full py-24 border-b border-gray-50 bg-white">
              <div className="max-w-[1400px] mx-auto px-8 md:px-12 flex flex-col lg:flex-row gap-20 items-center">
                
                {/* BRAND SIDEBAR */}
                <div className="w-full lg:w-[350px] space-y-10 text-center lg:text-left">
                  <img 
                    src={brand.image} 
                    alt={brand.title} 
                    className="h-16 md:h-20 mx-auto lg:mx-0 object-contain" 
                  />
                  
                  <div className="space-y-4">
                    <h2 className="text-3xl font-black italic uppercase text-gray-900">
                      {brand.title} SELECTION
                    </h2>
                    <p className="text-[13px] text-gray-500 font-bold uppercase tracking-wide leading-relaxed line-clamp-4">
                      {brand.description}
                    </p>
                  </div>

                  <Link 
                    href={brand.href || "#"} 
                    className="inline-flex items-center justify-between w-full md:w-auto md:min-w-[240px] px-8 py-5 bg-black text-white hover:bg-[#d11a2a] transition-all"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                      View {brand.title} Portal
                    </span>
                    <ArrowRight size={18} />
                  </Link>
                </div>

                {/* PRODUCTS SLIDER */}
                <div className="flex-1 w-full min-w-0">
                  {brandProducts[brand.id]?.length > 0 ? (
                    <div className="relative group">
                      <Swiper
                        modules={[Navigation, Autoplay]}
                        spaceBetween={24}
                        slidesPerView={1.2}
                        breakpoints={{ 
                          640: { slidesPerView: 2 }, 
                          1024: { slidesPerView: 3 } 
                        }}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        navigation={{ 
                          prevEl: `.prev-${brand.id}`, 
                          nextEl: `.next-${brand.id}` 
                        }}
                      >
                        {brandProducts[brand.id]?.map((product: any) => {
  const productSlug = product.slug || product.id;
  const rawBrand = product.brand?.toString().toLowerCase().trim();

  // --- DYNAMIC ROUTING LOGIC ---
  // Kung "lit", magiging "/brand-lit/..."
  // Kung iba (like zumtobel), magiging "/zumtobel/..."
  const brandPath = rawBrand === 'lit' ? `brand-${rawBrand}` : rawBrand;

  return (
    <SwiperSlide key={product.id} className="pb-10">
      <Link href={`/${brandPath}/${productSlug}`}>
        <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 h-full group flex flex-col border-b-4 hover:border-b-[#d11a2a]">
          <div className="aspect-[4/5] bg-gray-50/50 p-8 flex items-center justify-center relative">
            <img 
              src={product.mainImage} 
              alt={product.name} 
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" 
            />
            <div className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus size={16} className="text-[#d11a2a]" />
            </div>
          </div>
          <div className="p-8 flex-grow">
            <h4 className="text-[11px] font-black uppercase text-gray-900 line-clamp-2 leading-tight">
              {product.name}
            </h4>
            <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
              Brand: {product.brand}
            </p>
          </div>
        </div>
      </Link>
    </SwiperSlide>
  );
})}
                      </Swiper>
                      
                      {/* Custom Navigation */}
                      <div className="flex gap-4 mt-4 justify-center lg:justify-start">
                        <button className={`prev-${brand.id} w-12 h-12 flex items-center justify-center border rounded-full hover:bg-black hover:text-white transition-all`}>
                          <ChevronLeft size={20} />
                        </button>
                        <button className={`next-${brand.id} w-12 h-12 flex items-center justify-center border rounded-full hover:bg-black hover:text-white transition-all`}>
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[32px] bg-gray-50/30">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
                        No Assets Linked to {brand.title}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          ))
        )}
      </main>

      <Footer />
    </div>
  );
}