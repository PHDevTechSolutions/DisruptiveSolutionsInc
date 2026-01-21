"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, onSnapshot, query, orderBy, 
  addDoc, deleteDoc, doc, serverTimestamp 
} from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Plus, Trash2, Loader2, UploadCloud, Zap, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PartnersManager() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isuploading, setIsuploading] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const q = query(collection(db, "brand_partners"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPartners(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleUpload = async () => {
    if (!file || !name) return alert("Punan ang pangalan at pumili ng logo.");
    setIsuploading(true);
    try {
      const url = await uploadToCloudinary(file);
      await addDoc(collection(db, "brand_partners"), {
        name,
        logoUrl: url,
        createdAt: serverTimestamp()
      });
      setName("");
      setFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsuploading(false);
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-gray-900">
            Partner <span className="text-[#d11a2a]">Slider</span> CMS
          </h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2">
            Manage logos for the infinite scrolling section
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT: UPLOAD FORM */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm h-fit space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
            <Plus size={18} className="text-[#d11a2a]" /> Add New Logo
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Partner Name</label>
              <input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 p-4 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-[#d11a2a] transition-all" 
                placeholder="e.g. Samsung"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Logo File</label>
              <div className="relative aspect-video rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden group hover:border-[#d11a2a] transition-all">
                {file ? (
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="text-center text-gray-300">
                    <UploadCloud size={24} className="mx-auto mb-2" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Select Image</span>
                  </div>
                )}
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
            </div>

            <button 
              onClick={handleUpload}
              disabled={isuploading}
              className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-[#d11a2a] transition-all disabled:opacity-50"
            >
              {isuploading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
              {isuploading ? "Uploading..." : "Sync to Slider"}
            </button>
          </div>
        </div>

        {/* RIGHT: LOGO LIST */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Current Partners ({partners.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <AnimatePresence>
              {partners.map((p) => (
                <motion.div 
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative bg-white border border-gray-100 p-6 rounded-[24px] flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all"
                >
                  <button 
                    onClick={() => confirm("Delete logo?") && deleteDoc(doc(db, "brand_partners", p.id))}
                    className="absolute top-3 right-3 p-2 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={12} />
                  </button>
                  <img src={p.logoUrl} className="h-12 md:h-16 w-auto object-contain mix-blend-multiply" alt={p.name} />
                  <p className="mt-3 text-[9px] font-black uppercase text-gray-400 tracking-tighter">{p.name}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}