"use client";

import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import { 
  Pencil, 
  Trash2, 
  Loader2, 
  Search, 
} from "lucide-react";

// UI Components
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Firebase
import { db } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  deleteDoc, 
  updateDoc 
} from "firebase/firestore";
import { toast } from "sonner";

export function AllProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("All Brands");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- 1. FETCH DATA (Tumutugma sa format ng 'Add Product' natin) ---
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productList);
      setLoading(false);
    }, (error) => {
      console.error("Fetch error:", error);
      toast.error("Failed to load products");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. DELETE ---
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  // --- 3. EDIT & UPDATE ---
  const handleEditClick = (product: any) => {
    setEditingProduct(JSON.parse(JSON.stringify(product))); // Deep copy
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;
    setIsUpdating(true);
    try {
      const productRef = doc(db, "products", editingProduct.id);
      const { id, ...dataToUpdate } = editingProduct; // Huwag isama ang ID sa database update
      await updateDoc(productRef, dataToUpdate);
      toast.success("Updated successfully!");
      setIsEditOpen(false);
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- 4. FILTER LOGIC ---
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Single string ang 'brand' sa bagong database structure
      const matchesBrand = brandFilter === "All Brands" || p.brand === brandFilter;
      const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesBrand && matchesSearch;
    });
  }, [products, brandFilter, searchQuery]);

  // Extract unique brands para sa dropdown filter
  const uniqueBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach((p: any) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet).sort();
  }, [products]);

  return (
    <div className="w-full space-y-4 p-2">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">Inventory</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Manage your products</p>
        </div>
      </div>

      {/* --- SEARCH & FILTERS --- */}
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input 
            placeholder="Search name or SKU..." 
            className="pl-10 rounded-xl border-gray-100 bg-gray-50/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="border rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider bg-gray-50/50 border-gray-100 outline-none cursor-pointer"
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
        >
          <option>All Brands</option>
          {uniqueBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
        </select>
      </div>

      {/* --- TABLE --- */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[80px] pl-6">Image</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Product Info</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">SKU</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Brand</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Price</TableHead>
              <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="h-40 text-center"><Loader2 className="animate-spin mx-auto text-red-500" /></TableCell></TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-40 text-center text-xs text-gray-400 font-bold uppercase">No products found</TableCell></TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="group hover:bg-gray-50/50 transition-colors">
                  <TableCell className="pl-6">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl p-1 border border-gray-100 overflow-hidden">
                      <img src={product.mainImage} alt="" className="w-full h-full object-contain" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-gray-900 line-clamp-1">{product.name}</span>
                      <span className="text-[9px] text-blue-600 font-black uppercase tracking-tighter">{product.category || "No Category"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[10px] font-black text-gray-400 uppercase">{product.sku || "---"}</TableCell>
                  <TableCell>
                    <span className="text-[9px] font-black bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">
                      {product.brand || "Generic"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900">₱{product.regularPrice}</span>
                      {product.salePrice > 0 && <span className="text-[9px] text-red-500 font-bold line-through">₱{product.salePrice}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50" onClick={() => handleEditClick(product)}>
                        <Pencil size={14} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50"><Trash2 size={14} /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-3xl border-none">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-black uppercase italic tracking-tighter">Delete Product?</AlertDialogTitle>
                            <AlertDialogDescription className="text-xs">Permanent deletion of {product.name}. This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl border-none bg-gray-100 font-bold text-[10px] uppercase">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(product.id)} className="rounded-xl bg-red-600 font-bold text-[10px] uppercase">Confirm Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- EDIT SHEET --- */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="sm:max-w-[500px] overflow-y-auto rounded-l-[40px] border-none shadow-2xl">
          <SheetHeader className="pb-6 border-b">
            <SheetTitle className="text-3xl font-black uppercase italic tracking-tighter">Edit Product</SheetTitle>
            <SheetDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-400 tracking-tighter">Update your inventory data</SheetDescription>
          </SheetHeader>

          {editingProduct && (
            <div className="space-y-6 py-8">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Product Name</Label>
                  <Input value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="rounded-2xl py-6 border-slate-100 font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Regular Price</Label>
                    <Input type="number" value={editingProduct.regularPrice} onChange={(e) => setEditingProduct({...editingProduct, regularPrice: Number(e.target.value)})} className="rounded-2xl py-6 border-slate-100" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Sale Price</Label>
                    <Input type="number" value={editingProduct.salePrice} onChange={(e) => setEditingProduct({...editingProduct, salePrice: Number(e.target.value)})} className="rounded-2xl py-6 border-slate-100" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">SKU / Model Number</Label>
                  <Input value={editingProduct.sku} onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})} className="rounded-2xl py-6 border-slate-100 uppercase" />
                </div>
              </div>

              {/* SPECIFICATIONS EDITING (Dito na-edit yung Watts, Voltage etc) */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase italic text-blue-600 border-b pb-2 tracking-widest">Specifications</h3>
                {editingProduct.specifications?.map((block: any, bIdx: number) => (
                  <div key={bIdx} className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase text-slate-400">{block.label}</p>
                    {block.rows?.map((row: any, rIdx: number) => (
                      <div key={rIdx} className="grid grid-cols-2 gap-2">
                        <Input 
                          value={row.name} 
                          className="h-8 text-xs bg-white rounded-lg" 
                          onChange={(e) => {
                            const newSpecs = [...editingProduct.specifications];
                            newSpecs[bIdx].rows[rIdx].name = e.target.value;
                            setEditingProduct({...editingProduct, specifications: newSpecs});
                          }} 
                        />
                        <Input 
                          value={row.value} 
                          className="h-8 text-xs bg-white rounded-lg" 
                          onChange={(e) => {
                            const newSpecs = [...editingProduct.specifications];
                            newSpecs[bIdx].rows[rIdx].value = e.target.value;
                            setEditingProduct({...editingProduct, specifications: newSpecs});
                          }} 
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          <SheetFooter className="pt-6 border-t">
            <Button disabled={isUpdating} onClick={handleUpdate} className="w-full bg-[#d11a2a] hover:bg-red-700 text-white rounded-2xl py-8 font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-red-500/20 transition-all active:scale-95">
              {isUpdating ? <Loader2 className="animate-spin" /> : "Commit Changes"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}