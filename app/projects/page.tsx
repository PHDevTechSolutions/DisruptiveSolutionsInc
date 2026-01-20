"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronRight, Home, LayoutGrid, Plus } from "lucide-react";
import Footer from "../components/navigation/footer";
import Link from "next/link";

export default function ProjectGalleryPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // PAGINATION STATE
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // LOAD MORE HANDLER
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#d11a2a]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] relative">
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.3] z-0" 
        style={{ backgroundImage: `linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)`, backgroundSize: '40px 40px' }} 
      />

      <div className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 pt-12 pb-10">
          <nav className="flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            <Link href="/" className="flex items-center gap-1 hover:text-[#d11a2a] transition-colors">
              <Home size={12} /> Home
            </Link>
            <ChevronRight size={12} />
            <span className="text-black">Projects</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <h2 className="text-[#d11a2a] text-[11px] font-black uppercase tracking-[0.4em]">Our Portfolio</h2>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
              Featured <span className="text-[#d11a2a]">Projects</span>
            </h1>
          </motion.div>
        </section>

        {/* GRID SECTION */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
  <AnimatePresence mode="popLayout">
    {projects.slice(0, visibleCount).map((project, index) => (
      <motion.div
        layout
        key={project.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="group relative bg-white rounded-[20px] md:rounded-[32px] overflow-hidden shadow-sm border border-gray-100"
      >
        {/* IMAGE CONTAINER */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img 
            src={project.imageUrl} 
            alt={project.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          
          {/* HOVER OVERLAY - Inayos ang Padding */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-[#d11a2a]/40 to-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center p-2 md:p-8 text-center">
            
            {project.logoUrl && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                className="w-full flex justify-center items-center px-4"
              >
                {/* LOGO SIZE: Lakihan natin - w-32 sa mobile, w-48 sa desktop */}
                <img 
                  src={project.logoUrl} 
                  alt="Logo" 
                  className="w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-2xl" 
                />
              </motion.div>
            )}
            
          </div>
        </div>

        {/* BOTTOM TEXT */}
        <div className="p-4 md:p-8 bg-white">
          <h3 className="text-[11px] md:text-lg font-black uppercase tracking-tight text-gray-900 truncate leading-none">
            {project.title}
          </h3>
          <p className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 truncate italic">
            {project.description || "Lighting Excellence"}
          </p>
        </div>
      </motion.div>
    ))}
  </AnimatePresence>
</div>

          {/* LOAD MORE BUTTON - Lalabas lang kung may higit sa 6 na projects */}
          {projects.length > visibleCount && (
            <div className="flex justify-center mt-20">
              <button 
                onClick={handleLoadMore}
                className="group relative flex flex-col items-center gap-4 outline-none"
              >
                <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-black group-hover:border-black transition-all duration-500">
                  <Plus className="text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover:text-black transition-colors">
                  Load More Projects
                </span>
                
                {/* Decorative counter */}
                <div className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                  Showing {visibleCount} of {projects.length}
                </div>
              </button>
            </div>
          )}
        </section>

        <Footer />
      </div>
    </div>
  );
}