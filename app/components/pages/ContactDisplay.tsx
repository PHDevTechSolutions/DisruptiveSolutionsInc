"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase"; 
import { 
  collection, query, onSnapshot, 
  addDoc, deleteDoc, updateDoc, doc, serverTimestamp, orderBy 
} from "firebase/firestore";
import { 
  Mail, Phone, MapPin, Loader2, Plus, Trash2, Edit2, X, Check, Settings2,
  Facebook, Instagram, Linkedin, Link as LinkIcon
} from "lucide-react";

interface ContactItem {
  id: string;
  type: string;
  value: string;
}

const ContactDisplay = () => {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [activeType, setActiveType] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ value: "" });

  // --- FETCH DATA (Real-time) ---
  useEffect(() => {
    const q = query(collection(db, "contact_info"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setContacts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ContactItem[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- HANDLERS ---
  const handleSave = async (type: string) => {
    if (!formData.value) return;
    try {
      if (editingId) {
        await updateDoc(doc(db, "contact_info", editingId), { value: formData.value });
      } else {
        await addDoc(collection(db, "contact_info"), { 
          value: formData.value, 
          type: type.toLowerCase(),
          createdAt: serverTimestamp() 
        });
      }
      cancelEdit();
    } catch (err) { console.error(err); }
  };

  const addNewSection = async () => {
    const newSectionName = prompt("Enter section name (e.g. Viber, WhatsApp, TikTok):");
    if (newSectionName) {
      const cleanName = newSectionName.toLowerCase().trim();
      try {
        await addDoc(collection(db, "contact_info"), { 
          value: `Click edit to add ${newSectionName} details`, 
          type: cleanName,
          createdAt: serverTimestamp() 
        });
      } catch (err) { console.error(err); }
    }
  };

  const cancelEdit = () => {
    setActiveType(null);
    setEditingId(null);
    setFormData({ value: "" });
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "email": return <Mail size={18} />;
      case "phone": return <Phone size={18} />;
      case "address": return <MapPin size={18} />;
      case "facebook": return <Facebook size={18} />;
      case "instagram": return <Instagram size={18} />;
      case "linkedin": return <Linkedin size={18} />;
      default: return <LinkIcon size={18} />;
    }
  };

  // --- COMPONENT: RENDER SECTION ---
  const renderSection = (type: string, title: string) => {
    const icon = getIcon(type);
    const filtered = contacts.filter(c => c.type === type.toLowerCase());
    const isSocial = ["facebook", "instagram", "linkedin"].includes(type.toLowerCase());
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
          {/* MULTIPLE INSERT: Always show Plus icon if Admin is ON */}
          {isAdmin && (
             <button 
               onClick={() => {
                 cancelEdit();
                 setActiveType(type);
               }} 
               className="text-[#d11a2a] p-1.5 hover:bg-red-50 rounded-lg transition-colors"
             >
               <Plus size={18} />
             </button>
          )}
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div 
                key={item.id} 
                layout 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, scale: 0.95 }} 
                className="flex items-center justify-between group"
              >
                <div className="flex gap-4 min-w-0 flex-1 items-center">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-red-50 flex items-center justify-center text-[#d11a2a] group-hover:bg-[#d11a2a] group-hover:text-white transition-all duration-300 shadow-sm">
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    {isSocial && !isAdmin ? (
                        <a 
                          href={item.value.startsWith('http') ? item.value : `https://${item.value}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-bold text-[#d11a2a] hover:underline text-sm md:text-base truncate block"
                        >
                            {item.value.replace('https://', '').replace('www.', '')}
                        </a>
                    ) : (
                        <p className="font-bold text-gray-900 text-sm md:text-base break-words whitespace-pre-line leading-tight">
                            {item.value}
                        </p>
                    )}
                  </div>
                </div>
                
                {isAdmin && (
                  <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { 
                        setEditingId(item.id); 
                        setFormData({ value: item.value }); 
                        setActiveType(type); 
                      }} 
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md"
                    >
                      <Edit2 size={14}/>
                    </button>
                    <button 
                      onClick={() => {
                        if(confirm("Delete this entry?")) deleteDoc(doc(db, "contact_info", item.id));
                      }} 
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* EDIT/ADD BOX */}
          {activeType === type && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3 shadow-inner">
              <textarea 
                placeholder={isSocial ? "Paste link..." : `Enter ${title} details...`}
                className="w-full bg-white p-3 rounded-xl text-sm font-bold border-none ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-[#d11a2a]/20 min-h-[60px]"
                value={formData.value} 
                onChange={e => setFormData({ value: e.target.value })}
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={() => handleSave(type)} className="flex-1 bg-[#d11a2a] text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 shadow-md hover:bg-[#b01622]">
                  <Check size={14}/> {editingId ? "Update" : "Save"}
                </button>
                <button onClick={cancelEdit} className="flex-1 bg-white border border-gray-200 text-gray-400 py-2 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1">
                  <X size={14}/> Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="h-64 flex items-center justify-center bg-white rounded-[40px] shadow-2xl border border-gray-100">
      <Loader2 className="animate-spin text-[#d11a2a]" size={32} />
    </div>
  );

  const defaultTypes = ["email", "phone", "address"];
  const socialTypes = ["facebook", "instagram", "linkedin"];
  const customTypes = Array.from(new Set(contacts.map(c => c.type).filter(t => !defaultTypes.includes(t) && !socialTypes.includes(t))));

  return (
    <div className="bg-white p-8 md:p-10 rounded-[32px] md:rounded-[40px] shadow-2xl border border-gray-100 relative">
      <button 
        onClick={() => { setIsAdmin(!isAdmin); cancelEdit(); }} 
        className={`absolute top-6 right-6 p-2 rounded-xl transition-all z-10 ${isAdmin ? 'bg-[#d11a2a] text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
      >
        <Settings2 size={18} />
      </button>

      <h3 className="text-xl md:text-2xl font-black uppercase mb-10 tracking-tight">
        Quick <span className="text-[#d11a2a]">Contacts</span>
      </h3>

      <div className="space-y-12">
        {/* MULTIPLE ENTRIES ALLOWED HERE */}
        {renderSection("email", "Email Us")}
        <hr className="border-gray-50" />
        {renderSection("phone", "Direct Lines")}
        <hr className="border-gray-50" />
        {renderSection("address", "Headquarters")}

        {/* SOCIAL MEDIA SECTION */}
        <div className="pt-6">
          <hr className="border-gray-800/10 mb-10" />
          <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.4em] mb-8">Social Ecosystem</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {renderSection("facebook", "Facebook")}
              {renderSection("instagram", "Instagram")}
              {renderSection("linkedin", "LinkedIn")}
          </div>
        </div>
        
        {/* CUSTOM SECTIONS */}
        {customTypes.length > 0 && (
          <div className="pt-6 space-y-12">
            {customTypes.map(type => (
              <React.Fragment key={type}>
                <hr className="border-gray-50" />
                {renderSection(type, type.charAt(0).toUpperCase() + type.slice(1))}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* CREATE NEW CATEGORY */}
        {isAdmin && (
          <button 
            onClick={addNewSection} 
            className="w-full mt-12 py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:text-[#d11a2a] hover:border-[#d11a2a] transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Create New Category
          </button>
        )}
      </div>
    </div>
  );
};

export default ContactDisplay;