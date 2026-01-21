"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, onSnapshot, query, orderBy, 
  deleteDoc, doc, addDoc, updateDoc, serverTimestamp 
} from "firebase/firestore";
import { 
  Plus, Pencil, Trash2, Loader2, X, 
  Save, UploadCloud, Link2, PlusCircle, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function BrandsManager() {
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [availablePages, setAvailablePages] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- States for Custom Dialogs ---
  const [dialogConfig, setDialogConfig] = useState<{show: boolean, type: 'category' | 'page'}>({show: false, type: 'category'});
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [newVal1, setNewVal1] = useState(""); 
  const [newVal2, setNewVal2] = useState(""); 

  // --- Brand Form States ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [href, setHref] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePrev, setImagePrev] = useState<string | null>(null);

  useEffect(() => {
    const unsubBrands = onSnapshot(query(collection(db, "brands"), orderBy("createdAt", "desc")), (snap) => {
      setBrands(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    const unsubCats = onSnapshot(query(collection(db, "brand_categories"), orderBy("name", "asc")), (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubPages = onSnapshot(query(collection(db, "website_pages"), orderBy("name", "asc")), (snap) => {
      setAvailablePages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubBrands(); unsubCats(); unsubPages(); };
  }, []);

  const handleDialogSubmit = async () => {
    if (!newVal1) return;
    const colName = dialogConfig.type === 'category' ? "brand_categories" : "website_pages";
    const data = dialogConfig.type === 'category' ? { name: newVal1 } : { name: newVal1, url: newVal2 };

    try {
        if (inlineEditId) {
          await updateDoc(doc(db, colName, inlineEditId), data);
        } else {
          await addDoc(collection(db, colName), data);
        }
        resetDialog();
    } catch (e) { console.error(e) }
  };

  const resetDialog = () => {
    setInlineEditId(null); setNewVal1(""); setNewVal2("");
    setDialogConfig({ ...dialogConfig, show: false });
  };

  // --- Main Brand Submit (FIXED LOGIC) ---
  const handleSubmit = async () => {
    // Basic validation: Title, Category, at Href lang ang required talaga
    if (!title || !category || !href) {
        alert("Please fill in the Title, Category, and Redirect Page.");
        return;
    }

    // Siguraduhin na may image kung mag-a-add ng bago
    if (!editingId && !imageFile) {
        alert("Please upload a brand logo.");
        return;
    }

    setIsSyncing(true);
    try {
      let finalImageUrl = imagePrev;

      // Kung may bagong file na in-upload, i-upload sa cloudinary
      if (imageFile) {
        finalImageUrl = await uploadToCloudinary(imageFile);
      }

      const brandDoc: any = { 
        title, 
        description: description || "", // Optional description
        category, 
        href, 
        image: finalImageUrl, 
        updatedAt: serverTimestamp() 
      };

      if (editingId) {
        await updateDoc(doc(db, "brands", editingId), brandDoc);
      } else {
        await addDoc(collection(db, "brands"), { 
            ...brandDoc, 
            createdAt: serverTimestamp() 
        });
      }
      closeModal();
    } catch (err) { 
        console.error("Submit Error:", err);
        alert("Something went wrong. Check console.");
    } finally { 
        setIsSyncing(false); 
    }
  };

  const openEdit = (brand: any) => {
    setEditingId(brand.id); 
    setTitle(brand.title); 
    setDescription(brand.description || "");
    setCategory(brand.category); 
    setHref(brand.href); 
    setImagePrev(brand.image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false); 
    setEditingId(null); 
    setTitle(""); 
    setDescription("");
    setCategory(""); 
    setHref(""); 
    setImageFile(null); 
    setImagePrev(null);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-8 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-10">
        <h1 className="text-4xl font-black uppercase tracking-tighter italic text-gray-900 leading-none">
          Brands <span className="text-[#d11a2a]">Forge</span>
        </h1>
        <button onClick={() => { closeModal(); setIsModalOpen(true); }} className="bg-black text-white px-8 py-5 rounded-[20px] font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-[#d11a2a] transition-all shadow-2xl">
          <Plus size={18} strokeWidth={3} /> Add Partner
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-widest">
            <tr>
              <th className="px-8 py-6 text-left">Identity</th>
              <th className="px-8 py-6 text-left">Meta / Route</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
                <tr>
                    <td colSpan={3} className="py-20 text-center">
                        <Loader2 className="animate-spin mx-auto text-gray-300" />
                    </td>
                </tr>
            ) : brands.map(brand => (
              <tr key={brand.id} className="hover:bg-gray-50/30 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <img src={brand.image} className="w-14 h-10 rounded-lg object-cover border border-gray-100 bg-gray-50" />
                    <span className="font-black text-gray-900 uppercase text-[13px] tracking-tight">{brand.title}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                    <span className="text-[9px] font-black text-[#d11a2a] uppercase px-2 py-0.5 bg-red-50 rounded-md block w-fit mb-1">{brand.category}</span>
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase"><Link2 size={10}/> {brand.href}</span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(brand)} className="p-3 bg-gray-50 text-gray-400 hover:bg-black hover:text-white rounded-xl transition-all shadow-sm"><Pencil size={16}/></button>
                    <button onClick={() => confirm("Are you sure you want to delete this brand?") && deleteDoc(doc(db, "brands", brand.id))} className="p-3 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all shadow-sm"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* QUICK DIALOG (MANAGEMENT OF CATEGORIES/PAGES) */}
      <AnimatePresence>
        {dialogConfig.show && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetDialog} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <h4 className="text-xl font-black uppercase italic tracking-tighter">Manage <span className="text-[#d11a2a]">{dialogConfig.type}</span></h4>
                <button onClick={resetDialog} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
              </div>

              <div className="p-8 flex-1 overflow-y-auto space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Existing Entries</label>
                  <div className="space-y-2">
                    {(dialogConfig.type === 'category' ? categories : availablePages).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-gray-900 uppercase tracking-tight">{item.name}</span>
                          {item.url && <span className="text-[10px] text-gray-400 font-medium italic">{item.url}</span>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setInlineEditId(item.id); setNewVal1(item.name); if(item.url) setNewVal2(item.url); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={14}/></button>
                          <button onClick={() => confirm("Delete?") && deleteDoc(doc(db, dialogConfig.type === 'category' ? "brand_categories" : "website_pages", item.id))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-gray-900 rounded-[24px] space-y-4">
                   <h5 className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-60">{inlineEditId ? "Update Entry" : "Create New"}</h5>
                   <div className="space-y-3">
                      <input value={newVal1} onChange={(e) => setNewVal1(e.target.value)} className="w-full bg-white/10 p-4 rounded-xl text-white font-bold text-sm outline-none border border-white/10 focus:border-[#d11a2a] transition-all" placeholder="Name/Label" />
                      {dialogConfig.type === 'page' && (
                        <input value={newVal2} onChange={(e) => setNewVal2(e.target.value)} className="w-full bg-white/10 p-4 rounded-xl text-white font-bold text-sm outline-none border border-white/10 focus:border-[#d11a2a] transition-all" placeholder="URL Route (/page)" />
                      )}
                      <div className="flex gap-2">
                        <button onClick={handleDialogSubmit} className="flex-1 bg-[#d11a2a] text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-red-700 transition-colors">
                          <Check size={16}/> {inlineEditId ? "Save Changes" : "Confirm Sync"}
                        </button>
                        {inlineEditId && <button onClick={() => { setInlineEditId(null); setNewVal1(""); setNewVal2(""); }} className="px-6 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"><X size={16}/></button>}
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN BRAND FORM DRAWER */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative bg-white w-full max-w-xl h-full shadow-2xl flex flex-col">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <h3 className="text-xl font-black uppercase italic text-gray-900">Configure <span className="text-[#d11a2a]">Partner</span></h3>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-10 pb-32">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Brand Identifier</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-2xl font-black uppercase border-b-2 border-gray-100 focus:border-[#d11a2a] outline-none pb-2 transition-all placeholder:text-gray-200" placeholder="BRAND NAME" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Category</label>
                        <button onClick={() => setDialogConfig({show: true, type: 'category'})} className="text-[#d11a2a] hover:scale-125 transition-transform"><PlusCircle size={14}/></button>
                      </div>
                      <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-gray-50 p-4 rounded-xl text-[11px] font-black uppercase outline-none border-2 border-transparent focus:border-[#d11a2a] cursor-pointer transition-all">
                        <option value="">Select Category</option>
                        {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Redirect Page</label>
                        <button onClick={() => setDialogConfig({show: true, type: 'page'})} className="text-[#d11a2a] hover:scale-125 transition-transform"><PlusCircle size={14}/></button>
                      </div>
                      <select value={href} onChange={(e) => setHref(e.target.value)} className="w-full bg-gray-50 p-4 rounded-xl text-[11px] font-black uppercase outline-none border-2 border-transparent focus:border-[#d11a2a] cursor-pointer transition-all">
                        <option value="">Select Route</option>
                        {availablePages.map(p => <option key={p.id} value={p.url}>{p.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Visual Asset (Logo)</label>
                  <div className="relative aspect-[16/9] rounded-[32px] border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden group hover:border-[#d11a2a] transition-all">
                    {imagePrev ? (
                        <>
                            <img src={imagePrev} className="w-full h-full object-contain p-8" alt="Preview" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-white text-[10px] font-black uppercase tracking-widest">Change Photo</span>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-gray-300 group-hover:text-[#d11a2a] transition-colors">
                            <UploadCloud size={32} className="mx-auto mb-2" />
                            <span className="text-[8px] font-black uppercase block tracking-widest">Upload Partner Logo</span>
                        </div>
                    )}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { 
                        const f = e.target.files?.[0]; 
                        if(f) { 
                            setImageFile(f); 
                            setImagePrev(URL.createObjectURL(f)); 
                        }
                    }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Description (Optional)</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full h-32 bg-gray-50 rounded-2xl p-6 text-[13px] font-medium outline-none border-none resize-none focus:ring-1 focus:ring-[#d11a2a] transition-all" placeholder="Tell the brand story..." />
                </div>
              </div>

              {/* SAVE BUTTON BOX */}
              <div className="p-8 border-t border-gray-100 bg-white absolute bottom-0 w-full shadow-[0_-10px_30px_rgba(0,0,0,0.04)]">
                <button 
                    onClick={handleSubmit} 
                    disabled={isSyncing} 
                    className="w-full bg-black text-white py-5 rounded-[20px] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-[#d11a2a] disabled:opacity-50 disabled:hover:bg-black transition-all shadow-xl"
                >
                  {isSyncing ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {isSyncing ? "Syncing to Cloud..." : editingId ? "Save Changes" : "Push to Database"}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}