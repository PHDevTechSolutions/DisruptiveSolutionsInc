"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Settings2, 
  Trash2, 
  Plus, 
  Save, 
  LayoutList, 
  ClipboardList 
} from "lucide-react";

interface SpecRow {
  name: string;
  value: string;
}

interface SpecBlock {
  id: number;
  label: string;
  rows: SpecRow[];
}

export default function SpecComponent() {
  // --- STATES ---
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // State para sa actual Product Specifications (descBlocks)
  const [descBlocks, setDescBlocks] = useState<SpecBlock[]>([
    { id: Date.now(), label: "TECHNICAL SPECIFICATIONS", rows: [{ name: "", value: "" }] }
  ]);

  // State para sa Maintenance (Template Setup)
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [templateFields, setTemplateFields] = useState<string[]>([""]);

  // --- FETCH CATEGORIES ---
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "categories"), (snap) => {
      setCategories(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
    });
    return () => unsub();
  }, []);

  // --- LOGIC: AUTO-FILL SPECS BASED ON CATEGORY ---
  useEffect(() => {
    const loadTemplate = async () => {
      if (!selectedCategory) return;

      try {
        const docRef = doc(db, "spec_templates", selectedCategory);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const templateData = docSnap.data();
          // I-set ang fields base sa template ng category
          const autoRows = templateData.fields.map((f: string) => ({
            name: f,
            value: ""
          }));

          setDescBlocks([
            {
              id: Date.now(),
              label: "TECHNICAL SPECIFICATIONS",
              rows: autoRows
            }
          ]);
          toast.success(`Template loaded for ${selectedCategory}`);
        }
      } catch (error) {
        console.error("Error loading template:", error);
      }
    };

    loadTemplate();
  }, [selectedCategory]);

  // --- MAINTENANCE ACTIONS ---
  const saveTemplate = async () => {
    if (!selectedCategory) return toast.error("Select a category first");
    const cleanFields = templateFields.filter(f => f.trim() !== "");
    
    try {
      await setDoc(doc(db, "spec_templates", selectedCategory), {
        category: selectedCategory,
        fields: cleanFields,
        updatedAt: serverTimestamp()
      });
      toast.success("Spec Template Updated!");
      setIsMaintenanceMode(false);
    } catch (e) {
      toast.error("Failed to save template");
    }
  };

  const loadMaintenanceFields = async () => {
    if (!selectedCategory) return;
    const docSnap = await getDoc(doc(db, "spec_templates", selectedCategory));
    if (docSnap.exists()) {
      setTemplateFields(docSnap.data().fields);
    } else {
      setTemplateFields([""]);
    }
    setIsMaintenanceMode(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      
      {/* 1. CATEGORY SELECTOR & MAINTENANCE TOGGLE */}
      <div className="flex flex-col md:flex-row gap-4 items-end bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm">
        <div className="flex-1 space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
            <LayoutList className="w-4 h-4" /> Select Category
          </label>
          <select 
            className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-purple-500 outline-none font-bold text-slate-700 transition-all"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">-- Choose Category --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        
        <Button 
          variant="outline" 
          className="h-12 px-6 border-2 border-dashed border-purple-300 text-purple-600 font-bold hover:bg-purple-50"
          onClick={loadMaintenanceFields}
          disabled={!selectedCategory}
        >
          <Settings2 className="w-4 h-4 mr-2" />
          Edit Template
        </Button>
      </div>

      {/* 2. MAINTENANCE MODAL/SECTION (Lilitaw lang pag click ng Edit Template) */}
      {isMaintenanceMode && (
        <div className="bg-purple-50 border-2 border-purple-200 p-6 rounded-2xl animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-purple-900 uppercase text-sm flex items-center gap-2">
              <ClipboardList className="w-5 h-5" /> Default Specs for {selectedCategory}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setIsMaintenanceMode(false)}>Close</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {templateFields.map((f, i) => (
              <div key={i} className="flex gap-2">
                <Input 
                  value={f}
                  className="bg-white border-2 border-purple-100"
                  onChange={(e) => {
                    const newF = [...templateFields];
                    newF[i] = e.target.value;
                    setTemplateFields(newF);
                  }}
                  placeholder="Field Name (e.g. Wattage)"
                />
                <Button 
                  variant="ghost" 
                  className="text-red-400 hover:text-red-600"
                  onClick={() => setTemplateFields(templateFields.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-white" onClick={() => setTemplateFields([...templateFields, ""])}>
              <Plus className="w-4 h-4 mr-2" /> Add Field
            </Button>
            <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={saveTemplate}>
              <Save className="w-4 h-4 mr-2" /> Save Template
            </Button>
          </div>
        </div>
      )}

      {/* 3. MAIN SPECIFICATION INPUTS */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Plus className="w-6 h-6 text-blue-500" /> PRODUCT SPECIFICATIONS
        </h2>

        {descBlocks.map((block, bIdx) => (
          <div key={block.id} className="p-6 border-2 border-slate-200 rounded-2xl bg-white shadow-sm hover:border-blue-300 transition-colors">
            <Input 
              className="mb-6 h-12 text-xs font-black uppercase w-full bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0" 
              value={block.label} 
              onChange={(e) => {
                const nb = [...descBlocks];
                nb[bIdx].label = e.target.value;
                setDescBlocks(nb);
              }} 
            />

            <div className="space-y-3">
              {block.rows.map((row, rIdx) => (
                <div key={rIdx} className="grid grid-cols-12 gap-3 items-center group">
                  <Input 
                    className="col-span-5 h-11 text-xs font-bold border-2 border-slate-100 rounded-xl bg-slate-50/50 group-hover:bg-white transition-all" 
                    value={row.name} 
                    onChange={(e) => {
                      const nb = [...descBlocks];
                      nb[bIdx].rows[rIdx].name = e.target.value;
                      setDescBlocks(nb);
                    }} 
                    placeholder="Specification Name" 
                  />
                  <Input 
                    className="col-span-6 h-11 text-xs font-medium border-2 border-slate-200 rounded-xl focus:border-blue-500" 
                    value={row.value} 
                    onChange={(e) => {
                      const nb = [...descBlocks];
                      nb[bIdx].rows[rIdx].value = e.target.value;
                      setDescBlocks(nb);
                    }} 
                    placeholder="Enter Value" 
                  />
                  <button 
                    onClick={() => {
                      const nb = [...descBlocks];
                      nb[bIdx].rows = nb[bIdx].rows.filter((_, i) => i !== rIdx);
                      setDescBlocks(nb);
                    }} 
                    className="col-span-1 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-5 h-5 text-slate-400 hover:text-red-500" />
                  </button>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs font-bold border-2 border-dashed border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl h-11" 
                onClick={() => {
                  const nb = [...descBlocks];
                  nb[bIdx].rows.push({ name: "", value: "" });
                  setDescBlocks(nb);
                }}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Spec Row
              </Button>
            </div>
          </div>
        ))}

        <Button 
          variant="outline" 
          className="w-full h-14 border-dashed border-4 border-slate-200 rounded-2xl font-black text-slate-400 hover:text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
          onClick={() => setDescBlocks([...descBlocks, { id: Date.now(), label: "NEW SECTION", rows: [{ name: "", value: "" }] }])}
        >
          + Add New Specification Block
        </Button>
      </div>
    </div>
  );
}