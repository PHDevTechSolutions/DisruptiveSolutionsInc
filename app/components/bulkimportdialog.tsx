"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  FileSpreadsheet,
  Database,
  Loader2,
  PackagePlus,
  Factory,
  Globe,
  X,
  Plus
} from "lucide-react";

interface ImportStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
}

interface ProductImportData {
  sheetName: string;
  productCode: string;
  productName: string;
  cloudinaryUrl: string;
  imageFilename: string;
  
  // LAMP DETAILS
  wattage: string;
  lumens: string;
  cct: string;
  beamAngle: string;
  lightSource: string;
  lifeHours: string;
  
  // ELECTRICAL SPECIFICATION
  voltage: string;
  powerFactor: string;
  current: string;
  inputVoltageRange: string;
  frequencyRange: string;
  
  // FIXTURE DETAILS
  material: string;
  ipRating: string;
  dimensions: string;
  weight: string;
  
  ocrConfidence: string;
}

export default function BulkImportDialog() {
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<ImportStats>({ total: 0, success: 0, failed: 0, skipped: 0 });
  const [logs, setLogs] = useState<string[]>([]);
  const [currentProduct, setCurrentProduct] = useState("");

  // States for Brands and Websites
  const [brands, setBrands] = useState<{id: string, name: string}[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [newBrand, setNewBrand] = useState("");

  const [websites, setWebsites] = useState<{id: string, name: string}[]>([]);
  const [selectedWebs, setSelectedWebs] = useState<string[]>([]);
  const [newWeb, setNewWeb] = useState("");

  // Fetch Brands and Websites
  useEffect(() => {
    const unsubBrands = onSnapshot(collection(db, "brands"), (snap) => {
      setBrands(snap.docs.map((d) => ({ id: d.id, name: d.data().name })));
    });
    const unsubWebs = onSnapshot(collection(db, "websites"), (snap) => {
      setWebsites(snap.docs.map((d) => ({ id: d.id, name: d.data().name })));
    });
    return () => {
      unsubBrands();
      unsubWebs();
    };
  }, []);

  const toggleValue = (val: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]);
  };

  const handleQuickAdd = async (col: string, val: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (!val.trim()) return;
    try {
      await addDoc(collection(db, col), { name: val.trim(), createdAt: serverTimestamp() });
      setter("");
      toast.success(`Added to ${col}`);
    } catch (e) {
      toast.error("Failed to add");
    }
  };

  const handleDeleteItem = async (col: string, id: string) => {
    try {
      await deleteDoc(doc(db, col, id));
      toast.success("Deleted successfully");
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const createSlug = (productName: string, sku: string) => {
    const base = productName || sku || 'product';
    return base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const mapCategoryName = (sheetName: string): string => {
    const mapping: { [key: string]: string } = {
      'Regular Bulbs': 'Bulbs',
      'Tubelights': 'Tube Lights',
      'Batten Lights': 'Batten Lights',
      'Downlights Round': 'Downlights',
      'Downlights Square': 'Downlights',
      'Surface Slim Downlights': 'Downlights',
      'Panel Lights': 'Panel Lights',
      'Linear Lights': 'Linear Lights',
      'Floodlights': 'Floodlights',
      'Streetlights': 'Streetlights',
      'Solar Streetlights': 'Solar Lights',
      'Highbay Lights': 'Highbay Lights',
      'Emergency & Exit Lights': 'Emergency Lights',
      'Tracklights': 'Track Lights'
    };
    return mapping[sheetName] || sheetName;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (selectedBrands.length === 0) {
      toast.error("Please select at least one Brand");
      return;
    }

    if (selectedWebs.length === 0) {
      toast.error("Please select at least one Website");
      return;
    }

    setImporting(true);
    setProgress(0);
    setStats({ total: 0, success: 0, failed: 0, skipped: 0 });
    setLogs([]);

    addLog("🚀 Starting bulk import...");
    addLog(`📦 Selected Brands: ${selectedBrands.join(", ")}`);
    addLog(`🌐 Selected Websites: ${selectedWebs.join(", ")}`);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      const sheetNames = workbook.SheetNames.filter(name => name !== '📊 Summary');
      addLog(`📊 Found ${sheetNames.length} product categories`);

      const allProducts: ProductImportData[] = [];

      for (const sheetName of sheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        jsonData.forEach((row: any) => {
          if (row['Cloudinary URL']) {
            allProducts.push({
              sheetName,
              productCode: row['Product Code'] || '',
              productName: row['Product Name (OCR)'] || '',
              cloudinaryUrl: row['Cloudinary URL'] || '',
              imageFilename: row['Image Filename'] || '',
              
              // LAMP DETAILS
              wattage: row['Wattage'] || '',
              lumens: row['Lumens'] || '',
              cct: row['CCT'] || '',
              beamAngle: row['Beam Angle'] || '',
              lightSource: row['Light Source'] || '',
              lifeHours: row['Life Hours'] || '',
              
              // ELECTRICAL SPECIFICATION
              voltage: row['Voltage'] || '',
              powerFactor: row['Power Factor'] || '',
              current: row['Current (A)'] || '',
              inputVoltageRange: row['Input Voltage Range'] || '',
              frequencyRange: row['Frequency Range'] || '',
              
              // FIXTURE DETAILS
              material: row['Material'] || '',
              ipRating: row['IP Rating'] || '',
              dimensions: row['Dimensions (mm)'] || '',
              weight: row['Weight (g)'] || '',
              
              ocrConfidence: row['OCR Confidence'] || ''
            });
          }
        });
      }

      setStats(prev => ({ ...prev, total: allProducts.length }));
      addLog(`✅ Found ${allProducts.length} products with images`);

      for (let i = 0; i < allProducts.length; i++) {
        const product = allProducts[i];
        setCurrentProduct(product.productName || product.productCode);
        setProgress(((i + 1) / allProducts.length) * 100);

        try {
          // 🔥 ORGANIZED SPECS BY CATEGORY
          const technicalSpecs = [
            {
              id: Date.now(),
              label: "LAMP DETAILS",
              rows: [
                { name: "Wattage", value: product.wattage },
                { name: "Lumens Output", value: product.lumens },
                { name: "Color Temperature", value: product.cct },
                { name: "Beam Angle", value: product.beamAngle },
                { name: "Light Source", value: product.lightSource },
                { name: "Life Hours", value: product.lifeHours }
              ].filter(row => row.value)
            },
            {
              id: Date.now() + 1,
              label: "ELECTRICAL SPECIFICATION",
              rows: [
                { name: "Working Voltage", value: product.voltage },
                { name: "Power Factor", value: product.powerFactor },
                { name: "Current", value: product.current },
                { name: "Input Voltage Range", value: product.inputVoltageRange },
                { name: "Frequency Range", value: product.frequencyRange }
              ].filter(row => row.value)
            },
            {
              id: Date.now() + 2,
              label: "FIXTURE DETAILS",
              rows: [
                { name: "Material", value: product.material },
                { name: "IP Rating", value: product.ipRating },
                { name: "Dimensions", value: product.dimensions },
                { name: "Weight", value: product.weight }
              ].filter(row => row.value)
            }
          ].filter(section => section.rows.length > 0); // Remove empty sections

          const slug = createSlug(product.productName, product.productCode);
          const categoryName = mapCategoryName(product.sheetName);

          const productPayload = {
            name: product.productName || product.productCode,
            shortDescription: `${product.wattage} ${categoryName}`,
            slug,
            sku: product.productCode,
            regularPrice: 0,
            salePrice: 0,
            technicalSpecs,
            dynamicSpecs: [],
            mainImage: product.cloudinaryUrl,
            galleryImages: [product.cloudinaryUrl],
            qrProductImages: [],
            catalogs: [],
            categories: [categoryName],
            
            // 🔥 DYNAMIC BRANDS & WEBSITES
            brands: selectedBrands,
            websites: selectedWebs,
            
            seo: {
              title: `${product.productName || product.productCode} - ${product.wattage}`,
              description: `${product.productName || product.productCode} - ${product.wattage} ${categoryName}. ${product.lumens}, ${product.cct}. High-quality lighting solution.`,
              canonical: `https://disruptive-solutions-inc.vercel.app/${selectedBrands[0]?.toLowerCase() || 'products'}/${slug}`,
              lastUpdated: new Date().toISOString()
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            importSource: "bulk-excel",
            ocrConfidence: product.ocrConfidence
          };

          await addDoc(collection(db, "products"), productPayload);
          
          setStats(prev => ({ ...prev, success: prev.success + 1 }));
          addLog(`✅ ${product.productName || product.productCode}`);

        } catch (error) {
          console.error(`Failed: ${product.productCode}`, error);
          setStats(prev => ({ ...prev, failed: prev.failed + 1 }));
          addLog(`❌ Failed: ${product.productName || product.productCode}`);
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      addLog("🎉 Import completed!");
      toast.success(`Imported ${stats.success} products successfully!`);

    } catch (error) {
      console.error("Import error:", error);
      addLog(`❌ Error: ${error}`);
      toast.error("Import failed");
    } finally {
      setImporting(false);
      setCurrentProduct("");
    }
  };

  const resetAndClose = () => {
    setOpen(false);
    setImporting(false);
    setProgress(0);
    setStats({ total: 0, success: 0, failed: 0, skipped: 0 });
    setLogs([]);
    setCurrentProduct("");
    setSelectedBrands([]);
    setSelectedWebs([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="border-2 border-dashed border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 font-bold h-12 rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <Database className="w-4 h-4 mr-2" />
          Bulk Import from Excel
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-black">
            <PackagePlus className="w-7 h-7 text-purple-600" />
            Bulk Product Import
          </DialogTitle>
          <DialogDescription className="text-sm">
            Select target brands and websites, then upload your Excel file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* BRAND & WEBSITE SELECTION - Only show before import starts */}
          {!importing && logs.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* BRANDS SECTION */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Factory className="w-4 h-4 text-blue-600" />
                  <Label className="text-sm font-black uppercase text-slate-700">
                    Target Brands
                  </Label>
                  {selectedBrands.length > 0 && (
                    <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                      {selectedBrands.length} selected
                    </span>
                  )}
                </div>

                <div className="border-2 border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  {/* Quick Add Brand */}
                  <div className="flex gap-2 mb-3">
                    <Input 
                      value={newBrand} 
                      onChange={(e) => setNewBrand(e.target.value)} 
                      placeholder="Add new brand..."
                      className="h-9 text-xs bg-white"
                      onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd("brands", newBrand, setNewBrand)}
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleQuickAdd("brands", newBrand, setNewBrand)}
                      className="h-9 w-9 p-0 bg-blue-500"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Brand List */}
                  <div className="max-h-48 overflow-y-auto space-y-1 border-l-2 border-blue-200 pl-3">
                    {brands.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">No brands yet. Add one above.</p>
                    ) : (
                      brands.map((brand) => (
                        <div 
                          key={brand.id} 
                          className={`flex items-center justify-between group p-2 rounded-lg transition-all ${
                            selectedBrands.includes(brand.name) 
                              ? 'bg-blue-100 ring-1 ring-blue-200' 
                              : 'hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`brand-${brand.id}`}
                              checked={selectedBrands.includes(brand.name)}
                              onCheckedChange={() => toggleValue(brand.name, setSelectedBrands)}
                              className="border-2"
                            />
                            <Label 
                              htmlFor={`brand-${brand.id}`}
                              className={`text-xs font-bold cursor-pointer ${
                                selectedBrands.includes(brand.name) ? 'text-blue-700' : 'text-slate-600'
                              }`}
                            >
                              {brand.name}
                            </Label>
                          </div>
                          <button 
                            onClick={() => handleDeleteItem("brands", brand.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* WEBSITES SECTION */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <Label className="text-sm font-black uppercase text-slate-700">
                    Target Websites
                  </Label>
                  {selectedWebs.length > 0 && (
                    <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                      {selectedWebs.length} selected
                    </span>
                  )}
                </div>

                <div className="border-2 border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  {/* Quick Add Website */}
                  <div className="flex gap-2 mb-3">
                    <Input 
                      value={newWeb} 
                      onChange={(e) => setNewWeb(e.target.value)} 
                      placeholder="Add new website..."
                      className="h-9 text-xs bg-white"
                      onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd("websites", newWeb, setNewWeb)}
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleQuickAdd("websites", newWeb, setNewWeb)}
                      className="h-9 w-9 p-0 bg-emerald-500"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Website List */}
                  <div className="max-h-48 overflow-y-auto space-y-1 border-l-2 border-emerald-200 pl-3">
                    {websites.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">No websites yet. Add one above.</p>
                    ) : (
                      websites.map((web) => (
                        <div 
                          key={web.id} 
                          className={`flex items-center justify-between group p-2 rounded-lg transition-all ${
                            selectedWebs.includes(web.name) 
                              ? 'bg-emerald-100 ring-1 ring-emerald-200' 
                              : 'hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`web-${web.id}`}
                              checked={selectedWebs.includes(web.name)}
                              onCheckedChange={() => toggleValue(web.name, setSelectedWebs)}
                              className="border-2"
                            />
                            <Label 
                              htmlFor={`web-${web.id}`}
                              className={`text-xs font-bold cursor-pointer ${
                                selectedWebs.includes(web.name) ? 'text-emerald-700' : 'text-slate-600'
                              }`}
                            >
                              {web.name}
                            </Label>
                          </div>
                          <button 
                            onClick={() => handleDeleteItem("websites", web.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* UPLOAD SECTION */}
          {!importing && logs.length === 0 && (
            <div className="space-y-4">
              <label 
                className={`flex flex-col items-center justify-center border-4 border-dashed rounded-2xl p-12 cursor-pointer transition-all ${
                  selectedBrands.length > 0 && selectedWebs.length > 0
                    ? 'border-purple-300 hover:border-purple-500 hover:bg-purple-50'
                    : 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
                }`}
              >
                <Upload className={`w-16 h-16 mb-4 ${
                  selectedBrands.length > 0 && selectedWebs.length > 0 ? 'text-purple-500' : 'text-slate-400'
                }`} />
                <span className="text-lg font-bold text-slate-700 mb-2">
                  {selectedBrands.length > 0 && selectedWebs.length > 0 
                    ? 'Click to Upload Excel File' 
                    : 'Select Brands & Websites First'}
                </span>
                <span className="text-sm text-slate-500">
                  LIT_Products_Enhanced.xlsx
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={selectedBrands.length === 0 || selectedWebs.length === 0}
                />
              </label>

              {/* Warning */}
              {(selectedBrands.length === 0 || selectedWebs.length === 0) && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900">
                      Selection Required
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      Please select at least one brand and one website before uploading your file.
                      All imported products will be assigned to the selected brands and websites.
                    </p>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <h4 className="font-bold text-xs uppercase text-blue-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  What will be imported:
                </h4>
                <ul className="space-y-1 text-xs text-blue-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>All products with Cloudinary images</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>Auto-categorized by product type</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="font-bold">✨ Organized specs: LAMP DETAILS, ELECTRICAL SPECIFICATION, FIXTURE DETAILS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="font-bold">
                      Brands: {selectedBrands.length > 0 ? selectedBrands.join(", ") : "None selected"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="font-bold">
                      Websites: {selectedWebs.length > 0 ? selectedWebs.join(", ") : "None selected"}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* PROGRESS SECTION */}
          {importing && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-slate-600">Importing Products...</span>
                  <span className="text-purple-600">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="font-semibold text-slate-700">{currentProduct}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                  <div className="text-2xl font-black text-blue-600">{stats.total}</div>
                  <div className="text-[10px] font-bold text-blue-800 uppercase">Total</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
                  <div className="text-2xl font-black text-green-600">{stats.success}</div>
                  <div className="text-[10px] font-bold text-green-800 uppercase">Success</div>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100">
                  <div className="text-2xl font-black text-red-600">{stats.failed}</div>
                  <div className="text-[10px] font-bold text-red-800 uppercase">Failed</div>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-100">
                  <div className="text-2xl font-black text-amber-600">{stats.skipped}</div>
                  <div className="text-[10px] font-bold text-amber-800 uppercase">Skipped</div>
                </div>
              </div>
            </div>
          )}

          {/* LOGS SECTION */}
          {logs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-700 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  Import Logs
                </h4>
                {!importing && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={resetAndClose}
                    className="h-7 text-xs"
                  >
                    Close & Reset
                  </Button>
                )}
              </div>
              <div className="bg-slate-950 text-green-400 font-mono text-[10px] p-4 rounded-lg max-h-64 overflow-y-auto space-y-0.5">
                {logs.map((log, idx) => (
                  <div key={idx} className="hover:bg-slate-900 px-2 py-0.5 rounded">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUCCESS MESSAGE */}
          {!importing && stats.success > 0 && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-xl font-black text-green-900 mb-1">
                Import Successful!
              </h3>
              <p className="text-sm text-green-700">
                Successfully imported <span className="font-bold">{stats.success} products</span> to:
              </p>
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                {selectedBrands.map(brand => (
                  <span key={brand} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                    {brand}
                  </span>
                ))}
                {selectedWebs.map(web => (
                  <span key={web} className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold">
                    {web}
                  </span>
                ))}
              </div>
              {stats.failed > 0 && (
                <p className="text-xs text-red-600 mt-3">
                  {stats.failed} products failed to import - check logs above
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}