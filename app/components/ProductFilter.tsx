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
  
  // Dito natin "kakalap-in" lahat ng existing values mula sa iyong products
  const dynamicOptions = useMemo(() => {
    const getUniqueValues = (field: string) => {
      const allValues = new Set<string>();
      
      products.forEach((product) => {
        // 1. Check direct fields (e.g., product.application)
        let val = product[field];

        // 2. Check inside technicalSpecs if not found in direct fields
        // Ito ay para sa mga "Wattage", "Lumens", etc. na nasa loob ng rows array
        if (!val && product.technicalSpecs) {
            product.technicalSpecs.forEach((spec: any) => {
                const foundRow = spec.rows?.find((r: any) => r.name.toLowerCase() === field.toLowerCase());
                if (foundRow) val = foundRow.value;
            });
        }
        
        if (Array.isArray(val)) {
          val.forEach(v => v && allValues.add(v.toString().trim()));
        } else if (val && val !== "") {
          allValues.add(val.toString().trim());
        }
      });

      return Array.from(allValues).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    };

    return {
      application: getUniqueValues("application"),
      mountingType: getUniqueValues("mountingType"),
      colour: getUniqueValues("colour"),
      lightDistribution: getUniqueValues("lightDistribution"),
      lampType: getUniqueValues("lampType"),
      lampColour: getUniqueValues("lampColour"),
      power: getUniqueValues("power"), // Pwedeng "Wattage" sa DB mo
      connection: getUniqueValues("connection"),
    };
  }, [products]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

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
    <div className="bg-white border border-gray-100 rounded-3xl p-8 sticky top-28 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-6">
        <h2 className="text-[13px] font-black uppercase tracking-[0.15em] text-gray-900">
          Product Filter / <span className={Object.values(filters).some(v => v !== "*" && v !== "") ? "text-[#d11a2a]" : "text-gray-300"}>
            {Object.values(filters).some(v => v !== "*" && v !== "") ? "On" : "Off"}
          </span>
        </h2>
        <Minus size={16} className="text-gray-300" />
      </div>

      <div className="space-y-6">
        {categories.map((cat) => {
          const options = dynamicOptions[cat.name as keyof typeof dynamicOptions] || [];
          
          return (
            <div key={cat.name} className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {cat.label}
              </label>
              <div className="relative">
                <select
                  name={cat.name}
                  value={filters[cat.name] || "*"}
                  onChange={handleSelectChange}
                  className="w-full bg-gray-50 border border-gray-200 text-[11px] font-bold py-3 px-4 rounded-lg appearance-none focus:outline-none focus:border-[#d11a2a] focus:bg-white transition-all cursor-pointer"
                >
                  <option value="*">*</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          );
        })}

        {/* Luminous Flux Range */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Luminous Flux:
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              placeholder="from" 
              value={filters.fluxFrom || ""}
              className="w-full bg-gray-50 border border-gray-200 text-[11px] font-bold py-3 px-4 rounded-lg focus:outline-none focus:border-[#d11a2a] focus:bg-white transition-all"
              onChange={(e) => setFilters({...filters, fluxFrom: e.target.value})}
            />
            <span className="text-gray-400 text-xs">-</span>
            <input 
              type="number" 
              placeholder="to" 
              value={filters.fluxTo || ""}
              className="w-full bg-gray-50 border border-gray-200 text-[11px] font-bold py-3 px-4 rounded-lg focus:outline-none focus:border-[#d11a2a] focus:bg-white transition-all"
              onChange={(e) => setFilters({...filters, fluxTo: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-gray-100">
        <p className="text-[15px] font-black text-gray-900 mb-6 italic">
          {productCount.toLocaleString()} <span className="font-normal text-gray-400 not-italic">products found</span>
        </p>
        
        <div className="space-y-3">
          <button 
            onClick={() => setFilters({
              application: "*", mountingType: "*", colour: "*", lightDistribution: "*", 
              lampType: "*", lampColour: "*", power: "*", connection: "*", fluxFrom: "", fluxTo: ""
            })}
            className={`flex items-center text-[10px] font-black uppercase transition-all group ${Object.values(filters).some(v => v !== "*" && v !== "") ? "text-gray-900 hover:text-[#d11a2a]" : "text-gray-300 pointer-events-none"}`}
          >
            <span className="mr-3 text-[8px] group-hover:translate-x-1 transition-transform">▶</span> Reset filter
          </button>
        </div>
      </div>
    </div>
  );
}