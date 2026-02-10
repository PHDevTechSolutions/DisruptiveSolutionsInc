"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Trash2, 
  Plus, 
  LayoutList, 
  Save,
  Layers,
  RefreshCcw
} from "lucide-react";

// --- INTERFACES ---
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
  const [descBlocks, setDescBlocks] = useState<SpecBlock[]>([
    { id: Date.now(), label: "TECHNICAL SPECIFICATIONS", rows: [{ name: "", value: "" }] }
  ]);
  
  const isInitialLoad = useRef(true);

  // --- 1. FETCH CATEGORIES FROM FIREBASE ---
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "categories"), (snap) => {
      setCategories(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
    });
    return () => unsub();
  }, []);

  // --- 2. LOAD SAVED STRUCTURE & VALUES PER CATEGORY ---
  useEffect(() => {
    const loadCategoryStructure = async () => {
      if (!selectedCategory) return;
      isInitialLoad.current = true;

      try {
        const docRef = doc(db, "spec_templates", selectedCategory);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const savedData = docSnap.data();
          
          // Check kung may 'blocks' field sa saved data
          if (savedData && Array.isArray(savedData.blocks)) {
            const templateBlocks = savedData.blocks.map((block: any) => ({
              id: Date.now() + Math.random(),
              label: block.label || "UNLABELED BLOCK",
              // DITO ANG PINAKAMAHALAGA: Kinukuha na natin ang saved name AT value
              rows: Array.isArray(block.rows) 
                ? block.rows.map((r: any) => ({ 
                    name: r.name || "", 
                    value: r.value || "" // Papasok na dito yung value na sinave mo
                  }))
                : [{ name: "", value: "" }]
            }));

            setDescBlocks(templateBlocks);
            toast.success(`Template & Values for ${selectedCategory} loaded!`);
          } else {
            handleResetToDefault();
          }
        } else {
          handleResetToDefault();
        }
      } catch (error) {
        console.error("Error loading structure:", error);
        toast.error("Failed to load layout.");
      } finally {
        // Sandaling delay para hindi mag-trigger ang auto-save logic agad
        setTimeout(() => { isInitialLoad.current = false; }, 500);
      }
    };

    const handleResetToDefault = () => {
      setDescBlocks([{ 
        id: Date.now(), 
        label: "TECHNICAL SPECIFICATIONS", 
        rows: [{ name: "", value: "" }] 
      }]);
    };

    loadCategoryStructure();
  }, [selectedCategory]);

  // --- 3. SAVE CURRENT STRUCTURE & VALUES AS MASTER TEMPLATE ---
  const saveSpecStructure = async () => {
    if (!selectedCategory) return toast.error("Please select a category first!");

    try {
      // I-format ang data: Isasama ang labels at ang buong rows (name + value)
      const structureToSave = descBlocks.map(block => ({
        label: block.label,
        rows: block.rows.filter(r => r.name.trim() !== "") // Save name and value
      }));

      await setDoc(doc(db, "spec_templates", selectedCategory), {
        category: selectedCategory,
        blocks: structureToSave,
        updatedAt: serverTimestamp()
      });

      toast.success(`Specs with Values for ${selectedCategory} saved successfully!`);
    } catch (e) {
      toast.error("Failed to save spec layout");
      console.error(e);
    }
  };

  // --- 4. OPTIONAL: CLEAR ONLY VALUES (Maintains structure) ---
  const clearValuesOnly = () => {
    const cleared = descBlocks.map(block => ({
      ...block,
      rows: block.rows.map(row => ({ ...row, value: "" }))
    }));
    setDescBlocks(cleared);
    toast.info("Values cleared, structure remains.");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      
      {/* 1. CATEGORY SELECTOR & ACTIONS */}
      <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 space-y-2 w-full">
          <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
            <LayoutList className="w-4 h-4" /> Select Category
          </label>
          <select 
            className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-700 transition-all bg-slate-50"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">-- Choose Category --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={clearValuesOnly}
            disabled={!selectedCategory}
            className="h-12 px-4 border-2 border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50"
            title="Clear all values but keep names"
          >
            <RefreshCcw className="w-5 h-5" />
          </Button>
          
          <Button 
            onClick={saveSpecStructure}
            disabled={!selectedCategory}
            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 flex items-center gap-2 transition-all active:scale-95"
          >
            <Save className="w-5 h-5" />
            SAVE SPECS LAYOUT
          </Button>
        </div>
      </div>

      {/* 2. DYNAMIC SPECIFICATION BLOCKS */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
          <Layers className="w-6 h-6 text-blue-500" /> PRODUCT SPECIFICATIONS
        </h2>

        {descBlocks.map((block, bIdx) => (
          <div key={block.id} className="p-6 border-2 border-slate-200 rounded-2xl bg-white shadow-sm hover:border-blue-300 transition-all relative animate-in fade-in slide-in-from-top-4">
            
            {/* Block Label Input */}
            <div className="flex gap-4 mb-6">
              <Input 
                className="h-12 text-xs font-black uppercase flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500" 
                value={block.label} 
                placeholder="BLOCK TITLE (e.g. PHYSICAL SPECS)"
                onChange={(e) => {
                  const nb = [...descBlocks];
                  nb[bIdx].label = e.target.value;
                  setDescBlocks(nb);
                }} 
              />
              <Button 
                variant="ghost" 
                size="icon"
                className="text-slate-300 hover:text-red-500 h-12 w-12"
                onClick={() => setDescBlocks(descBlocks.filter((_, i) => i !== bIdx))}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Rows Mapping */}
            <div className="space-y-3">
              {block.rows.map((row, rIdx) => (
                <div key={rIdx} className="grid grid-cols-12 gap-3 items-center group/row">
                  <Input 
                    className="col-span-5 h-11 text-xs font-bold border-2 border-slate-100 rounded-xl bg-slate-50/50 group-hover/row:bg-white transition-all" 
                    value={row.name} 
                    onChange={(e) => {
                      const nb = [...descBlocks];
                      nb[bIdx].rows[rIdx].name = e.target.value;
                      setDescBlocks(nb);
                    }} 
                    placeholder="Spec Name" 
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
                    className="col-span-1 flex justify-center items-center opacity-0 group-hover/row:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-slate-300 hover:text-red-500" />
                  </button>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs font-bold border-2 border-dashed border-blue-100 text-blue-500 hover:bg-blue-50 rounded-xl h-11 mt-2" 
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
          className="w-full h-16 border-dashed border-4 border-slate-100 rounded-2xl font-black text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-all uppercase tracking-widest text-[10px]"
          onClick={() => setDescBlocks([...descBlocks, { id: Date.now(), label: "", rows: [{ name: "", value: "" }] }])}
        >
          <Plus className="w-5 h-5 mr-2" /> Add New Specification Block
        </Button>
      </div>
    </div>
  );
}