"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Search, 
  Image as ImageIcon, 
  ArrowLeft, 
  X,
  MailCheck,
  CheckCircle2,
  Loader2,
  Download // Idinagdag para sa icon
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Footer from "../components/navigation/footer";

const CATALOG_DATA = [
  {
    id: 1,
    title: "Interior Masterpieces 2026",
    description: "Our flagship collection of architectural lighting designs.",
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=2070",
    category: "Architecture",
    pdfUrl: "https://your-pdf-link-here.com/sample1.pdf" 
  },
  {
    id: 2,
    title: "The Industrial Series",
    description: "Rugged, raw, and disruptive lighting for modern spaces.",
    image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=2070",
    category: "Industrial",
    pdfUrl: "https://your-pdf-link-here.com/sample2.pdf"
  },
  {
    id: 3,
    title: "Smart Home Integration",
    description: "Wireless controls and IoT-ready lighting ecosystems.",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=2070",
    category: "Technology",
    pdfUrl: "https://your-pdf-link-here.com/sample3.pdf"
  },
];

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCatalog, setSelectedCatalog] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const filteredCatalogs = CATALOG_DATA.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, "catalog_requests"), {
        requesterName: formData.name,
        requesterEmail: formData.email,
        catalogTitle: selectedCatalog.title,
        status: "pending",
        requestedAt: serverTimestamp(),
      });

      await fetch("/api/catalog-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          catalogTitle: selectedCatalog.title,
        }),
      });

      // Dito na magiging true ang access
      setIsSuccess(true);
      
    } catch (error) {
      console.error("Error:", error);
      alert("Error sending request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedCatalog(null);
    setFormData({ name: "", email: "" });
    setIsSuccess(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] selection:bg-[#d11a2a]/10 selection:text-[#d11a2a]">
      
      <AnimatePresence>
        {selectedCatalog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl p-8 md:p-10"
            >
              {!isSuccess ? (
                <>
                  <button onClick={handleCloseModal} className="absolute top-6 right-6 text-gray-400 hover:text-black">
                    <X size={20} />
                  </button>
                  <div className="mb-8 text-center md:text-left">
                    <div className="w-12 h-12 bg-[#d11a2a]/10 rounded-2xl flex items-center justify-center text-[#d11a2a] mb-6 mx-auto md:mx-0">
                      <MailCheck size={24} />
                    </div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">Request Access</h2>
                    <p className="text-gray-500 text-xs font-bold uppercase mt-2 tracking-widest">Catalog: {selectedCatalog.title}</p>
                  </div>

                  <form onSubmit={handleRequestAccess} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                      <input required type="text" placeholder="Juan Dela Cruz" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 outline-none focus:border-[#d11a2a] font-bold text-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Work Email</label>
                      <input required type="email" placeholder="juan@company.com" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 outline-none focus:border-[#d11a2a] font-bold text-sm" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <button disabled={isSubmitting} type="submit" className="w-full bg-[#d11a2a] text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 mt-4">
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <>Submit Request <Send size={16} /></>}
                    </button>
                  </form>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="py-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Access Granted!</h2>
                  <p className="text-gray-500 text-sm font-medium mb-8 max-w-[280px]">
                    Thank you, {formData.name.split(' ')[0]}. You can now download the technical catalog below.
                  </p>
                  
                  {/* DOWNLOAD BUTTON - Lalabas lang to pag Success */}
                  <a 
                    href={selectedCatalog.pdfUrl} 
                    download
                    className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#d11a2a] transition-all"
                  >
                    Download PDF <Download size={18} />
                  </a>
                  
                  <button onClick={handleCloseModal} className="mt-6 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black">
                    Close
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-32">
        {/* ... Header and Search Input stay the same ... */}
        <header className="mb-16">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-[#d11a2a] transition-colors mb-8 group w-fit">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Home</span>
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 uppercase tracking-tighter italic">
                The <span className="text-[#d11a2a]">Archives</span>
              </h1>
              <p className="mt-4 text-gray-500 max-w-md font-medium leading-relaxed">
                Log your request to receive technical specifications from our engineering team.
              </p>
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#d11a2a] transition-colors" size={18} />
              <input type="text" placeholder="Search collection..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-6 w-full md:w-[300px] shadow-sm focus:ring-2 focus:ring-[#d11a2a]/20 outline-none font-bold text-sm" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredCatalogs.map((item) => (
              <motion.div key={item.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="group bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-50">
                <div className="relative h-64 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                    <span className="text-white/80 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <ImageIcon size={14} /> {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium line-clamp-2">{item.description}</p>
                  <button onClick={() => setSelectedCatalog(item)} className="flex items-center justify-between w-full bg-gray-50 group-hover:bg-[#d11a2a] px-6 py-4 rounded-2xl transition-all duration-300">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 group-hover:text-white">Log Request</span>
                    <Send size={18} className="text-[#d11a2a] group-hover:text-white" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
      <Footer/>
    </div>
  );
}