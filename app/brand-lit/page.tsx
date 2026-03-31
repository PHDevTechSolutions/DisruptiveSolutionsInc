"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import Navbar from "../components/navigation/navbar";
import Footer from "../components/navigation/footer";
import Application from "../components/litfilter";
import ProductFilter from "../components/zumtobelfilter";
import Highlights from "../components/Highlights";
import {
  Loader2,
  X,
  Plus,
  Trash2,
  Check,
  Minus,
  Star,
  Search,
  ChevronDown,
} from "lucide-react";
import FloatingChatWidget from "../components/chat-widget";
import FloatingMenuWidget from "../components/menu-widget";

// --- INTERFACES ---
interface FilterState {
  [key: string]: any;
}

const USAGE_GROUPS = ["INDOOR", "OUTDOOR", "SOLAR"] as const;
type UsageGroup = (typeof USAGE_GROUPS)[number];

const USAGE_GROUP_DESCRIPTIONS: Record<UsageGroup, string> = {
  INDOOR: "Interior lighting solutions for commercial and residential spaces",
  OUTDOOR: "Exterior luminaires built for harsh environments and public spaces",
  SOLAR:
    "Solar-powered lighting systems for off-grid and sustainable installations",
};

export default function BrandsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quoteCart, setQuoteCart] = useState<any[]>([]);

  // Two-level accordion state — CATEGORIES tab
  const [openUsageGroup, setOpenUsageGroup] = useState<UsageGroup | null>(null);
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  // Two-level accordion state — APPLICATIONS tab
  const [applicationDocs, setApplicationDocs] = useState<any[]>([]);
  const [openApplicationId, setOpenApplicationId] = useState<string | null>(
    null,
  );
  const [openAppFamilyId, setOpenAppFamilyId] = useState<string | null>(null);

  const [activeView, setActiveView] = useState("CATEGORIES");
  const [filters, setFilters] = useState<FilterState>({});
  const [searchQuery, setSearchQuery] = useState("");

  // --- FETCH CATEGORIES ---
  useEffect(() => {
    const q = query(
      collection(db, "productfamilies"),
      orderBy("createdAt", "desc"),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDbCategories(cats);
    });
    return () => unsubscribe();
  }, []);

  // --- FETCH PRODUCTS ---
  useEffect(() => {
    const q = query(
      collection(db, "products"),
      orderBy("createdAt", "desc"),
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  // --- FETCH APPLICATIONS ---
  useEffect(() => {
    const q = query(collection(db, "applications"), orderBy("title", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setApplicationDocs(docs);
    });
    return () => unsubscribe();
  }, []);

  // --- SYNC CART ---
  const syncCart = useCallback(() => {
    const savedCart = localStorage.getItem("disruptive_quote_cart");
    if (savedCart) {
      try {
        setQuoteCart(JSON.parse(savedCart));
      } catch (e) {
        console.error(e);
      }
    } else {
      setQuoteCart([]);
    }
  }, []);

  useEffect(() => {
    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("cartUpdated", syncCart);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("cartUpdated", syncCart);
    };
  }, [syncCart]);

  // --- FILTERED PRODUCTS ---
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name?.toLowerCase().includes(q);
        const matchesSKU =
          product.itemCode?.toLowerCase().includes(q) ||
          product.sku?.toLowerCase().includes(q);
        const matchesDescription = product.shortDescription
          ?.toLowerCase()
          .includes(q);
        const matchesSpecs = product.technicalSpecs?.some(
          (specGroup: any) =>
            specGroup.specs?.some(
              (spec: any) =>
                spec.name?.toLowerCase().includes(q) ||
                spec.value?.toLowerCase().includes(q),
            ) ||
            specGroup.rows?.some(
              (row: any) =>
                row.name?.toLowerCase().includes(q) ||
                row.value?.toLowerCase().includes(q),
            ),
        );
        const matchesDynamicSpecs = product.dynamicSpecs?.some(
          (spec: any) =>
            spec.title?.toLowerCase().includes(q) ||
            spec.value?.toLowerCase().includes(q),
        );
        if (
          !matchesName &&
          !matchesSKU &&
          !matchesDescription &&
          !matchesSpecs &&
          !matchesDynamicSpecs
        ) {
          return false;
        }
      }

      const activeEntries = Object.entries(filters).filter(
        ([key, value]) =>
          value !== "*" &&
          value !== "" &&
          key !== "fluxFrom" &&
          key !== "fluxTo",
      );
      for (const [key, filterValue] of activeEntries) {
        let hasMatch = product.dynamicSpecs?.some(
          (spec: any) =>
            spec.title?.toLowerCase() === key.toLowerCase() &&
            spec.value?.toLowerCase() === filterValue.toString().toLowerCase(),
        );
        if (!hasMatch && product.technicalSpecs) {
          product.technicalSpecs.forEach((specGroup: any) => {
            const rows = specGroup.specs || specGroup.rows || [];
            rows.forEach((spec: any) => {
              if (
                spec.name?.toLowerCase() === key.toLowerCase() &&
                spec.value
                  ?.toLowerCase()
                  .includes(filterValue.toString().toLowerCase())
              ) {
                hasMatch = true;
              }
            });
          });
        }
        if (!hasMatch) return false;
      }
      return true;
    });
  }, [products, filters, searchQuery]);

  // --- GROUP CATEGORIES BY productUsage ---
  const groupedCategories = useMemo(() => {
    const groups: Record<UsageGroup, any[]> = {
      INDOOR: [],
      OUTDOOR: [],
      SOLAR: [],
    };
    dbCategories.forEach((cat) => {
      const usages: string[] = cat.productUsage || [];
      usages.forEach((usage) => {
        const key = usage.trim().toUpperCase() as UsageGroup;
        if (groups[key] && !groups[key].find((c) => c.id === cat.id)) {
          groups[key].push(cat);
        }
      });
    });
    return groups;
  }, [dbCategories]);

  // --- GROUP productFamilies BY application ---
  // applicationDocs: [{id, title, ...}]
  // dbCategories each have: applications: string[] (array of application doc IDs)
  const groupedByApplication = useMemo(() => {
    // Map: applicationId -> { appDoc, families[] }
    const map: Record<string, { appDoc: any; families: any[] }> = {};
    applicationDocs.forEach((app) => {
      map[app.id] = { appDoc: app, families: [] };
    });
    dbCategories.forEach((cat) => {
      const appIds: string[] = cat.applications || [];
      appIds.forEach((appId) => {
        if (map[appId] && !map[appId].families.find((f) => f.id === cat.id)) {
          map[appId].families.push(cat);
        }
      });
    });
    // Return only entries that have at least one productFamily
    return Object.values(map).filter((entry) => entry.families.length > 0);
  }, [applicationDocs, dbCategories]);

  const categoryTitles = useMemo(
    () => dbCategories.map((c) => c.title?.trim().toUpperCase()),
    [dbCategories],
  );

  // Helper: products belonging to a category
  const getCategoryProducts = (category: any) =>
    filteredProducts.filter(
      (p) =>
        p.productFamily?.trim().toUpperCase() ===
          category.title?.trim().toUpperCase() ||
        p.dynamicSpecs?.some(
          (spec: any) =>
            spec.value?.trim().toUpperCase() ===
            category.title?.trim().toUpperCase(),
        ),
    );

  const addToQuote = (product: any) => {
    const currentCart = JSON.parse(
      localStorage.getItem("disruptive_quote_cart") || "[]",
    );
    if (!currentCart.find((item: any) => item.id === product.id)) {
      const updatedCart = [...currentCart, { ...product, quantity: 1 }];
      localStorage.setItem(
        "disruptive_quote_cart",
        JSON.stringify(updatedCart),
      );
      window.dispatchEvent(new Event("cartUpdated"));
      setIsCartOpen(true);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const updatedCart = quoteCart.map((item) => {
      if (item.id === productId) {
        const newQty = (item.quantity || 1) + delta;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    });
    setQuoteCart(updatedCart);
    localStorage.setItem("disruptive_quote_cart", JSON.stringify(updatedCart));
  };

  const removeFromQuote = (id: string) => {
    const updatedCart = quoteCart.filter((item: any) => item.id !== id);
    setQuoteCart(updatedCart);
    localStorage.setItem("disruptive_quote_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleUsageGroupToggle = (group: UsageGroup) => {
    if (openUsageGroup === group) {
      setOpenUsageGroup(null);
      setOpenCategoryId(null);
    } else {
      setOpenUsageGroup(group);
      setOpenCategoryId(null);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setOpenCategoryId(openCategoryId === categoryId ? null : categoryId);
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#d11a2a] selection:text-white overflow-x-hidden">
      <Navbar />
      <FloatingMenuWidget />

      {/* HERO */}
      <section className="relative h-[60vh] w-full flex items-center justify-center bg-black">
        <div className="absolute inset-0 opacity-40">
          <img
            src="/images/lit.png"
            className="w-full h-full object-cover"
            alt="LIT"
          />
        </div>
      </section>

      <section className="py-12 px-4 md:px-6 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-9 order-2 lg:order-1">
            {/* SEARCH BAR */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products by name, SKU, or specifications..."
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl text-sm font-bold placeholder:text-gray-400 focus:outline-none focus:border-[#d11a2a] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-all"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-500">
                    Found{" "}
                    <span className="text-[#d11a2a] font-black">
                      {filteredProducts.length}
                    </span>{" "}
                    products matching &ldquo;{searchQuery}&rdquo;
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs font-bold text-gray-400 hover:text-[#d11a2a] transition-colors"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>

            {/* TABS */}
            <div className="mb-8 flex items-center gap-4 border-b border-gray-100">
              {["CATEGORIES", "APPLICATIONS", "HIGHLIGHTS"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveView(tab)}
                  className={`px-6 py-4 text-[11px] font-black tracking-widest transition-all ${
                    activeView === tab
                      ? "border-b-2 border-[#d11a2a] text-gray-900"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#d11a2a]" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* ── CATEGORIES VIEW ── */}
                {activeView === "CATEGORIES" && (
                  <>
                    {USAGE_GROUPS.map((group) => {
                      const families = groupedCategories[group];
                      if (families.length === 0) return null;
                      const isGroupOpen = openUsageGroup === group;

                      return (
                        <div
                          key={group}
                          className="border border-gray-100 rounded-[24px] overflow-hidden"
                        >
                          {/* ── Top-level accordion: Usage Group ── */}
                          <button
                            onClick={() => handleUsageGroupToggle(group)}
                            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-all"
                          >
                            <div className="flex items-center gap-6">
                              {/* Enlarged group icon: 112px (w-28) */}
                              <div className="w-28 h-28 bg-white border rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0">
                                <img
                                  src={`/images/${group}.png`}
                                  alt={group}
                                  className="w-full h-full object-contain p-2"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              </div>
                              <div className="text-left">
                                <h3 className="font-black uppercase italic text-lg">
                                  {group}
                                </h3>
                                <p className="text-[10px] text-gray-400 font-medium mt-0.5 max-w-xs">
                                  {USAGE_GROUP_DESCRIPTIONS[group]}
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 mt-1">
                                  {families.length}{" "}
                                  {families.length === 1
                                    ? "FAMILY"
                                    : "FAMILIES"}
                                </p>
                              </div>
                            </div>
                            <motion.div
                              animate={{ rotate: isGroupOpen ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown
                                size={20}
                                className="text-gray-400"
                              />
                            </motion.div>
                          </button>

                          {/* ── Product Families: 4-col grid, no horizontal scroll ── */}
                          <AnimatePresence>
                            {isGroupOpen && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0 }}
                                className="overflow-hidden bg-[#fcfcfc]"
                              >
                                <div className="px-6 pt-4 pb-6 border-t border-gray-100">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {families.map((category) => {
                                      const isActive =
                                        openCategoryId === category.id;
                                      const count =
                                        getCategoryProducts(category).length;

                                      return (
                                        <button
                                          key={category.id}
                                          onClick={() =>
                                            handleCategoryToggle(category.id)
                                          }
                                          className={`flex flex-col items-center gap-3 py-5 px-3 rounded-2xl border transition-all duration-200 group ${
                                            isActive
                                              ? "border-[#d11a2a] bg-white shadow-md"
                                              : "border-transparent hover:border-gray-200 hover:bg-white"
                                          }`}
                                        >
                                          {/* Enlarged family image using imageUrl */}
                                          <div className="w-full aspect-square flex items-center justify-center overflow-hidden">
                                            {category.imageUrl ? (
                                              <img
                                                src={category.imageUrl}
                                                alt={category.title}
                                                className="w-full h-full object-contain"
                                              />
                                            ) : (
                                              <Star
                                                size={36}
                                                className="text-gray-200"
                                              />
                                            )}
                                          </div>

                                          <p
                                            className={`text-[9px] font-black uppercase italic text-center leading-tight transition-colors ${
                                              isActive
                                                ? "text-[#d11a2a]"
                                                : "text-gray-700 group-hover:text-gray-900"
                                            }`}
                                          >
                                            {category.title}
                                          </p>

                                          {count > 0 && (
                                            <span
                                              className={`text-[7px] font-bold px-2 py-0.5 rounded-full ${
                                                isActive
                                                  ? "bg-[#d11a2a] text-white"
                                                  : "bg-gray-100 text-gray-400"
                                              }`}
                                            >
                                              {count}
                                            </span>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {/* ── Expanded product grid for selected family ── */}
                                  <AnimatePresence>
                                    {openCategoryId &&
                                      families.find(
                                        (c) => c.id === openCategoryId,
                                      ) &&
                                      (() => {
                                        const sel = families.find(
                                          (c) => c.id === openCategoryId,
                                        );
                                        const catProducts =
                                          getCategoryProducts(sel);
                                        if (catProducts.length === 0)
                                          return null;

                                        return (
                                          <motion.div
                                            key={openCategoryId}
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{
                                              height: "auto",
                                              opacity: 1,
                                            }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                          >
                                            <div className="mt-6 pt-5 border-t border-gray-100">
                                              <p className="text-[10px] font-black uppercase italic text-gray-500 mb-4">
                                                {sel.title}{" "}
                                                <span className="text-[#d11a2a]">
                                                  — {catProducts.length}{" "}
                                                  products
                                                </span>
                                              </p>
                                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                {catProducts.map((product) => (
                                                  <ProductCard
                                                    key={product.id}
                                                    product={product}
                                                    addToQuote={addToQuote}
                                                    isInCart={quoteCart.some(
                                                      (i) =>
                                                        i.id === product.id,
                                                    )}
                                                  />
                                                ))}
                                              </div>
                                            </div>
                                          </motion.div>
                                        );
                                      })()}
                                  </AnimatePresence>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}

                    {/* ── Uncategorized ── */}
                    {(() => {
                      const uncategorized = filteredProducts.filter((p) => {
                        const matchesAny =
                          categoryTitles.includes(
                            p.productFamily?.trim().toUpperCase(),
                          ) ||
                          p.dynamicSpecs?.some((spec: any) =>
                            categoryTitles.includes(
                              spec.value?.trim().toUpperCase(),
                            ),
                          );
                        return !matchesAny;
                      });
                      if (uncategorized.length === 0) return null;
                      const isUncatOpen = openCategoryId === "uncategorized";

                      return (
                        <div className="border border-gray-100 rounded-[24px] overflow-hidden">
                          <button
                            onClick={() =>
                              setOpenCategoryId(
                                isUncatOpen ? null : "uncategorized",
                              )
                            }
                            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-all"
                          >
                            <div className="flex items-center gap-6">
                              <div className="w-28 h-28 bg-white border rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0">
                                <Star size={32} className="text-gray-200" />
                              </div>
                              <div className="text-left">
                                <h3 className="font-black uppercase italic text-lg">
                                  Other Products
                                </h3>
                                <p className="text-[10px] font-bold text-gray-400 mt-1">
                                  {uncategorized.length} PRODUCTS
                                </p>
                              </div>
                            </div>
                            <motion.div
                              animate={{ rotate: isUncatOpen ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown
                                size={20}
                                className="text-gray-400"
                              />
                            </motion.div>
                          </button>
                          <AnimatePresence>
                            {isUncatOpen && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0 }}
                                className="overflow-hidden bg-[#fcfcfc]"
                              >
                                <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                  {uncategorized.map((product) => (
                                    <ProductCard
                                      key={product.id}
                                      product={product}
                                      addToQuote={addToQuote}
                                      isInCart={quoteCart.some(
                                        (i) => i.id === product.id,
                                      )}
                                    />
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })()}
                  </>
                )}

                {activeView === "APPLICATIONS" && (
                  <>
                    {groupedByApplication.length === 0 ? (
                      <div className="text-center py-20">
                        <p className="text-lg font-bold text-gray-400 uppercase italic">
                          No applications found
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {groupedByApplication.map(({ appDoc, families }) => {
                          const isAppOpen = openApplicationId === appDoc.id;

                          return (
                            <div
                              key={appDoc.id}
                              className="border border-gray-100 rounded-[24px] overflow-hidden"
                            >
                              {/* Application accordion header */}
                              <button
                                onClick={() => {
                                  if (openApplicationId === appDoc.id) {
                                    setOpenApplicationId(null);
                                    setOpenAppFamilyId(null);
                                  } else {
                                    setOpenApplicationId(appDoc.id);
                                    setOpenAppFamilyId(null);
                                  }
                                }}
                                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-all"
                              >
                                <div className="flex items-center gap-6">
                                  <div className="w-28 h-28 bg-white border rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0">
                                    {appDoc.imageUrl ? (
                                      <img
                                        src={appDoc.imageUrl}
                                        alt={appDoc.title}
                                        className="w-full h-full object-contain p-2"
                                      />
                                    ) : (
                                      <Star
                                        size={32}
                                        className="text-gray-200"
                                      />
                                    )}
                                  </div>
                                  <div className="text-left">
                                    <h3 className="font-black uppercase italic text-lg">
                                      {appDoc.title}
                                    </h3>
                                    {appDoc.description && (
                                      <p className="text-[10px] text-gray-400 font-medium mt-0.5 max-w-xs">
                                        {appDoc.description}
                                      </p>
                                    )}
                                    <p className="text-[10px] font-bold text-gray-400 mt-1">
                                      {families.length}{" "}
                                      {families.length === 1
                                        ? "FAMILY"
                                        : "FAMILIES"}
                                    </p>
                                  </div>
                                </div>
                                <motion.div
                                  animate={{ rotate: isAppOpen ? 180 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronDown
                                    size={20}
                                    className="text-gray-400"
                                  />
                                </motion.div>
                              </button>

                              {/* Product families grid inside application */}
                              <AnimatePresence>
                                {isAppOpen && (
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: "auto" }}
                                    exit={{ height: 0 }}
                                    className="overflow-hidden bg-[#fcfcfc]"
                                  >
                                    <div className="px-6 pt-4 pb-6 border-t border-gray-100">
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {families.map((category) => {
                                          const isActive =
                                            openAppFamilyId === category.id;
                                          const catProducts =
                                            getCategoryProducts(category);

                                          return (
                                            <button
                                              key={category.id}
                                              onClick={() =>
                                                setOpenAppFamilyId(
                                                  openAppFamilyId ===
                                                    category.id
                                                    ? null
                                                    : category.id,
                                                )
                                              }
                                              className={`flex flex-col items-center gap-3 py-5 px-3 rounded-2xl border transition-all duration-200 group ${
                                                isActive
                                                  ? "border-[#d11a2a] bg-white shadow-md"
                                                  : "border-transparent hover:border-gray-200 hover:bg-white"
                                              }`}
                                            >
                                              <div className="w-full aspect-square flex items-center justify-center overflow-hidden">
                                                {category.imageUrl ? (
                                                  <img
                                                    src={category.imageUrl}
                                                    alt={category.title}
                                                    className="w-full h-full object-contain"
                                                  />
                                                ) : (
                                                  <Star
                                                    size={36}
                                                    className="text-gray-200"
                                                  />
                                                )}
                                              </div>
                                              <p
                                                className={`text-[9px] font-black uppercase italic text-center leading-tight transition-colors ${
                                                  isActive
                                                    ? "text-[#d11a2a]"
                                                    : "text-gray-700 group-hover:text-gray-900"
                                                }`}
                                              >
                                                {category.title}
                                              </p>
                                              {catProducts.length > 0 && (
                                                <span
                                                  className={`text-[7px] font-bold px-2 py-0.5 rounded-full ${
                                                    isActive
                                                      ? "bg-[#d11a2a] text-white"
                                                      : "bg-gray-100 text-gray-400"
                                                  }`}
                                                >
                                                  {catProducts.length}
                                                </span>
                                              )}
                                            </button>
                                          );
                                        })}
                                      </div>

                                      {/* Expanded product grid for selected family */}
                                      <AnimatePresence>
                                        {openAppFamilyId &&
                                          families.find(
                                            (c) => c.id === openAppFamilyId,
                                          ) &&
                                          (() => {
                                            const sel = families.find(
                                              (c) => c.id === openAppFamilyId,
                                            );
                                            const catProducts =
                                              getCategoryProducts(sel);
                                            if (catProducts.length === 0)
                                              return null;
                                            return (
                                              <motion.div
                                                key={openAppFamilyId}
                                                initial={{
                                                  height: 0,
                                                  opacity: 0,
                                                }}
                                                animate={{
                                                  height: "auto",
                                                  opacity: 1,
                                                }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                              >
                                                <div className="mt-6 pt-5 border-t border-gray-100">
                                                  <p className="text-[10px] font-black uppercase italic text-gray-500 mb-4">
                                                    {sel.title}{" "}
                                                    <span className="text-[#d11a2a]">
                                                      — {catProducts.length}{" "}
                                                      products
                                                    </span>
                                                  </p>
                                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                    {catProducts.map(
                                                      (product) => (
                                                        <ProductCard
                                                          key={product.id}
                                                          product={product}
                                                          addToQuote={
                                                            addToQuote
                                                          }
                                                          isInCart={quoteCart.some(
                                                            (i) =>
                                                              i.id ===
                                                              product.id,
                                                          )}
                                                        />
                                                      ),
                                                    )}
                                                  </div>
                                                </div>
                                              </motion.div>
                                            );
                                          })()}
                                      </AnimatePresence>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
                {activeView === "HIGHLIGHTS" && (
                  <Highlights
                    products={filteredProducts}
                    addToQuote={addToQuote}
                    quoteCart={quoteCart}
                  />
                )}
              </div>
            )}
          </div>

          <aside className="lg:col-span-3 order-1 lg:order-2">
            <ProductFilter
              products={products}
              productCount={filteredProducts.length}
              filters={filters}
              setFilters={setFilters}
              activeView={activeView}
            />
          </aside>
        </div>
      </section>

      <Footer />

      {/* CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[2000]">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-white p-8"
            >
              <div className="flex justify-between mb-8">
                <h2 className="text-2xl font-black italic uppercase">
                  Quote List
                </h2>
                <X
                  onClick={() => setIsCartOpen(false)}
                  className="cursor-pointer"
                />
              </div>
              <div className="space-y-4 overflow-y-auto max-h-[60vh]">
                {quoteCart.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 font-bold uppercase py-12">
                    Your quote list is empty
                  </p>
                ) : (
                  quoteCart.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 border rounded-2xl items-center"
                    >
                      <img
                        src={item.mainImage || "/placeholder.svg"}
                        className="w-12 h-12 object-contain flex-shrink-0"
                        alt={item.name || "Product"}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase italic truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <Minus
                            size={12}
                            className="cursor-pointer hover:text-[#d11a2a] transition-colors"
                            onClick={() => updateQuantity(item.id, -1)}
                          />
                          <span className="text-xs font-bold">
                            {item.quantity}
                          </span>
                          <Plus
                            size={12}
                            className="cursor-pointer hover:text-[#d11a2a] transition-colors"
                            onClick={() => updateQuantity(item.id, 1)}
                          />
                        </div>
                      </div>
                      <Trash2
                        size={16}
                        className="text-gray-300 cursor-pointer hover:text-red-500 transition-colors flex-shrink-0"
                        onClick={() => removeFromQuote(item.id)}
                      />
                    </div>
                  ))
                )}
              </div>
              <Link
                href="/checkout"
                className="block w-full py-4 bg-[#d11a2a] text-white text-center rounded-xl font-black uppercase text-[10px] mt-8"
              >
                Confirm Quote
              </Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- PRODUCT CARD ---
function ProductCard({ product, addToQuote, isInCart }: any) {
  const firstSpecGroup = product.technicalSpecs?.[0];
  const specRows = firstSpecGroup?.specs || firstSpecGroup?.rows || [];

  return (
    <div className="bg-white rounded-[28px] border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 group/card flex flex-col relative">
      <Link href={`/brand-lit/${product.slug || product.id}`}>
        <div className="h-64 md:h-72 bg-[#fcfcfc] p-6 flex items-center justify-center relative overflow-hidden">
          <img
            src={product.mainImage || "/placeholder.svg"}
            className="max-h-full object-contain group-hover/card:scale-110 group-hover/card:blur-[2px] transition-all duration-700"
            alt={product.name || "Product"}
          />

          {/* Technical Specs Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-[2px] flex flex-col justify-center items-center p-6 opacity-0 transition-all duration-300 z-30"
          >
            <p className="text-[10px] font-black text-[#d11a2a] uppercase tracking-widest mb-4 italic border-b border-[#d11a2a]/40 pb-1 w-full text-center">
              Technical Data
            </p>
            <table className="w-full border-collapse">
              <tbody className="divide-y divide-white/10">
                {specRows.slice(0, 5).map((row: any, i: number) => (
                  <tr key={i}>
                    <td className="py-2 text-[8px] font-bold text-gray-400 uppercase italic">
                      {row.name}
                    </td>
                    <td className="py-2 text-[9px] font-black text-white uppercase text-right">
                      {row.value || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-[7px] text-white/40 font-bold uppercase tracking-tighter">
              Click for more details
            </p>
          </motion.div>

          {/* Item Code / SKU Tag */}
          <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-lg text-[8px] font-black uppercase border z-10">
            {product.itemCode || product.sku || "—"}
          </div>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1 bg-white">
        <Link
          href={`/brand-lit/${product.slug || product.id}`}
          className="block group/link"
        >
          <h4 className="text-[11px] font-black uppercase italic line-clamp-2 min-h-[32px] text-gray-900 group-hover/card:text-[#d11a2a] transition-colors">
            {product.name}
          </h4>
        </Link>

        <button
          onClick={() => addToQuote(product)}
          className={`w-full mt-5 py-3.5 text-[9px] font-black uppercase rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
            isInCart
              ? "bg-green-600 text-white"
              : "bg-black text-white hover:bg-[#d11a2a]"
          }`}
        >
          {isInCart ? (
            <>
              <Check size={14} /> Added
            </>
          ) : (
            <>
              <Plus size={14} /> Add to Quote
            </>
          )}
        </button>
      </div>
    </div>
  );
}
