"use client";

import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
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
import { toast } from "sonner";
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileSpreadsheet,
  Database,
  Loader2,
  PackagePlus
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
  wattage: string;
  lumens: string;
  cct: string;
  lightSource: string;
  lifeHours: string;
  material: string;
  beamAngle: string;
  frequencyRange: string;
  ipRating: string;
  ocrConfidence: string;
}

export default function BulkImportDialog() {
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<ImportStats>({ total: 0, success: 0, failed: 0, skipped: 0 });
  const [logs, setLogs] = useState<string[]>([]);
  const [currentProduct, setCurrentProduct] = useState("");

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const createSlug = (productName: string, sku: string) => {
    const base = productName || sku || 'product';
    return base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
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

    setImporting(true);
    setProgress(0);
    setStats({ total: 0, success: 0, failed: 0, skipped: 0 });
    setLogs([]);

    addLog("🚀 Starting bulk import...");

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
              wattage: row['Wattage'] || '',
              lumens: row['Lumens'] || '',
              cct: row['CCT'] || '',
              lightSource: row['Light Source'] || '',
              lifeHours: row['Life Hours'] || '',
              material: row['Material'] || '',
              beamAngle: row['Beam Angle'] || '',
              frequencyRange: row['Frequency Range'] || '',
              ipRating: row['IP Rating'] || '',
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
          const technicalSpecs = [{
            id: Date.now(),
            label: "Technical Specifications",
            rows: [
              { name: "Wattage", value: product.wattage },
              { name: "Lumens", value: product.lumens },
              { name: "CCT", value: product.cct },
              { name: "Light Source", value: product.lightSource },
              { name: "Life Hours", value: product.lifeHours },
              { name: "Material", value: product.material },
              { name: "Beam Angle", value: product.beamAngle },
              { name: "Frequency Range", value: product.frequencyRange },
              { name: "IP Rating", value: product.ipRating }
            ].filter(row => row.value)
          }];

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
            brands: ["Brand-lit"],
            websites: ["Disruptive Solutions Inc"],
            seo: {
              title: `${product.productName || product.productCode} - ${product.wattage}`,
              description: `${product.productName || product.productCode} - ${product.wattage} ${categoryName}. ${product.lumens}, ${product.cct}. High-quality lighting solution.`,
              canonical: `https://disruptive-solutions-inc.vercel.app/lit/${slug}`,
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
      
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-black">
            <PackagePlus className="w-7 h-7 text-purple-600" />
            Bulk Product Import
          </DialogTitle>
          <DialogDescription className="text-sm">
            Upload your merged Excel file to import all products with images at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Upload Section */}
          {!importing && logs.length === 0 && (
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center border-4 border-dashed border-purple-300 rounded-2xl p-12 cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all bg-gradient-to-br from-purple-50/30 to-pink-50/30">
                <Upload className="w-16 h-16 text-purple-500 mb-4" />
                <span className="text-lg font-bold text-slate-700 mb-2">
                  Click to Upload Excel File
                </span>
                <span className="text-sm text-slate-500">
                  LIT_Products_Merged.xlsx
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>

              {/* Instructions */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <h4 className="font-bold text-xs uppercase text-amber-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  What will be imported:
                </h4>
                <ul className="space-y-1 text-xs text-amber-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>81 products with Cloudinary images</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>Auto-categorized by product type</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>Complete technical specifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>SEO-optimized titles and slugs</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Progress Section */}
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

          {/* Logs Section */}
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

          {/* Success Message */}
          {!importing && stats.success > 0 && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-xl font-black text-green-900 mb-1">
                Import Successful!
              </h3>
              <p className="text-sm text-green-700">
                Successfully imported <span className="font-bold">{stats.success} products</span> to Firebase
              </p>
              {stats.failed > 0 && (
                <p className="text-xs text-red-600 mt-2">
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