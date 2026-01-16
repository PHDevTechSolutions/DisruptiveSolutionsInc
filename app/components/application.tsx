"use client";

import React, { useMemo } from "react";
import { ChevronDown, Minus } from "lucide-react";

interface FilterProps {
  products: any[];
  productCount: number;
  filters: any;
  setFilters: (val: any) => void;
  activeView?: string;
}

// ALISIN YUNG APPLICATIONPROPS DITO DAHIL PARA SA APPLICATION.TSX LANG YUN

export default function ProductFilter({ products, productCount, filters, setFilters, activeView }: FilterProps) {
  
  const dynamicOptions = useMemo(() => {
    const getUniqueValues = (field: string) => {
      const allValues = new Set<string>();
      
      products.forEach((product) => {
        // --- LOGIC PARA SA APPLICATION MULA SA DYNAMICSPECS ---
        if (field === "application") {
          product.dynamicSpecs?.forEach((spec: any) => {
            if (spec.title?.toUpperCase() === "APPLICATION") {
              if (spec.value) allValues.add(spec.value.trim());
            }
          });
        }

        // --- LOGIC PARA SA IBANG TECHNICAL SPECS ---
        let val = product[field];
        if (!val && product.technicalSpecs) {
          product.technicalSpecs.forEach((spec: any) => {
            const foundRow = spec.rows?.find((r: any) => 
              r.name.toLowerCase() === field.toLowerCase() || 
              (field === "power" && r.name.toLowerCase() === "wattage")
            );
            if (foundRow) val = foundRow.value;
          });
        }

        if (Array.isArray(val)) {
          val.forEach(v => v && allValues.add(v.toString().trim()));
        } else if (val && field !== "application") {
          allValues.add(val.toString().trim());
        }
      });

      return Array.from(allValues).sort((a, b) => 
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
      );
    };

    return {
      application: getUniqueValues("application"),
      mountingType: getUniqueValues("mountingType"),
      colour: getUniqueValues("colour"),
      lightDistribution: getUniqueValues("lightDistribution"),
      lampType: getUniqueValues("lampType"),
      lampColour: getUniqueValues("lampColour"),
      power: getUniqueValues("power"),
      connection: getUniqueValues("connection"),
    };
  }, [products]);

  const categories = [
    { label: "Application:", name: "application" },
    { label: "Mounting type:", name: "mountingType" },
    { label: "Colour:", name: "colour" },
    { label: "Light distribution:", name: "lightDistribution" },
    { label: "Lamp type:", name: "lampType" },
    { label: "Lamp colour:", name: "lampColour" },
    { label: "Power per lamp:", name: "power" },
    { label: "Electrical connection:", name: "connection" },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-[15px] p-4 sticky top-28 shadow-sm h-fit">
      <div className="flex items-center justify-between border-b border-gray-50 pb-2 mb-3">
        <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-800 italic">
          FILTER / <span className={Object.values(filters).some(v => v !== "*" && v !== "") ? "text-[#d11a2a]" : "text-gray-300"}>
            {Object.values(filters).some(v => v !== "*" && v !== "") ? "ON" : "OFF"}
          </span>
        </h2>
        <Minus size={10} className="text-gray-300" />
      </div>

      <div className="space-y-3">
        {categories.map((cat) => {
          // AUTO-HIDE LOGIC
          if (cat.name === "application" && activeView === "APPLICATIONS") return null;

          const options = dynamicOptions[cat.name as keyof typeof dynamicOptions] || [];
          const isActive = filters[cat.name] !== "*" && filters[cat.name] !== "";

          return (
            <div key={cat.name} className="space-y-1">
              <label className={`text-[7.5px] font-black uppercase tracking-widest ${isActive ? "text-[#d11a2a]" : "text-gray-400"}`}>
                {cat.label}
              </label>
              <div className="relative">
                <select
                  name={cat.name}
                  value={filters[cat.name] || "*"}
                  onChange={(e) => setFilters({ ...filters, [cat.name]: e.target.value })}
                  className={`w-full bg-[#fcfcfc] border text-[8.5px] font-bold py-1.5 px-2.5 rounded-md appearance-none focus:outline-none transition-all cursor-pointer ${
                    isActive ? "border-[#d11a2a] bg-white text-[#d11a2a]" : "border-gray-100 text-gray-500"
                  }`}
                >
                  <option value="*">*</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown size={10} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${isActive ? "text-[#d11a2a]" : "text-gray-400"}`} />
              </div>
            </div>
          );
        })}

        <div className="space-y-1 pt-1">
          <label className="text-[7.5px] font-black text-gray-400 uppercase tracking-widest">Luminous Flux:</label>
          <div className="flex items-center gap-1">
            <input 
              type="text" placeholder="Min" 
              className="w-full bg-[#fcfcfc] border border-gray-100 text-[8.5px] font-bold py-1.5 px-2 rounded-md focus:border-[#d11a2a] outline-none"
              value={filters.fluxFrom || ""}
              onChange={(e) => setFilters({...filters, fluxFrom: e.target.value})}
            />
            <span className="text-gray-300 text-[8px]">-</span>
            <input 
              type="text" placeholder="Max" 
              className="w-full bg-[#fcfcfc] border border-gray-100 text-[8.5px] font-bold py-1.5 px-2 rounded-md focus:border-[#d11a2a] outline-none"
              value={filters.fluxTo || ""}
              onChange={(e) => setFilters({...filters, fluxTo: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-gray-50">
        <div className="flex items-center justify-between mb-3">
           <p className="text-[10px] font-black text-gray-900 italic">
            {productCount} <span className="font-medium text-gray-400 not-italic text-[8px] uppercase">Results</span>
          </p>
          <button 
            onClick={() => setFilters({
              application: "*", mountingType: "*", colour: "*", lightDistribution: "*", 
              lampType: "*", lampColour: "*", power: "*", connection: "*", fluxFrom: "", fluxTo: ""
            })}
            className="text-[8px] font-black uppercase text-gray-300 hover:text-[#d11a2a] transition-colors"
          >
            RESET
          </button>
        </div>
      </div>
    </div>
  );
}