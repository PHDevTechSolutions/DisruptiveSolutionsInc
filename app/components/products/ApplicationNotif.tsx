"use client"

import React, { useState, useEffect, useRef } from "react"
import { 
  Save, Bold, Italic, List, Quote, Loader2, Mail, User, Send, 
  Heading1, Heading2, Plus, Trash2, MailPlus, Database, AlertCircle, CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore"

export default function ApplicationNotif() {
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Recipients Management
  const [includeDbUsers, setIncludeDbUsers] = useState(false)
  const [showManualRecipients, setShowManualRecipients] = useState(false)
  const [extraRecipients, setExtraRecipients] = useState<string[]>([""])

  const [formData, setFormData] = useState({
    isEnabled: true,
    from: "",
    replyTo: "",
    to: "{applicant_email}",
    cc: "",
    subject: "",
    content: "",
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "emailConfig");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setFormData(docSnap.data() as any);
      } catch (error) {
        toast.error("System Error: Failed to synchronize settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const addEmailField = () => setExtraRecipients([...extraRecipients, ""])
  const removeEmailField = (index: number) => {
    const newEmails = extraRecipients.filter((_, i) => i !== index)
    setExtraRecipients(newEmails.length ? newEmails : [""])
  }
  const updateEmailField = (index: number, val: string) => {
    const newEmails = [...extraRecipients]
    newEmails[index] = val
    setExtraRecipients(newEmails)
  }

  const handleSave = async () => {
    // 1. Validation Logic
    const manualEmails = extraRecipients
      .map(e => e.trim())
      .filter(e => e !== "" && e.includes("@"));
    
    // Kunin din natin yung nasa Reply-To field para isama sa padadalhan
    const replyToEmail = formData.replyTo.trim();
    
    // Check kung may mapapadalhan ba
    if (!includeDbUsers && manualEmails.length === 0 && (!replyToEmail || !replyToEmail.includes("@"))) {
      toast.error("Recipient Required", {
        description: "Please enable Database Fetch or add at least one manual address."
      });
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Executing broadcast protocol...");

    try {
      // 2. Persistent Storage Sync
      const settingsRef = doc(db, "settings", "emailConfig");
      await setDoc(settingsRef, formData, { merge: true });

      // 3. Recipient Aggregation
      let finalRecipientList: string[] = [];

      // A. Isama ang mga nasa Database kung naka-ON ang Global Fetch
      if (includeDbUsers) {
        const querySnapshot = await getDocs(collection(db, "users"));
        const dbEmails = querySnapshot.docs
          .map(doc => doc.data().email)
          .filter(e => e && e.includes("@"));
        finalRecipientList = [...dbEmails];
      }

      // B. ISAMA YUNG REPLY-TO EMAIL (pablojhay321@gmail.com)
      if (replyToEmail && replyToEmail.includes("@")) {
        finalRecipientList.push(replyToEmail);
      }
      
      // C. ISAMA YUNG MGA MANUAL TARGETS (mrjhpablo@gmail.com)
      finalRecipientList = [...finalRecipientList, ...manualEmails];

      // D. Clean up: Tanggalin ang duplicates para hindi doble ang matanggap nila
      finalRecipientList = Array.from(new Set(finalRecipientList));

      // 4. API Dispatch
      const res = await fetch('/api/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recipients: finalRecipientList })
      });

      if (!res.ok) throw new Error("API dispatch failed");
      
      toast.success("Broadcast Complete", {
        id: toastId,
        description: `Successfully dispatched to ${finalRecipientList.length} recipients.`
      });
    } catch (error: any) {
      toast.error("Execution Failed", { id: toastId, description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const applyFormatting = (p: string, s: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formData.content
    const newContent = text.substring(0, start) + p + text.substring(start, end) + s + text.substring(end)
    setFormData(prev => ({ ...prev, content: newContent }))
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + p.length, end + p.length); }, 10)
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Initialising System</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#fcfcfd] p-6 lg:p-12 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Communication Center</h1>
            <p className="text-slate-500 text-xs font-medium">Configure and dispatch automated application notifications.</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-lg px-6 h-11 font-semibold text-xs uppercase tracking-wider"
          >
            {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Send className="mr-2" size={16} />}
            Execute Broadcast
          </Button>
        </div>

        <div className="space-y-6">
          {/* Main Config Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <Mail size={16} />
                </div>
                <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">Email Protocol Settings</span>
              </div>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                 </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Identity Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Title:</Label>
                  <Input 
                    value={formData.from} 
                    onChange={(e) => setFormData(p => ({ ...p, from: e.target.value }))} 
                    className="h-12 bg-slate-50/30 border-slate-200 focus:bg-white rounded-xl font-medium" 
                    placeholder="e.g. TFVC Admissions" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">TO:</Label>
                    <button 
                      onClick={() => setShowManualRecipients(!showManualRecipients)}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
                    >
                      
                      <MailPlus size={12}/> {showManualRecipients ? "Hide Manual" : "Add Direct"}
                    </button>
                  </div>
                  <Input 
                    value={formData.replyTo} 
                    onChange={(e) => setFormData(p => ({ ...p, replyTo: e.target.value }))} 
                    className="h-12 bg-slate-50/30 border-slate-200 focus:bg-white rounded-xl font-medium" 
                    placeholder="admissions@tfvc.edu.ph" 
                  />
                </div>
              </div>

              {/* Manual Recipient Expansion */}
              {showManualRecipients && (
                <div className="p-6 bg-blue-50/30 rounded-xl border border-blue-100 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-blue-600 uppercase"></span>
                    <Button onClick={addEmailField} variant="ghost" size="sm" className="h-7 text-blue-600 text-[10px] font-bold">
                      <Plus size={14} className="mr-1"/> New Field
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-900">
                    {extraRecipients.map((email, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input 
                          value={email} 
                          onChange={(e) => updateEmailField(idx, e.target.value)} 
                          placeholder="direct@email.com" 
                          className="h-10 bg-white border-blue-100 rounded-lg text-sm" 
                        />
                        <button onClick={() => removeEmailField(idx)} className="text-slate-300 hover:text-red-500 transition-colors px-1"><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subject Line */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Subject Line</Label>
                <Input 
                  value={formData.subject} 
                  onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))} 
                  className="h-12 bg-slate-50/30 border-slate-200 focus:bg-white rounded-xl font-bold text-slate-800" 
                  placeholder="Official Notice: Application Update" 
                />
              </div>

              {/* Content Editor */}
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Message Body</Label>
                <div className="border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-400 transition-all">
                  <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center gap-1">
                    
                  </div>
                  <textarea 
                    ref={textareaRef} 
                    className="w-full min-h-[300px] p-6 text-sm leading-relaxed outline-none resize-none font-medium text-slate-700" 
                    value={formData.content} 
                    onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))} 
                    placeholder="Enter professional email content here..."
                  />
                  <div className="px-6 py-3 bg-slate-50/50 border-t flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                           <Database size={10} className={includeDbUsers ? "text-blue-500" : "text-slate-300"}/> 
                           DB Fetch: {includeDbUsers ? "Enabled" : "Disabled"}
                        </span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{formData.content.length} Characters</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ToolbarBtn({ icon, onClick }: { icon: React.ReactNode, onClick: () => void }) {
  return (
    <button 
      type="button" 
      onClick={onClick} 
      className="p-2 text-slate-500 hover:bg-white hover:text-blue-600 rounded-lg transition-all"
    >
      {icon}
    </button>
  )
}