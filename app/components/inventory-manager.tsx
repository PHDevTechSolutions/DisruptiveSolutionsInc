"use client";

import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import { 
  Pencil, Trash2, Loader2, Search, 
  ImagePlus, UploadCloud, X, AlignLeft, 
  Plus, Globe, Tag, Factory, Settings2, ArrowLeft 
} from "lucide-react";

// Firebase
import { db } from "@/lib/firebase";
import { 
  collection, onSnapshot, query, orderBy, doc, 
  deleteDoc, updateDoc, addDoc, serverTimestamp, arrayUnion 
} from "firebase/firestore";

// UI Components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// --- TYPES ---
interface ListItem { id: string; name: string; }
interface SpecRow { name: string; value: string; }
interface SpecBlock { id: number; label: string; rows: SpecRow[]; }
interface CustomSectionData { id: string; title: string; items: ListItem[]; selected: string[]; }

export function InventoryManager() {
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- FORM STATES ---
  const [productName, setProductName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [sku, setSku] = useState("");
  const [regPrice, setRegPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [descBlocks, setDescBlocks] = useState<SpecBlock[]>([
    { id: Date.now(), label: "Technical Specifications", rows: [{ name: "Watts", value: "" }, { name: "Voltage", value: "" }] }
  ]);
  const [mainImage, setMainImage] = useState<any>(null); // Pwedeng File o URL String
  const [galleryImage, setGalleryImage] = useState<any>(null);

  // Classification States
  const [categories, setCategories] = useState<ListItem[]>([]);
  const [brands, setBrands] = useState<ListItem[]>([]);
  const [websites, setWebsites] = useState<ListItem[]>([]);
  const [customSections, setCustomSections] = useState<CustomSectionData[]>([]);
  
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedWebs, setSelectedWebs] = useState<string[]>([]);

  // List States
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubProducts = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    const unsubCats = onSnapshot(collection(db, "categories"), (snap) => setCategories(snap.docs.map(d => ({ id: d.id, name: d.data().name }))));
    const unsubBrands = onSnapshot(collection(db, "brands"), (snap) => setBrands(snap.docs.map(d => ({ id: d.id, name: d.data().name }))));
    const unsubWebs = onSnapshot(collection(db, "websites"), (snap) => setWebsites(snap.docs.map(d => ({ id: d.id, name: d.data().name }))));
    const unsubCustom = onSnapshot(collection(db, "custom_sections"), (snap) => {
      setCustomSections(snap.docs.map(d => ({ id: d.id, title: d.data().title, items: d.data().items || [], selected: [] })));
    });

    return () => { unsubProducts(); unsubCats(); unsubBrands(); unsubWebs(); unsubCustom(); };
  }, []);

  // --- 2. EDIT HANDLER (Populate Form) ---
  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setProductName(product.name || "");
    setShortDesc(product.shortDescription || "");
    setSku(product.sku || "");
    setRegPrice(product.regularPrice?.toString() || "");
    setSalePrice(product.salePrice?.toString() || "");
    setDescBlocks(product.technicalSpecs || []);
    setMainImage(product.mainImage || null);
    setGalleryImage(product.galleryImage || null);
    setSelectedCats(product.category ? [product.category] : []);
    setSelectedBrands(product.brand ? [product.brand] : []);
    setSelectedWebs(product.website ? [product.website] : []);
    
    // Logic para sa dynamic specs / custom sections
    if (product.dynamicSpecs) {
        // I-map pabalik ang selected items sa custom sections
    }

    setView("form");
  };

  // --- 3. SAVE / UPDATE LOGIC ---
  const handleSave = async () => {
    const isEdit = !!editingId;
    const toastId = toast.loading(isEdit ? "Updating product..." : "Publishing product...");

    try {
      let mainUrl = mainImage;
      let galleryUrl = galleryImage;

      // Simpleng check kung ang image ay bagong File (upload kailangan) o string (URL na dati)
      if (mainImage instanceof File) {
          // logic for uploadToCloudinary(mainImage)
      }

      const productData = {
        name: productName,
        shortDescription: shortDesc,
        sku,
        regularPrice: Number(regPrice) || 0,
        salePrice: Number(salePrice) || 0,
        technicalSpecs: descBlocks,
        category: selectedCats[0] || "Uncategorized",
        brand: selectedBrands[0] || "Generic",
        website: selectedWebs[0] || "N/A",
        mainImage: mainUrl,
        galleryImage: galleryUrl,
        updatedAt: serverTimestamp(),
      };

      if (isEdit) {
        await updateDoc(doc(db, "products", editingId), productData);
        toast.success("Product updated!", { id: toastId });
      } else {
        await addDoc(collection(db, "products"), { ...productData, createdAt: serverTimestamp() });
        toast.success("Product published!", { id: toastId });
      }

      setView("list");
      resetForm();
    } catch (err) {
      toast.error("Error saving product", { id: toastId });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setProductName("");
    // ... reset all other states
  };

  // --- RENDER LIST ---
  if (view === "list") {
    return (
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black uppercase italic italic tracking-tighter">Inventory</h2>
            <Button onClick={() => { resetForm(); setView("form"); }} className="bg-blue-600 font-bold text-xs uppercase">+ Add New</Button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-[10px] font-black uppercase">Product</TableHead>
                <TableHead className="text-[10px] font-black uppercase">SKU</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id} className="cursor-pointer hover:bg-slate-50/50" onClick={() => handleEdit(p)}>
                  <TableCell className="font-bold text-sm">{p.name}</TableCell>
                  <TableCell className="text-xs text-slate-400">{p.sku}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-blue-500"><Pencil size={14}/></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // --- RENDER FORM ---
  return (
    <div className="p-4 space-y-4 bg-slate-50 min-h-screen">
      <Button variant="ghost" onClick={() => setView("list")} className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900">
        <ArrowLeft size={14} className="mr-2"/> Back to Inventory
      </Button>
      
      {/* Dito mo ilalagay yung buong Card structure ng "AddNewProduct" component mo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
              <Card>
                  <CardHeader><CardTitle className="text-xs font-black uppercase">{editingId ? "Edit Product" : "New Product"}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                      <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Name" className="font-bold h-12"/>
                      {/* ... lahat ng inputs galing sa AddNewProduct mo ... */}
                  </CardContent>
              </Card>
          </div>
          <div className="space-y-6">
              {/* Featured Image Card & Publish Button */}
              <Button onClick={handleSave} className="w-full bg-red-600 h-16 font-black uppercase">
                  {editingId ? "Update Product" : "Publish Product"}
              </Button>
          </div>
      </div>
    </div>
  );
}