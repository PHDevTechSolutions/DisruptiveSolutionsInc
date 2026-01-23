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

  // --- UNIFIED LOGIC PARA SA LIT AT ZUMTOBEL ---
  const dynamicFilterData = useMemo(() => {
    const filterGroups: { [key: string]: Set<string> } = {};

    products.forEach((product) => {
      // 1. Kunin ang values mula sa Dynamic Specs (Category, Application, etc.)
      product.dynamicSpecs?.forEach((spec: any) => {
        const title = spec.title?.trim();
        if (title && spec.value) {
          if (!filterGroups[title]) filterGroups[title] = new Set();
          filterGroups[title].add(spec.value.toString().trim());
        }
      });

      // 2. Kunin ang lahat ng rows mula sa Technical Specs 
      // Ito ang magpapakita ng Beam Angle para sa LIT o kaya UGR para sa Zumtobel
      product.technicalSpecs?.forEach((group: any) => {
        group.rows?.forEach((row: any) => {
          const name = row.name?.trim();
          if (name && row.value) {
            if (!filterGroups[name]) filterGroups[name] = new Set();
            filterGroups[name].add(row.value.toString().trim());
          }
        });
      });
    });

    const finalData: { [key: string]: string[] } = {};
    Object.keys(filterGroups).forEach((key) => {
      // Numeric sort para maayos ang pagkakasunod (e.g., 10W bago ang 100W)
      finalData[key] = Array.from(filterGroups[key]).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
      );
    });

    return finalData;
  }, [products]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Linisin ang listahan ng filters (itago ang mga metadata)
  const filterNames = Object.keys(dynamicFilterData)
    .sort()
    .filter((name) => {
      const hidden = ["BRAND", "WEBSITE", "CREATEDAT", "ID", "MAINIMAGE", "NAME", "RATING", "REVIEWCOUNT"];
      if (hidden.includes(name.toUpperCase())) return false;
      
      if (activeView === "APPLICATIONS" && name.toUpperCase() === "APPLICATION") {
        return false;
      }
      return true;
    });

  const activeFiltersCount = Object.values(filters).filter(v => v !== "*" && v !== "").length;

  return (
    <>
      {/* --- MOBILE VIEW --- */}
      <div className="md:hidden fixed bottom-6 right-6 z-[60]">
        <button
          onClick={() => setIsOpenMobile(true)}
          className="bg-black text-white p-4 rounded-full shadow-2xl flex items-center gap-2 border border-white/20"
        >
          <Filter size={20} />
          {activeFiltersCount > 0 && (
            <span className="bg-[#d11a2a] text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

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
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-[32px] p-6 z-[101] max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black uppercase italic tracking-widest">Specifications</h3>
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

      {/* --- DESKTOP VIEW --- */}
      <div className="hidden md:block bg-white border border-gray-100 rounded-[24px] p-6 sticky top-28 shadow-sm max-h-[calc(100vh-160px)] overflow-y-auto">
        <FilterContent 
          filterNames={filterNames} filters={filters} 
          dynamicFilterData={dynamicFilterData} handleSelectChange={handleSelectChange}
          productCount={productCount} setFilters={setFilters} activeView={activeView}
        />
      </div>
    </>
  );
}

function FilterContent({ filterNames, filters, dynamicFilterData, handleSelectChange, productCount, setFilters, activeView }: any) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-widest">Refine Search</h2>
          <span className="text-[8px] font-bold text-[#d11a2a] uppercase italic">{activeView}</span>
        </div>
        <Minus size={14} className="text-gray-300" />
      </div>

      <div className="space-y-4">
        {filterNames.map((name: string) => (
          <div key={name} className="space-y-1">
            <label className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{name}:</label>
            <div className="relative">
              <select
                name={name}
                value={filters[name] || "*"}
                onChange={handleSelectChange}
                className="w-full bg-gray-50 border border-gray-100 text-[10px] font-bold py-2 px-3 rounded-md appearance-none focus:border-[#d11a2a] outline-none transition-all uppercase truncate"
              >
                <option value="*">* SHOW ALL</option>
                {dynamicFilterData[name].map((opt: string) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-4 border-t border-gray-100">
        <p className="text-[12px] font-black text-gray-900 mb-2 italic">
          {productCount} <span className="font-normal text-gray-400 text-[10px] not-italic">Items Found</span>
        </p>
        <button
          onClick={() => setFilters({})}
          className="text-[9px] font-black uppercase text-gray-400 hover:text-[#d11a2a] transition-all"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
}