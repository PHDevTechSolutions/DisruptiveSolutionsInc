"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from "firebase/firestore";

export default function HomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const docRef = doc(db, "cms_settings", "home_popup");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfig(data);
        
        if (data.isActive) {
          const POPUP_INTERVAL = 10 * 60 * 1000; 
          const lastShown = localStorage.getItem("last_popup_time");
          const currentTime = Date.now();

          if (!lastShown || currentTime - parseInt(lastShown) > POPUP_INTERVAL) {
            const timer = setTimeout(() => {
              setIsOpen(true);
              localStorage.setItem("last_popup_time", currentTime.toString());
            }, 2000);
            return () => clearTimeout(timer);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const closePopup = () => setIsOpen(false);

  if (!config) return null;

  // --- ALIGNMENT LOGIC ---
  // Dito natin ididikta kung saan pwesto ang popup base sa CMS
  const getAlignmentClasses = () => {
    switch (config.alignment) {
      case "left":
        return "justify-start md:pl-20"; // Pwesto sa kaliwa
      case "right":
        return "justify-end md:pr-20";   // Pwesto sa kanan
      case "center":
      default:
        return "justify-center";         // Gitna
    }
  };

  return (
    <AnimatePresence>
      {isOpen && config.isActive && (
        // Dinagdagan natin ng dynamic class ang container wrapper
        <div className={`fixed inset-0 z-[9999] flex items-center p-4 md:p-6 pointer-events-none ${getAlignmentClasses()}`}>
          
          {/* Backdrop - nilagyan ng pointer-events-auto para clickable pa rin ang background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ 
              opacity: 0, 
              scale: 0.9,
              x: config.alignment === "left" ? -50 : config.alignment === "right" ? 50 : 0,
              y: config.alignment === "center" ? 20 : 0 
            }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-md bg-white rounded-[40px] overflow-hidden shadow-2xl border border-gray-100 pointer-events-auto"
          >
            {/* Header Section */}
            <div className="h-44 bg-[#d11a2a] relative overflow-hidden flex flex-col items-center justify-center text-white">
              
              {/* Grid Overlay */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg width="100%" height="100%">
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="1"/>
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {config.imageUrl ? (
                <img src={config.imageUrl} alt="Promo" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <motion.div 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="bg-white p-4 rounded-3xl shadow-xl mb-2 z-10"
                >
                  <Zap size={30} className="text-[#d11a2a] fill-[#d11a2a]" />
                </motion.div>
              )}
              
              <button 
                onClick={closePopup}
                className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all z-20 backdrop-blur-md"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Section */}
            <div className="p-10 text-center">
              <h2 className="text-3xl font-black uppercase italic leading-[0.9] text-gray-900 mb-4 tracking-tighter">
                {config.title || "Flash Solutions"}
              </h2>
              
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8">
                {config.subtitle || "Industrial Smart Lighting & Tech Integration"}
              </p>

              <div className="space-y-3">
                <Link 
                  href={config.link || "/lighting-products-smart-solutions"}
                  onClick={closePopup}
                  className="w-full bg-[#d11a2a] text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 group"
                >
                  Explore Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <button onClick={closePopup} className="w-full py-2 text-[9px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-gray-600 transition-colors">
                  Dismiss for now
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}