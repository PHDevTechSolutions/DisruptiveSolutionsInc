"use client";

import React, { useMemo } from "react";
import { ChevronDown, Minus } from "lucide-react";

interface FilterProps {
  products: any[];
  productCount: number;
  filters: any;
  setFilters: (val: any) => void;
}

export default function ProductFilter({ products, productCount, filters, setFilters }: FilterProps) {
  
  // 1. DYNAMIC OPTIONS GENERATOR
  // Kinukuha nito lahat ng unique values mula sa database para sa dropdowns
  const dynamicOptions = useMemo(() => {
    const getUniqueValues = (field: string) => {
      const allValues = new Set<string>();
      
      products.forEach((product) => {
        // Check direct field muna
        let val = product[field];

        // Check sa loob ng technicalSpecs if direct field is empty
        if (!val && product.technicalSpecs) {
          product.technicalSpecs.forEach((spec: any) => {
            const foundRow = spec.rows?.find((r: any) => 
              r.name.toLowerCase() === field.toLowerCase() || 
              (field === "power" && r.name.toLowerCase() === "wattage")
            );
            if (foundRow) val = foundRow.value;
          });
        }

        // I-handle kung array or string ang nakuha
        if (Array.isArray(val)) {
          val.forEach(v => v && allValues.add(v.toString().trim()));
        } else if (val) {
          allValues.add(val.toString().trim());
        }
      });

      // Sort alphabetically and numerically (e.g., 9W, 10W, 18W)
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

  // 2. FILTER CATEGORIES CONFIG
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
    <div className="bg-white border border-gray-100 rounded-3xl p-8 sticky top-28 shadow-sm h-fit">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-6">
        <h2 className="text-[13px] font-black uppercase tracking-[0.15em] text-gray-900">
          Product Filter / <span className={Object.values(filters).some(v => v !== "*" && v !== "") ? "text-[#d11a2a]" : "text-gray-300"}>
            {Object.values(filters).some(v => v !== "*" && v !== "") ? "On" : "Off"}
          </span>
        </h2>
        <Minus size={16} className="text-gray-300" />
      </div>

      {/* DROPDOWNS SECTION */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const options = dynamicOptions[cat.name as keyof typeof dynamicOptions] || [];
          const isActive = filters[cat.name] !== "*" && filters[cat.name] !== "";

          return (
            <div key={cat.name} className="space-y-2">
              <label className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isActive ? "text-[#d11a2a]" : "text-gray-400"}`}>
                {cat.label}
              </label>
              <div className="relative">
                <select
                  name={cat.name}
                  value={filters[cat.name] || "*"}
                  onChange={(e) => setFilters({ ...filters, [cat.name]: e.target.value })}
                  className={`w-full bg-gray-50 border text-[11px] font-bold py-3 px-4 rounded-lg appearance-none focus:outline-none transition-all cursor-pointer ${
                    isActive ? "border-[#d11a2a] bg-white" : "border-gray-200"
                  }`}
                >
                  <option value="*">*</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isActive ? "text-[#d11a2a]" : "text-gray-400"}`} />
              </div>
            </div>
          );
        })}

        {/* LUMINOUS FLUX RANGE */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Luminous Flux:
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="from" 
              className="w-full bg-gray-50 border border-gray-200 text-[11px] font-bold py-3 px-4 rounded-lg focus:outline-none focus:border-[#d11a2a] transition-all"
              value={filters.fluxFrom || ""}
              onChange={(e) => setFilters({...filters, fluxFrom: e.target.value})}
            />
            <span className="text-gray-400 text-xs">-</span>
            <input 
              type="text" 
              placeholder="to" 
              className="w-full bg-gray-50 border border-gray-200 text-[11px] font-bold py-3 px-4 rounded-lg focus:outline-none focus:border-[#d11a2a] transition-all"
              value={filters.fluxTo || ""}
              onChange={(e) => setFilters({...filters, fluxTo: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* FOOTER & RESET */}
      <div className="mt-10 pt-8 border-t border-gray-100">
        <p className="text-[15px] font-black text-gray-900 mb-6 italic">
          {productCount.toLocaleString()} <span className="font-normal text-gray-400 not-italic lowercase">products found</span>
        </p>
        
        <button 
          onClick={() => setFilters({
            application: "*", mountingType: "*", colour: "*", lightDistribution: "*", 
            lampType: "*", lampColour: "*", power: "*", connection: "*", fluxFrom: "", fluxTo: ""
          })}
          className={`flex items-center text-[10px] font-black uppercase transition-all group ${
            Object.values(filters).some(v => v !== "*" && v !== "") 
            ? "text-gray-900 hover:text-[#d11a2a]" 
            : "text-gray-300 pointer-events-none"
          }`}
        >
          <span className="mr-3 text-[8px] group-hover:translate-x-1 transition-transform">▶</span> Reset filter
        </button>
      </div>
    </div>
  );
}