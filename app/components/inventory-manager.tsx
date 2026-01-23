"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Pencil, X, ArrowLeft, UploadCloud, ImageIcon, Plus } from "lucide-react";

// Firebase
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// UI
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ---------------- TYPES ----------------
interface SpecBlock {
  id: number;
  label: string;
  rows: { name: string; value: string }[];
}

export function InventoryManager() {
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  // FORM STATES
  const [productName, setProductName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [sku, setSku] = useState("");
  const [regPrice, setRegPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [descBlocks, setDescBlocks] = useState<SpecBlock[]>([]);
  const [mainImage, setMainImage] = useState<File | string | null>(null);
  
  // Dito natin sinisiguro na ang state ay pwedeng string array (URLs) o File array
  const [galleryImages, setGalleryImages] = useState<(File | string)[]>([]);
  
  const [catalogs, setCatalogs] = useState<{ id: number; file?: File; existingUrl?: string }[]>([
    { id: Date.now() },
  ]);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setProductName(product.name ?? "");
    setShortDesc(product.shortDescription ?? "");
    setSku(product.sku ?? "");
    setRegPrice(String(product.regularPrice ?? ""));
    setSalePrice(String(product.salePrice ?? ""));
    setDescBlocks(product.technicalSpecs ?? []);
    setMainImage(product.mainImage ?? null);
    
    // IMPORTANTE: Siguraduhin na ang galleryImages ay array
    setGalleryImages(Array.isArray(product.galleryImages) ? product.galleryImages : []);
    
    setCatalogs(
      product.catalogs?.length
        ? product.catalogs.map((url: string, i: number) => ({ id: Date.now() + i, existingUrl: url }))
        : [{ id: Date.now() }]
    );
    setView("form");
  };

  const resetForm = () => {
    setEditingId(null);
    setProductName("");
    setShortDesc("");
    setSku("");
    setRegPrice("");
    setSalePrice("");
    setDescBlocks([]);
    setMainImage(null);
    setGalleryImages([]);
    setCatalogs([{ id: Date.now() }]);
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "YOUR_PRESET"); // PALITAN ITO

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/YOUR_CLOUD/image/upload", // PALITAN ITO
      { method: "POST", body: formData }
    );
    const data = await res.json();
    return data.secure_url;
  };

  const uploadAllFiles = async (files: (File | string)[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const f of files) {
      if (typeof f === "string") {
        urls.push(f); // Kung URL na, wag nang i-upload
      } else if (f instanceof File) {
        urls.push(await uploadFile(f)); // Kung File, i-upload muna
      }
    }
    return urls;
  };

  const handleSave = async () => {
    const toastId = toast.loading(editingId ? "Updating product..." : "Publishing product...");
    try {
      const mainUrl = typeof mainImage === "string" ? mainImage : mainImage ? await uploadFile(mainImage) : "";
      const galleryUrls = await uploadAllFiles(galleryImages);
      const catalogUrls = await uploadAllFiles(catalogs.map((c) => c.file ?? c.existingUrl ?? "").filter(Boolean));

      const payload = {
        name: productName,
        shortDescription: shortDesc,
        sku,
        regularPrice: Number(regPrice) || 0,
        salePrice: Number(salePrice) || 0,
        technicalSpecs: descBlocks,
        mainImage: mainUrl,
        galleryImages: galleryUrls,
        catalogs: catalogUrls,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), payload);
        toast.success("Product updated!", { id: toastId });
      } else {
        await addDoc(collection(db, "products"), { ...payload, createdAt: serverTimestamp() });
        toast.success("Product published!", { id: toastId });
      }

      resetForm();
      setView("list");
    } catch (e) {
      console.error(e);
      toast.error("Error saving product", { id: toastId });
    }
  };

  // ---------------- LIST VIEW (Same logic as your code) ----------------
  if (view === "list") {
    return (
      <div className="p-6 space-y-6 bg-white min-h-screen">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Inventory</h2>
          <Button onClick={() => { resetForm(); setView("form"); }} className="bg-slate-900 hover:bg-slate-800">
            <Plus size={16} className="mr-2" /> Add New Product
          </Button>
        </div>

        <Card className="border-none shadow-xl bg-slate-50/50">
          <Table>
            <TableHeader className="bg-slate-100">
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Product Details</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Gallery</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id} className="cursor-pointer group" onClick={() => handleEdit(p)}>
                  <TableCell>
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white bg-slate-200">
                      {p.mainImage ? <img src={p.mainImage} className="w-full h-full object-cover" /> : <ImageIcon className="m-auto text-slate-400" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 uppercase text-sm">{p.name}</span>
                      <span className="text-xs text-slate-500 line-clamp-1">{p.shortDescription}</span>
                    </div>
                  </TableCell>
                  <TableCell><code className="text-[10px] bg-slate-200 px-2 py-1 rounded-md font-bold text-slate-600">{p.sku}</code></TableCell>
                  <TableCell>
                    <div className="flex -space-x-3">
                      {p.galleryImages?.slice(0, 3).map((img: string, i: number) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm">
                          <img src={img} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="icon"><Pencil size={14} /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    );
  }

  // ---------------- FORM VIEW ----------------
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => setView("list")} className="mb-4">
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-lg uppercase font-black">Product Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Product Name" />
                <div className="grid grid-cols-2 gap-4">
                  <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU" />
                  <Input type="number" value={regPrice} onChange={(e) => setRegPrice(e.target.value)} placeholder="Price" />
                </div>
                <Input value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="Short Description" />
              </CardContent>
            </Card>

            {/* GALLERY SECTION - PINAKAMAHALAGA */}
            <Card>
              <CardHeader><CardTitle className="text-lg uppercase font-black">Gallery Images</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {galleryImages.map((img, i) => {
                    // Logic para malaman kung URL (string) o bagong file (File) ang ipapakita
                    const imageSrc = typeof img === "string" ? img : URL.createObjectURL(img);
                    
                    return (
                      <div key={i} className="relative aspect-square rounded-xl border-2 border-dashed overflow-hidden bg-white group shadow-sm">
                        <img 
                          src={imageSrc} 
                          alt={`Gallery ${i}`} 
                          className="w-full h-full object-contain" 
                        />
                        <button 
                          type="button"
                          onClick={() => setGalleryImages(prev => prev.filter((_, idx) => idx !== i))} 
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                  
                  {/* UPLOAD BUTTON */}
                  <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                    <UploadCloud className="text-slate-400 mb-2" />
                    <span className="text-[10px] font-black uppercase text-slate-400">Add More</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setGalleryImages(prev => [...prev, file]);
                      }} 
                    />
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-lg uppercase font-black">Main Preview</CardTitle></CardHeader>
              <CardContent>
                <div className="relative aspect-square rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-white">
                  {mainImage ? (
                    <img src={typeof mainImage === "string" ? mainImage : URL.createObjectURL(mainImage)} className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon className="mx-auto mb-2" size={32} />
                      <span className="text-[10px] font-black uppercase">Main Image</span>
                    </div>
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setMainImage(e.target.files?.[0] || null)} />
                </div>
              </CardContent>
            </Card>
            

            <Button onClick={handleSave} className="w-full bg-slate-900 h-12 font-black uppercase text-xs">
              {editingId ? "Update Product" : "Save & Publish"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}