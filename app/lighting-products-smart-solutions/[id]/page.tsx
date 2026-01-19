"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, limit, query } from "firebase/firestore";
import Footer from "../../components/navigation/footer";
import { 
  ArrowLeft, 
  Plus, 
  Check, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp,
  Minus
} from "lucide-react";
import { motion } from "framer-motion";

// --- COMPONENTS ---
import QuoteCartPanel from "../../components/QuoteCartPanel";

// --- SWIPER IMPORTS ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQty, setSelectedQty] = useState(1);
  const [isInCart, setIsInCart] = useState(false);

  const checkCartStatus = useCallback(() => {
    const savedCart = JSON.parse(localStorage.getItem("disruptive_quote_cart") || "[]");
    setIsInCart(savedCart.some((item: any) => item.id === id));
  }, [id]);

  useEffect(() => {
    checkCartStatus();
    window.addEventListener("cartUpdated", checkCartStatus);
    return () => window.removeEventListener("cartUpdated", checkCartStatus);
  }, [checkCartStatus]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "products", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }

        const q = query(collection(db, "products"), limit(12));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.id !== id);
        
        setRelatedProducts(products.sort(() => 0.5 - Math.random()));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const addToQuote = (prod: any) => {
    const currentCart = JSON.parse(localStorage.getItem("disruptive_quote_cart") || "[]");
    const existingItemIndex = currentCart.findIndex((item: any) => item.id === prod.id);

    let updatedCart;
    if (existingItemIndex > -1) {
      updatedCart = [...currentCart];
      updatedCart[existingItemIndex].quantity = (updatedCart[existingItemIndex].quantity || 1) + selectedQty;
    } else {
      updatedCart = [...currentCart, { ...prod, quantity: selectedQty }];
    }

    localStorage.setItem("disruptive_quote_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
    setSelectedQty(1);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#d11a2a]" /></div>;
  if (!product) return <div className="h-screen flex items-center justify-center text-xs font-black uppercase tracking-widest">Product Not Found</div>;

  return (
    <>
    <QuoteCartPanel/>
    <div className="min-h-screen bg-white pb-12 relative font-sans selection:bg-[#d11a2a] selection:text-white overflow-x-hidden">
      
      <nav className="p-4 md:p-5 border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] hover:text-[#d11a2a] transition-colors">
            <ArrowLeft size={14}/> Back
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-6 mt-8 md:mt-12">
        <div className="grid lg:grid-cols-12 gap-8 md:gap-12 items-start">
          
        {/* HERO IMAGE WITH MOUSE-FOLLOW ZOOM EFFECT */}
          <div 
            className="lg:col-span-5 bg-white rounded-2xl md:rounded-[32px] border border-gray-100 shadow-sm md:sticky md:top-24 flex items-center justify-center overflow-hidden group cursor-none relative aspect-square"
            onMouseMove={(e) => {
              const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - left) / width) * 100;
              const y = ((e.clientY - top) / height) * 100;
              
              // I-set ang transform origin base sa position ng mouse
              const target = e.currentTarget.querySelector('.zoom-image') as HTMLElement;
              if (target) {
                target.style.transformOrigin = `${x}% ${y}%`;
              }

              // I-update ang custom cursor position
              const cursor = e.currentTarget.querySelector('.custom-cursor') as HTMLElement;
              if (cursor) {
                cursor.style.left = `${e.clientX - left}px`;
                cursor.style.top = `${e.clientY - top}px`;
              }
            }}
          >
            {/* Custom Magnifying Glass Cursor */}
            <div className="custom-cursor absolute pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -translate-x-1/2 -translate-y-1/2 hidden md:block">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/40 shadow-2xl flex items-center justify-center">
                <Plus size={20} className="text-black" strokeWidth={3} />
              </div>
            </div>

            {/* The Image Wrapper */}
            <motion.div 
              className="zoom-image w-full h-full p-6 md:p-10 flex items-center justify-center transition-transform duration-200 ease-out"
              whileHover={{ scale: 2.5 }} // Mas malaking zoom para dama yung follow effect
            >
              <img 
                src={product.mainImage} 
                className="max-h-[250px] md:max-h-[400px] w-full object-contain pointer-events-none" 
                alt={product.name} 
              />
            </motion.div>
            
            {/* Instruction Label */}
            <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
              <span className="text-[7px] font-black uppercase tracking-[0.3em] text-gray-300 group-hover:text-[#d11a2a] transition-colors">
                Move mouse to inspect
              </span>
            </div>
          </div>
          
          <div className="lg:col-span-7 space-y-8 md:space-y-10">
            <div>
              <div className="flex gap-2 mb-3">
                {product.brands?.map((brand: string) => (
                  <span key={brand} className="px-2 py-0.5 bg-gray-900 text-white text-[8px] font-black uppercase tracking-widest rounded">{brand}</span>
                ))}
              </div>
              <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-tight mb-4 text-gray-900 italic">
                {product.name}
              </h1>
              {product.shortDescription && (
                <p className="text-sm md:text-base font-medium text-gray-500 leading-relaxed mb-6 max-w-xl">
                  {product.shortDescription}
                </p>
              )}
              <p className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.2em]">SKU: {product.sku || "N/A"}</p>
            </div>

            {/* TECHNICAL SPECS */}
            <div className="space-y-6">
              {product.technicalSpecs?.map((specGroup: any) => (
                <div key={specGroup.id} className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#d11a2a]">{specGroup.label}</h3>
                  <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full border-collapse bg-white text-left">
                      <tbody>
                        {specGroup.rows?.map((row: any, idx: number) => (
                          <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                            <td className="w-2/5 p-3 md:p-3.5 bg-gray-50/30 text-[9px] md:text-[10px] font-bold text-gray-400 uppercase border-r border-gray-50 italic">{row.name}</td>
                            <td className="p-3 md:p-3.5 text-[10px] md:text-[12px] font-semibold text-gray-700 uppercase">{row.value || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t border-gray-100">
              <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-2 bg-gray-50">
                <button onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))} className="p-1 hover:text-[#d11a2a] transition-colors"><Minus size={14} /></button>
                <span className="w-10 text-center text-sm font-black">{selectedQty}</span>
                <button onClick={() => setSelectedQty(selectedQty + 1)} className="p-1 hover:text-[#d11a2a] transition-colors"><Plus size={14} /></button>
              </div>

              <button 
                onClick={() => addToQuote(product)}
                className={`flex-1 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${
                  isInCart ? "bg-green-600 text-white shadow-md" : "bg-[#d11a2a] text-white hover:bg-black"
                }`}
              >
                {isInCart ? <><Check size={14}/> Added</> : <><Plus size={14}/> Add to Quote</>}
              </button>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS SECTION */}
        <div className="mt-20 md:mt-32 mb-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d11a2a] mb-2">You might also need</h3>
              <h2 className="text-2xl md:text-3xl font-black uppercase italic leading-none">Related Gear</h2>
            </div>
            <div className="flex gap-2">
              <button className="swiper-prev-btn p-3 border border-gray-100 rounded-full hover:bg-black hover:text-white transition-all shadow-sm">
                <ChevronLeft size={18} />
              </button>
              <button className="swiper-next-btn p-3 border border-gray-100 rounded-full hover:bg-black hover:text-white transition-all shadow-sm">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={1.2}
            navigation={{ prevEl: '.swiper-prev-btn', nextEl: '.swiper-next-btn' }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            breakpoints={{ 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 4 } }}
            className="pb-12"
          >
            {relatedProducts.map((item) => (
              <SwiperSlide key={item.id}>
                <Link href={`/lighting-products-smart-solutions/${item.id}`} className="group block h-full">
                  <div className="bg-gray-50 rounded-[24px] p-6 border border-transparent group-hover:border-gray-200 group-hover:bg-white transition-all duration-300 h-full flex flex-col">
                    <div className="aspect-square mb-6 overflow-hidden flex items-center justify-center bg-white rounded-2xl p-4 shadow-sm">
                      <motion.img whileHover={{ scale: 1.1 }} src={item.mainImage} alt={item.name} className="max-h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <div className="flex gap-1 mb-2">
                        {item.brands?.slice(0, 1).map((b: string) => (
                          <span key={b} className="text-[7px] font-black uppercase bg-black text-white px-1.5 py-0.5 rounded">{b}</span>
                        ))}
                      </div>
                      <h4 className="text-[11px] font-black uppercase leading-tight group-hover:text-[#d11a2a] transition-colors line-clamp-2 italic">{item.name}</h4>
                      <p className="text-[9px] text-gray-400 font-bold uppercase mt-2 tracking-widest">SKU: {item.sku || "N/A"}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                       <span className="text-[9px] font-black uppercase tracking-widest text-gray-300 group-hover:text-black transition-colors">View Details</span>
                       <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#d11a2a] group-hover:text-white transition-all"><Plus size={12} /></div>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </main>
    </div>
    <Footer/>
    </>
  );
}