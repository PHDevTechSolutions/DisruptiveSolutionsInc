"use client";

import React, { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { 
  Save, Layout, AlignLeft, AlignCenter, AlignRight, 
  Image as ImageIcon, Power, Upload, Loader2, Globe 
} from "lucide-react";
import { motion } from "framer-motion";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function CMSAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    alignment: "center",
    isActive: false,
    link: "/lighting-products-smart-solutions"
  });

  useEffect(() => {
    const fetchConfig = async () => {
      const docRef = doc(db, "cms_settings", "home_popup");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConfig(docSnap.data() as any);
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const remoteUrl = await uploadToCloudinary(file);
      if (remoteUrl) {
        setConfig(prev => ({ ...prev, imageUrl: remoteUrl }));
      }
    } catch (error) {
      console.error("Cloudinary Error:", error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, "cms_settings", "home_popup");
      await setDoc(docRef, {
        ...config,
        lastUpdated: serverTimestamp(),
      }, { merge: true });
      alert("CMS Updated Successfully! 🔥");
    } catch (err) {
      console.error(err);
      alert("Failed to update CMS.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-gray-900 font-mono">Loading CMS Engine...</div>;

  return (
    // PINALITAN: bg-white at text-slate-900
    <div className="min-h-screen bg-white text-slate-900 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-black">Popup Manager</h1>
            <p className="text-[#d11a2a] text-xs font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
              <Globe size={12}/> Cloudinary x Firestore Sync
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex items-center gap-3 bg-[#d11a2a] hover:bg-black text-white transition-all px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest disabled:opacity-50 shadow-lg shadow-red-500/20"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Form Side */}
          <div className="space-y-6">
            
            {/* Toggle Status - Light Mode Card */}
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-[32px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Power className={config.isActive ? "text-green-500" : "text-gray-400"} size={20} />
                  <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">Popup Status</span>
                </div>
                <button
                  onClick={() => setConfig({ ...config, isActive: !config.isActive })}
                  className={`w-14 h-8 rounded-full transition-all relative ${config.isActive ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${config.isActive ? "right-1" : "left-1"}`} />
                </button>
              </div>
            </div>

            {/* Cloudinary Upload Box - Light Mode */}
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-[32px] space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <ImageIcon size={14} /> Cloudinary Asset
              </label>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative h-40 w-full bg-white border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:border-[#d11a2a] transition-all"
              >
                {config.imageUrl ? (
                  <>
                    <img src={config.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity text-black">
                      <Upload size={24} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Change Visual</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    {uploading ? <Loader2 className="animate-spin mx-auto mb-2 text-[#d11a2a]" /> : <Upload className="mx-auto mb-2 text-gray-400" />}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {uploading ? "Uploading..." : "Upload to Cloudinary"}
                    </span>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>

            {/* Alignment Picker - Light Mode */}
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-[32px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-4 flex items-center gap-2">
                <Layout size={14} /> Entrance Alignment
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "left", icon: <AlignLeft size={18} />, label: "Left" },
                  { id: "center", icon: <AlignCenter size={18} />, label: "Center" },
                  { id: "right", icon: <AlignRight size={18} />, label: "Right" },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => setConfig({ ...config, alignment: pos.id })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                      config.alignment === pos.id 
                      ? "bg-[#d11a2a] border-[#d11a2a] text-white shadow-md shadow-red-500/20" 
                      : "bg-white border-gray-200 text-gray-400 hover:border-gray-400"
                    }`}
                  >
                    {pos.icon}
                    <span className="text-[9px] font-black uppercase">{pos.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Input - Light Mode */}
            <div className="bg-gray-50 border border-gray-200 p-8 rounded-[32px] space-y-4">
               <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-2">Main Title</label>
                  <input 
                    type="text" 
                    value={config.title}
                    onChange={(e) => setConfig({...config, title: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#d11a2a] outline-none transition-all text-black"
                  />
               </div>
               <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-2">Subtitle</label>
                  <input 
                    type="text" 
                    value={config.subtitle}
                    onChange={(e) => setConfig({...config, subtitle: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#d11a2a] outline-none transition-all text-black"
                  />
               </div>
            </div>
          </div>

          {/* Preview Side - Nanatiling Dark/Dashed for contrast */}
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live Preview</span>
            <div className="flex-grow bg-gray-50 border-2 border-dashed border-gray-200 rounded-[40px] flex items-center justify-center relative overflow-hidden p-10">
                <div className="text-center">
                   <div className="w-full max-w-[280px] bg-white text-black rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                      <div className="h-32 bg-gray-100">
                        {config.imageUrl && <img src={config.imageUrl} className="w-full h-full object-cover" />}
                      </div>
                      <div className="p-6">
                        <h4 className="font-black uppercase italic leading-none text-xl mb-1">{config.title || "TITLE"}</h4>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{config.subtitle || "SUBTITLE"}</p>
                        <div className="mt-6 w-full h-10 bg-[#d11a2a] rounded-xl" />
                      </div>
                   </div>
                   <p className="mt-4 text-[9px] text-gray-400 uppercase font-bold italic">
                     Animation: Slide from {config.alignment}
                   </p>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}