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

  // --- LOGIC PARA SA LIT TECHNICAL SPECS ---
  const dynamicFilterData = useMemo(() => {
    const filterGroups: { [key: string]: Set<string> } = {};

    products.forEach((product) => {
      // 1. Kunin ang values mula sa Dynamic Specs (e.g. Category, Application)
      product.dynamicSpecs?.forEach((spec: any) => {
        const title = spec.title?.trim();
        if (title && spec.value) {
          if (!filterGroups[title]) filterGroups[title] = new Set();
          filterGroups[title].add(spec.value.toString().trim());
        }
      });

      // 2. Kunin ang specific rows mula sa Technical Specs (Dito galing ang LIT details)
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
      // Ginagamitan ng numeric sort para ang "10W" ay mauna sa "100W"
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

  // --- FILTER CLEANUP ---
  const filterNames = Object.keys(dynamicFilterData)
    .sort()
    .filter((name) => {
      // Wag ipakita ang mga system fields o redundand filters
      const hidden = ["BRAND", "WEBSITE", "CREATEDAT", "ID", "MAINIMAGE", "NAME"];
      if (hidden.includes(name.toUpperCase())) return false;
      
      // Itago ang Application filter kung nasa Application view na
      if (activeView === "APPLICATIONS" && name.toUpperCase() === "APPLICATION") {
        return false;
      }
      return true;
    });

  const activeFiltersCount = Object.values(filters).filter(v => v !== "*" && v !== "").length;

  return (
    <>
      {/* --- MOBILE FLOATING BUTTON --- */}
      <div className="md:hidden fixed bottom-6 right-6 z-[60]">
        <button
          onClick={() => setIsOpenMobile(true)}
          className="bg-black text-white p-4 rounded-full shadow-2xl flex items-center gap-2 border border-white/20 active:scale-95 transition-all"
        >
          <Filter size={20} />
          {activeFiltersCount > 0 && (
            <span className="bg-[#d11a2a] text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* --- MOBILE DRAWER --- */}
      <AnimatePresence>
        {isOpenMobile && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpenMobile(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-[32px] p-6 z-[101] md:hidden max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Filter LIT Products</h3>
                <button onClick={() => setIsOpenMobile(false)} className="p-2 bg-gray-100 rounded-full"><X size={18}/></button>
              </div>
              <FilterContent 
                filterNames={filterNames} 
                filters={filters} 
                dynamicFilterData={dynamicFilterData} 
                handleSelectChange={handleSelectChange}
                productCount={productCount}
                setFilters={setFilters}
                activeView={activeView}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- DESKTOP STICKY VERSION --- */}
      <div className="hidden md:block bg-white border border-gray-100 rounded-[24px] p-6 sticky top-28 shadow-sm h-auto max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
        <FilterContent 
          filterNames={filterNames} 
          filters={filters} 
          dynamicFilterData={dynamicFilterData} 
          handleSelectChange={handleSelectChange}
          productCount={productCount}
          setFilters={setFilters}
          activeView={activeView}
        />
      </div>
    </>
  );
}

// Reusable Filter Content Component
function FilterContent({ filterNames, filters, dynamicFilterData, handleSelectChange, productCount, setFilters, activeView }: any) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
        <div className="flex flex-col">
          <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] text-gray-900">
            Specifications /{" "}
            <span className={Object.values(filters).some((v) => v !== "*" && v !== "") ? "text-[#d11a2a]" : "text-gray-300"}>
              {Object.values(filters).some((v) => v !== "*" && v !== "") ? "Active" : "All"}
            </span>
          </h2>
          <span className="text-[8px] font-bold text-gray-400 uppercase italic">
            Refining {activeView}
          </span>
        </div>
        <Minus size={14} className="text-gray-300" />
      </div>

      <div className="space-y-4">
        {filterNames.length > 0 ? (
          filterNames.map((name: string) => (
            <div key={name} className="space-y-1">
              <label className="text-[8px] md:text-[9px] font-bold text-gray-500 uppercase tracking-tight">
                {name}:
              </label>
              <div className="relative">
                <select
                  name={name}
                  value={filters[name] || "*"}
                  onChange={handleSelectChange}
                  className="w-full bg-gray-50 border border-gray-100 text-[11px] md:text-[10px] font-bold py-2.5 md:py-1.5 px-3 rounded-md appearance-none focus:outline-none focus:border-[#d11a2a] focus:ring-1 focus:ring-[#d11a2a]/10 transition-all cursor-pointer uppercase truncate pr-8"
                >
                  <option value="*">* SHOW ALL</option>
                  {dynamicFilterData[name].map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          ))
        ) : (
          <p className="text-[9px] text-gray-400 italic">No specs found for these products.</p>
        )}
      </div>

      <div className="mt-8 md:mt-6 pt-4 border-t border-gray-100">
        <p className="text-[12px] md:text-[13px] font-black text-gray-900 mb-4 italic">
          {productCount.toLocaleString()}{" "}
          <span className="font-normal text-gray-400 not-italic text-[10px]">LIT matches</span>
        </p>

        <button
          onClick={() => setFilters({
            application: "*",
            mountingType: "*",
            colour: "*",
            lightDistribution: "*",
            lampType: "*",
            lampColour: "*",
            power: "*",
            connection: "*",
            fluxFrom: "",
            fluxTo: ""
          })}
          className="flex items-center text-[9px] font-black uppercase text-gray-400 hover:text-[#d11a2a] transition-colors group w-full py-2"
        >
          <span className="mr-2 text-[7px] group-hover:translate-x-1 transition-transform">▶</span>
          Reset Technical Filters
        </button>
      </div>
    </div>
  );
}