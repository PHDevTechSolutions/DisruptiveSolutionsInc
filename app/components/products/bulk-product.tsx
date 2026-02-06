"use client";
import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

interface ProductData {
  productName: string;
  sku: string;
  imageFilename: string;
  confidence: number;
  cloudinaryUrl?: string;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
}

interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}

const BulkProduct = () => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  
  // Cloudinary configuration - UPDATE THESE VALUES
  const [cloudinaryConfig, setCloudinaryConfig] = useState<CloudinaryConfig>({
    cloudName: '', // e.g., 'your-cloud-name'
    uploadPreset: '' // e.g., 'your-upload-preset'
  });
  
  const [showConfig, setShowConfig] = useState(false);

  // Extract yellow-colored text from image
  const extractYellowText = async (imageFile: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) {
          resolve('');
          return;
        }

        // Create a new canvas for yellow-only pixels
        const yellowCanvas = document.createElement('canvas');
        yellowCanvas.width = canvas.width;
        yellowCanvas.height = canvas.height;
        const yellowCtx = yellowCanvas.getContext('2d');
        const yellowImageData = yellowCtx?.createImageData(canvas.width, canvas.height);

        if (!yellowImageData) {
          resolve('');
          return;
        }

        // Detect yellow pixels
        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];

          // Yellow detection: High R, High G, Low B
          const isYellow = (
            r > 180 && g > 160 && b < 100 && // Bright yellow
            r > g * 0.8 && // R close to G
            g > b * 2 // G much higher than B
          );

          if (isYellow) {
            yellowImageData.data[i] = 255; // R
            yellowImageData.data[i + 1] = 255; // G
            yellowImageData.data[i + 2] = 255; // B (make it white for OCR)
            yellowImageData.data[i + 3] = 255; // Alpha
          } else {
            yellowImageData.data[i] = 0;
            yellowImageData.data[i + 1] = 0;
            yellowImageData.data[i + 2] = 0;
            yellowImageData.data[i + 3] = 255;
          }
        }

        yellowCtx?.putImageData(yellowImageData, 0, 0);

        // Convert canvas to blob for Tesseract
        yellowCanvas.toBlob((blob) => {
          if (!blob) {
            resolve('');
            return;
          }

          Tesseract.recognize(blob, 'eng')
            .then(({ data: { text } }) => {
              resolve(text);
            })
            .catch(() => resolve(''));
        });
      };

      img.onerror = () => resolve('');
      img.src = URL.createObjectURL(imageFile);
    });
  };

  // Smart O/0 conversion and cleanup for product names
  const cleanProductName = (text: string): string => {
    let cleaned = text.trim();
    
    // 1. Remove "EE" or repeated E at the beginning
    cleaned = cleaned.replace(/^EE+/gi, '');
    
    // 2. Convert isolated 0 to O when surrounded by letters
    cleaned = cleaned.replace(/([A-Z])0([A-Z])/gi, '$1O$2');
    cleaned = cleaned.replace(/^0([A-Z])/gi, 'O$1');
    cleaned = cleaned.replace(/([A-Z])0$/gi, '$1O');
    cleaned = cleaned.replace(/([A-Z])0\s/gi, '$1O ');
    cleaned = cleaned.replace(/\s0([A-Z])/gi, ' O$1');
    cleaned = cleaned.replace(/0([A-Z]{2,})/g, 'O$1');
    
    // 3. Remove "EE" at the end
    cleaned = cleaned.replace(/\sEE$/gi, '');
    
    // 4. Remove special characters except spaces and dashes
    cleaned = cleaned.replace(/[^\w\s-]/g, '');
    
    return cleaned.toUpperCase().trim();
  };

  // Extract SKU from filename
  const getSKUFromFilename = (filename: string): string => {
    return filename.replace(/\.(png|jpg|jpeg|webp|gif)$/i, '').toUpperCase();
  };

  // Analyze if text contains more numbers or letters
  const analyzeTextType = (text: string): 'numeric' | 'text' | 'mixed' => {
    const letterCount = (text.match(/[A-Z]/gi) || []).length;
    const numberCount = (text.match(/[0-9]/g) || []).length;

    if (numberCount === 0 && letterCount > 0) return 'text';
    if (letterCount === 0 && numberCount > 0) return 'numeric';
    if (numberCount > letterCount) return 'numeric';
    if (letterCount > numberCount) return 'text';
    return 'mixed';
  };

  // Upload image to Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    
    // Optional: Add folder organization
    formData.append('folder', 'lit-products');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Cloudinary upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Check if Cloudinary is configured
    if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
      alert('Please configure Cloudinary settings first!');
      setShowConfig(true);
      return;
    }

    setLoading(true);
    setProgress(0);

    const newEntries: ProductData[] = [];
    const fileArray = Array.from(files).filter(file => file.type.startsWith('image/'));

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setCurrentFile(file.name);
      setProgress(Math.round(((i + 1) / fileArray.length) * 100));

      try {
        // First, try to extract yellow text (product name)
        const yellowText = await extractYellowText(file);

        // Then get all text for fallback
        const result = await Tesseract.recognize(file, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              // Optional: Log OCR progress
            }
          }
        });

        const { data: { text: fullText, confidence } } = result;

        // SKU is always the filename without extension
        const sku = getSKUFromFilename(file.name);

        let productName = "";

        // Priority 1: Use yellow text if found
        if (yellowText && yellowText.trim().length > 3) {
          productName = cleanProductName(yellowText);
        } else {
          // Priority 2: Extract from full text
          const lines = fullText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 2);

          const productNameLines = lines.filter(line => {
            const type = analyzeTextType(line);
            return type === 'text' || (type === 'mixed' && line.length > 8);
          });

          if (productNameLines.length > 0) {
            productName = productNameLines.reduce((longest, current) =>
              current.length > longest.length ? current : longest
            );
            productName = cleanProductName(productName);
          } else if (lines.length > 0) {
            productName = cleanProductName(lines[0]);
          }
        }

        // Priority 3: Use filename if all else fails
        if (!productName || productName.length < 3) {
          productName = sku.replace(/-/g, ' ');
        }

        const newProduct: ProductData = {
          productName: productName,
          sku: sku,
          imageFilename: file.name,
          confidence: Math.round(confidence),
          uploadStatus: 'pending'
        };

        newEntries.push(newProduct);

      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        const sku = getSKUFromFilename(file.name);
        newEntries.push({
          productName: sku.replace(/-/g, ' '),
          sku: sku,
          imageFilename: file.name,
          confidence: 0,
          uploadStatus: 'error'
        });
      }
    }

    setProducts((prev) => [...prev, ...newEntries]);
    setLoading(false);
    setCurrentFile("");
    setProgress(0);

    // Now upload to Cloudinary
    uploadAllToCloudinary(fileArray);
  };

  const uploadAllToCloudinary = async (files: File[]) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const sku = getSKUFromFilename(file.name);

      // Update status to uploading
      setProducts(prev => prev.map(p =>
        p.sku === sku ? { ...p, uploadStatus: 'uploading' as const } : p
      ));

      try {
        const cloudinaryUrl = await uploadToCloudinary(file);

        // Update with Cloudinary URL
        setProducts(prev => prev.map(p =>
          p.sku === sku
            ? { ...p, cloudinaryUrl, uploadStatus: 'success' as const }
            : p
        ));
      } catch (error) {
        console.error(`Error uploading ${file.name} to Cloudinary:`, error);
        setProducts(prev => prev.map(p =>
          p.sku === sku ? { ...p, uploadStatus: 'error' as const } : p
        ));
      }
    }
  };

  const exportToCSV = () => {
    const headers = "Product Name,SKU,Image Filename,Cloudinary URL,Confidence\n";
    const rows = products.map(p =>
      `"${p.productName}","${p.sku}","${p.imageFilename}","${p.cloudinaryUrl || 'Not uploaded'}","${p.confidence}%"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bulk_products_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearProducts = () => {
    if (confirm("Clear all products?")) {
      setProducts([]);
    }
  };

  const removeProduct = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  const editProduct = (index: number, field: keyof ProductData, value: string) => {
    setProducts(prev => prev.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    ));
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'uploading':
        return '📤';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🖼️ LIT Bulk Uploader with Cloudinary
          </h1>
          <p className="text-gray-600">
            Upload images to extract product names and upload to Cloudinary.
          </p>
          <p className="text-sm text-indigo-600 mt-2">
            💡 TIP: Yellow-colored text in images will be automatically detected as the product name
          </p>
          
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            ⚙️ {showConfig ? 'Hide' : 'Configure'} Cloudinary
          </button>
        </div>

        {/* Cloudinary Configuration */}
        {showConfig && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Cloudinary Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cloud Name
                </label>
                <input
                  type="text"
                  value={cloudinaryConfig.cloudName}
                  onChange={(e) => setCloudinaryConfig(prev => ({
                    ...prev,
                    cloudName: e.target.value
                  }))}
                  placeholder="your-cloud-name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Preset
                </label>
                <input
                  type="text"
                  value={cloudinaryConfig.uploadPreset}
                  onChange={(e) => setCloudinaryConfig(prev => ({
                    ...prev,
                    uploadPreset: e.target.value
                  }))}
                  placeholder="your-upload-preset"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Setup Instructions:</strong><br />
                1. Go to your Cloudinary Dashboard<br />
                2. Navigate to Settings → Upload → Upload presets<br />
                3. Create an unsigned upload preset (or use existing)<br />
                4. Copy your Cloud Name from Dashboard<br />
                5. Paste both values above
              </p>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-lg font-semibold text-gray-700">
                Binabasa ang images (OCR)...
              </p>
              <p className="text-sm text-gray-500 mt-2">{currentFile}</p>
              <div className="mt-4 max-w-md mx-auto">
                <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-4 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{progress}% Complete</p>
              </div>
            </div>
          ) : (
            <>
              <label className="flex flex-col items-center justify-center border-4 border-dashed border-indigo-300 rounded-xl p-12 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                <span className="text-6xl mb-4">📁</span>
                <span className="text-xl font-semibold text-gray-700 mb-2">
                  I-drop ang PNG files dito
                </span>
                <span className="text-sm text-gray-500">
                  Piliin ang mga files sa loob ng LIT PRODUCTS folder
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </>
          )}
        </div>

        {/* Results Table */}
        {products.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {products.length} Products Found
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={clearProducts}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  🗑️ Clear All
                </button>
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  📥 Download CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                      Product Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                      Filename
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                      Cloudinary
                    </th>
                  
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, index) => (
                    <tr key={index} className="hover:bg-gray-50 border-b">
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={p.productName}
                          onChange={(e) => editProduct(index, 'productName', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={p.sku}
                          onChange={(e) => editProduct(index, 'sku', e.target.value)}
                          className="w-full px-2 py-1 text-sm font-mono border border-gray-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-blue-600"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {p.imageFilename}
                      </td>
                      <td className="px-4 py-3">
                        {p.cloudinaryUrl ? (
                          <a
                            href={p.cloudinaryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                          >
                            {getStatusIcon(p.uploadStatus)} View Image
                          </a>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {getStatusIcon(p.uploadStatus)} {p.uploadStatus || 'Pending'}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeProduct(index)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkProduct;