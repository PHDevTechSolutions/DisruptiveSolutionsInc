"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; 
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy 
} from "firebase/firestore";
import { 
  Pencil, 
  Trash2, 
  Image as ImageIcon, 
  Loader2, 
  Briefcase,
  AlertCircle,
  Eye,
  EyeOff,
  Plus
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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

export default function ApplicationMaintenance() {
  const CLOUDINARY_UPLOAD_PRESET = "taskflow_preset"; 
  const CLOUDINARY_CLOUD_NAME = "dvmpn8mjh";

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Form States
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // --- 1. FETCH DATA (REAL-TIME) ---
  useEffect(() => {
    const q = query(collection(db, "applications"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. IMAGE UPLOAD LOGIC ---
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { 
      method: "POST", 
      body: formData 
    });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.secure_url;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Memory cleanup para sa lumang preview
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setEditId(null);
    setTitle("");
    setDescription("");
    setImageFile(null);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
  };

  const handleEditClick = (app: any) => {
    setEditId(app.id);
    setTitle(app.title);
    setDescription(app.description);
    setPreviewUrl(app.imageUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "applications", id), {
        isActive: !currentStatus,
      });
      toast.success(!currentStatus ? "Sector is now Visible" : "Sector is now Hidden");
    } catch (error) {
      toast.error("Status update failed");
    }
  };

  // --- 3. SUBMIT LOGIC ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required");
    
    setIsSubmitLoading(true);
    const loadingToast = toast.loading(editId ? "Updating sector..." : "Adding new sector...");

    try {
      let finalImageUrl = previewUrl;

      // Mag-upload lang sa Cloudinary kung may bagong file na pinili
      if (imageFile) {
        finalImageUrl = await uploadToCloudinary(imageFile);
      }

      const applicationData = {
        title: title.toUpperCase().trim(),
        description: description.trim(),
        imageUrl: finalImageUrl,
        updatedAt: serverTimestamp(),
      };

      if (editId) {
        await updateDoc(doc(db, "applications", editId), applicationData);
        toast.success("Sector updated successfully!", { id: loadingToast });
      } else {
        await addDoc(collection(db, "applications"), {
          ...applicationData,
          isActive: true, 
          createdAt: serverTimestamp(),
        });
        toast.success("New sector added to database!", { id: loadingToast });
      }
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Operation failed. Please try again.", { id: loadingToast });
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const deleteToast = toast.loading("Deleting permanently...");
    try {
      await deleteDoc(doc(db, "applications", id));
      toast.success("Data wiped from system", { id: deleteToast });
    } catch (error) {
      toast.error("Deletion failed", { id: deleteToast });
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Brand Header */}
      <div className="flex items-center gap-5 border-b border-slate-100 pb-8">
        <div className="bg-emerald-600 p-4 rounded-[24px] shadow-xl shadow-emerald-100">
          <Briefcase className="text-white w-7 h-7" />
        </div>
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">Application Maintenance</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Manage System Sectors & Classifications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* --- CONTROL PANEL (FORM) --- */}
        <div className="lg:col-span-4">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 sticky top-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <h2 className="text-[11px] font-black uppercase text-emerald-600 tracking-widest flex items-center gap-2">
                {editId ? <><Pencil size={12}/> Editor Mode</> : <><Plus size={12}/> Entry Mode</>}
              </h2>
              {editId && (
                <Button onClick={resetForm} type="button" variant="ghost" className="h-7 text-[10px] font-black uppercase text-red-500 hover:bg-red-50 rounded-lg">
                  Cancel
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Sector Display Name</label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g. INDUSTRIAL LOGISTICS" 
                className="rounded-2xl h-14 font-bold border-slate-100 bg-slate-50/50 focus:bg-white transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Description / Notes</label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Briefly explain this application sector..." 
                className="rounded-2xl min-h-[120px] text-xs font-medium border-slate-100 bg-slate-50/50" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Visual Asset</label>
              <div 
                onClick={() => document.getElementById('app-img')?.click()} 
                className="relative w-full h-48 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-emerald-400 transition-colors group"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-300 flex flex-col items-center group-hover:text-emerald-500 transition-colors">
                    <ImageIcon size={40} strokeWidth={1.5}/>
                    <span className="text-[10px] font-black uppercase mt-3 tracking-tighter">Attach Thumbnail</span>
                  </div>
                )}
                <input type="file" id="app-img" hidden onChange={handleImageChange} accept="image/*" />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitLoading} 
              className={`w-full rounded-[20px] font-black uppercase text-[11px] h-14 shadow-lg transition-all ${editId ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-slate-900 hover:bg-emerald-600 shadow-slate-200'}`}
            >
              {isSubmitLoading ? <Loader2 className="animate-spin" /> : editId ? "Apply Changes" : "Register Sector"}
            </Button>
          </form>
        </div>

        {/* --- DATA VIEW (LIST) --- */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-emerald-600" size={40} />
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Synchronizing Firestore...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {applications.length === 0 && (
                <div className="text-center py-32 border-2 border-dashed border-slate-100 rounded-[50px] bg-slate-50/30">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <AlertCircle className="text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest">Database Empty: No Sectors Defined</p>
                </div>
              )}
              {applications.map((app) => (
                <div 
                  key={app.id} 
                  className={`group bg-white border border-slate-100 rounded-[35px] p-5 flex flex-col md:flex-row items-center gap-8 transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50 ${!app.isActive ? 'opacity-50 grayscale bg-slate-50' : ''}`}
                >
                  <div className="w-full md:w-48 h-32 bg-slate-100 rounded-[28px] overflow-hidden relative shrink-0 shadow-inner">
                    <img 
                      src={app.imageUrl || "https://via.placeholder.com/400x300"} 
                      alt={app.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    />
                    {!app.isActive && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Hidden</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center md:text-left space-y-2">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <h3 className="font-black text-lg uppercase text-slate-900 tracking-tighter">{app.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter shadow-sm ${app.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                        {app.isActive ? "Live" : "Archived"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase leading-relaxed max-w-xl line-clamp-2">
                      {app.description || "No sector brief available."}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50/80 p-3 rounded-[24px]">
                    <Button 
                      onClick={() => handleEditClick(app)} 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full h-11 w-11 bg-white hover:bg-emerald-50 hover:text-emerald-600 shadow-sm transition-all"
                    >
                      <Pencil size={18} />
                    </Button>
                    
                    <button 
                      onClick={() => toggleVisibility(app.id, app.isActive)}
                      className={`h-11 w-11 flex items-center justify-center rounded-full bg-white shadow-sm transition-all ${app.isActive ? 'text-blue-500 hover:text-blue-600 hover:bg-blue-50' : 'text-slate-400 hover:text-slate-900'}`}
                      title={app.isActive ? "Hide from public" : "Show to public"}
                    >
                      {app.isActive ? <Eye size={18}/> : <EyeOff size={18}/>}
                    </button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full h-11 w-11 bg-white text-red-400 hover:bg-red-50 hover:text-red-600 shadow-sm transition-all"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[40px] border-none p-10 shadow-2xl bg-white">
                        <AlertDialogHeader className="space-y-4">
                          <div className="mx-auto w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center">
                            <AlertCircle className="text-red-600 w-8 h-8" />
                          </div>
                          <div className="text-center space-y-2">
                            <AlertDialogTitle className="text-3xl font-black uppercase italic tracking-tighter">Confirm Deletion</AlertDialogTitle>
                            <AlertDialogDescription className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 leading-relaxed">
                              You are about to remove <span className="text-slate-900 underline">{app.title}</span>. This action is recorded and cannot be undone.
                            </AlertDialogDescription>
                          </div>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
                          <AlertDialogCancel className="w-full rounded-2xl bg-slate-100 border-none font-black text-[11px] uppercase h-14 px-8 hover:bg-slate-200 transition-colors">Abort</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(app.id)} 
                            className="w-full rounded-2xl bg-red-600 hover:bg-red-700 font-black text-[11px] uppercase h-14 px-8 shadow-lg shadow-red-200"
                          >
                            Delete Forever
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}