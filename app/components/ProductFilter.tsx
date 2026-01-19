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

export default function ProductFilter({
  products,
  productCount,
  filters,
  setFilters,
  activeView,
}: FilterProps) {
  const dynamicFilterData = useMemo(() => {
    const filterGroups: { [key: string]: Set<string> } = {};

    products.forEach((product) => {
      product.dynamicSpecs?.forEach((spec: any) => {
        const title = spec.title?.trim();
        if (title && spec.value) {
          if (!filterGroups[title]) filterGroups[title] = new Set();
          filterGroups[title].add(spec.value.toString());
        }
      });

      product.technicalSpecs?.forEach((group: any) => {
        group.rows?.forEach((row: any) => {
          const name = row.name?.trim();
          if (name && row.value) {
            if (!filterGroups[name]) filterGroups[name] = new Set();
            filterGroups[name].add(row.value.toString());
          }
        });
      });
    });

    const finalData: { [key: string]: string[] } = {};
    Object.keys(filterGroups).forEach((key) => {
      finalData[key] = Array.from(filterGroups[key]).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      );
    });

    return finalData;
  }, [products]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const filterNames = Object.keys(dynamicFilterData)
    .sort()
    .filter((name) => {
      if (activeView === "APPLICATIONS" && name.toUpperCase() === "APPLICATION") {
        return false;
      }
      return true;
    });

  return (
    // Tinanggal ang max-height at overflow. Ginawang mas maliit ang padding (p-5 sa mobile, p-6 sa desktop).
    <div className="bg-white border border-gray-100 rounded-[24px] p-5 md:p-6 sticky top-28 shadow-sm h-auto">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
        <div className="flex flex-col">
          <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] text-gray-900">
            Filters /{" "}
            <span
              className={
                Object.values(filters).some((v) => v !== "*" && v !== "")
                  ? "text-[#d11a2a]"
                  : "text-gray-300"
              }
            >
              {Object.values(filters).some((v) => v !== "*" && v !== "") ? "On" : "Off"}
            </span>
          </h2>
          <span className="text-[8px] font-bold text-gray-400 uppercase italic">
            {activeView}
          </span>
        </div>
        <Minus size={14} className="text-gray-300" />
      </div>

      <div className="space-y-4">
        {filterNames.map((name) => (
          <div key={name} className="space-y-1">
            <label className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-tight">
              {name}:
            </label>
            <div className="relative">
              <select
                name={name}
                value={filters[name] || "*"}
                onChange={handleSelectChange}
                // Mas maliit na padding at text size (text-[10px])
                className="w-full bg-gray-50 border border-gray-100 text-[10px] font-bold py-1.5 px-3 rounded-md appearance-none focus:outline-none focus:border-[#d11a2a] transition-all cursor-pointer uppercase"
              >
                <option value="*">* ALL</option>
                {dynamicFilterData[name].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-[12px] md:text-[13px] font-black text-gray-900 mb-4 italic">
          {productCount.toLocaleString()}{" "}
          <span className="font-normal text-gray-400 not-italic text-[10px]">
            items
          </span>
        </p>

        <button
          onClick={() => setFilters({})}
          className="flex items-center text-[9px] font-black uppercase text-gray-400 hover:text-[#d11a2a] transition-colors group"
        >
          <span className="mr-2 text-[7px] group-hover:translate-x-1 transition-transform">
            ▶
          </span>{" "}
          Reset
        </button>
      </div>
    </div>
  );
}