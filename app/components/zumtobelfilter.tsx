"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, Minus, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterProps {
  products: any[];
  productCount: number;
  filters: any;
  setFilters: (val: any) => void;
  activeView?: string;
}

export default function ProductFilter({
  products,
  productCount,
  filters,
  setFilters,
  activeView,
}: FilterProps) {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // --- OPTIMIZED FILTER EXTRACTION ---
  const dynamicFilterData = useMemo(() => {
    const filterGroups: { [key: string]: Set<string> } = {};

    products.forEach((product) => {
      // 1. Mula sa Dynamic Specs (e.g. Color, Mounting, etc.)
      product.dynamicSpecs?.forEach((spec: any) => {
        const title = spec.title?.trim();
        if (title && spec.value) {
          if (!filterGroups[title]) filterGroups[title] = new Set();
          filterGroups[title].add(spec.value.toString().trim());
        }
      });

      // 2. Mula sa Technical Specs (Support for .specs OR .rows)
      product.technicalSpecs?.forEach((group: any) => {
        // Sinisiguro natin na mababasa nito kahit 'specs' o 'rows' ang tawag sa array
        const specRows = group.specs || group.rows || [];
        
        specRows.forEach((row: any) => {
          const name = (row.name || row.label)?.trim();
          const val = row.value?.toString().trim();
          
          if (name && val && val !== "—" && val !== "") {
            if (!filterGroups[name]) filterGroups[name] = new Set();
            filterGroups[name].add(val);
          }
        });
      });
    });

    // I-convert ang Sets sa Sorted Arrays
    const finalData: { [key: string]: string[] } = {};
    Object.keys(filterGroups).forEach((key) => {
      finalData[key] = Array.from(filterGroups[key]).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
      );
    });

    return finalData;
  }, [products]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Kung "*" ang pinili, tanggalin ang filter key para hindi mag-conflict
    const newFilters = { ...filters };
    if (value === "*") {
      delete newFilters[name];
    } else {
      newFilters[name] = value;
    }
    setFilters(newFilters);
  };

  // Listahan ng mga ayaw nating ipakita sa sidebar filters
  const filterNames = Object.keys(dynamicFilterData)
    .sort()
    .filter((name) => {
      const excluded = [
        "BRAND", "WEBSITE", "CREATEDAT", "ID", "MAINIMAGE", 
        "NAME", "RATING", "REVIEWCOUNT", "SLUG", "IMAGEURL", "DESCRIPTION"
      ];
      if (excluded.includes(name.toUpperCase())) return false;
      
      // Itago ang Application filter kung nasa Application view na tayo
      if (activeView === "APPLICATIONS" && name.toUpperCase() === "APPLICATION") return false;
      
      return true;
    });

  const activeFiltersCount = Object.keys(filters).length;

  return (
    <>
      {/* --- MOBILE TOGGLE --- */}
      <div className="md:hidden fixed bottom-6 right-6 z-[60]">
        <button
          onClick={() => setIsOpenMobile(true)}
          className="bg-[#d11a2a] text-white p-4 rounded-full shadow-2xl flex items-center gap-2"
        >
          <Filter size={20} />
          {activeFiltersCount > 0 && (
            <span className="bg-white text-[#d11a2a] text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* --- MOBILE OVERLAY --- */}
      <AnimatePresence>
        {isOpenMobile && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpenMobile(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-[32px] p-6 z-[101] max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black uppercase italic tracking-widest">Filter Specs</h3>
                <button onClick={() => setIsOpenMobile(false)} className="p-2 bg-gray-100 rounded-full"><X size={18}/></button>
              </div>
              <FilterContent 
                filterNames={filterNames} filters={filters} 
                dynamicFilterData={dynamicFilterData} handleSelectChange={handleSelectChange}
                productCount={productCount} setFilters={setFilters} activeView={activeView}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- DESKTOP SIDEBAR --- */}
      <div className="hidden md:block bg-white border border-gray-100 rounded-[24px] p-6 sticky top-28 shadow-sm max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar">
        <FilterContent 
          filterNames={filterNames} filters={filters} 
          dynamicFilterData={dynamicFilterData} handleSelectChange={handleSelectChange}
          productCount={productCount} setFilters={setFilters} activeView={activeView}
        />
      </div>
    </>
  );
}

// --- SUB-COMPONENT PARA SA REUSABLE CONTENT ---
function FilterContent({ filterNames, filters, dynamicFilterData, handleSelectChange, productCount, setFilters, activeView }: any) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-6">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Filter By</h2>
          <span className="text-[12px] font-black text-black uppercase italic">{activeView}</span>
        </div>
        <button 
           onClick={() => setFilters({})}
           className="text-[9px] font-bold text-gray-300 hover:text-[#d11a2a] uppercase transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="space-y-5">
        {filterNames.length > 0 ? (
          filterNames.map((name: string) => (
            <div key={name} className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-tight ml-1">
                {name}
              </label>
              <div className="relative">
                <select
                  name={name}
                  value={filters[name] || "*"}
                  onChange={handleSelectChange}
                  className={`w-full border text-[10px] font-bold py-2.5 px-3 rounded-xl appearance-none outline-none transition-all uppercase truncate
                    ${filters[name] ? "bg-[#d11a2a]/5 border-[#d11a2a] text-[#d11a2a]" : "bg-gray-50 border-gray-100 text-gray-900"}
                  `}
                >
                  <option value="*">All {name}</option>
                  {dynamicFilterData[name].map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown size={12} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${filters[name] ? "text-[#d11a2a]" : "text-gray-400"}`} />
              </div>
            </div>
          ))
        ) : (
          <p className="text-[10px] text-gray-400 italic">No specifications available</p>
        )}
      </div>

      <div className="mt-10 pt-5 border-t border-gray-100">
        <p className="text-[11px] font-black text-gray-900 mb-1 uppercase">
          {productCount} <span className="text-gray-400 font-bold ml-1">Products Found</span>
        </p>
        {Object.keys(filters).length > 0 && (
          <button
            onClick={() => setFilters({})}
            className="text-[10px] font-black uppercase text-[#d11a2a] hover:underline"
          >
            Reset All Filters
          </button>
        )}
      </div>
    </div>
  );
}