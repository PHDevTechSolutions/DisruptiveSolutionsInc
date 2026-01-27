"use client"

import React, { useState, useEffect, useRef } from "react"
import { 
  Save, Bold, Italic, List, Quote, ListOrdered, ChevronDown, ChevronUp, 
  Loader2, Mail, User, Info, Send, Heading1, Heading2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { db } from "@/lib/firebase" // Siguraduhing tama ang path ng firebase config mo
import { doc, getDoc, setDoc } from "firebase/firestore"

export default function ApplicationNotif() {
  const [isOpen, setIsOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const [formData, setFormData] = useState({
    isEnabled: true,
    from: "",
    replyTo: "",
    to: "{applicant_email}",
    cc: "",
    subject: "",
    content: "",
  })

  // 1. FETCH SETTINGS DIRECTLY FROM FIRESTORE
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "emailConfig");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setFormData(docSnap.data() as any);
        }
      } catch (error) {
        toast.error("Failed to load settings from Firebase");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const applyFormatting = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formData.content
    const selectedText = text.substring(start, end)

    const newContent = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end)
    setFormData(prev => ({ ...prev, content: newContent }))

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 10)
  }

  // 2. SAVE SETTINGS & TRIGGER BULK EMAIL
  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving & Sending notifications...");
    
    try {
      // Step A: Save to Firestore
      const docRef = doc(db, "settings", "emailConfig");
      await setDoc(docRef, formData, { merge: true });

      // Step B: Trigger API (Example: sending to a list of emails)
      // Dito mo pwedeng ilagay ang array ng emails ng applicants mo
      const testRecipients = ["jpablobscs@tfvc.edu.ph"]; 

      const res = await fetch('/api/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          recipients: testRecipients 
        })
      });

      if (!res.ok) throw new Error();
      
      toast.success("Settings saved and emails dispatched!", { id: toastId });
    } catch (error) {
      toast.error("Process failed. Check connection.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-sm font-medium text-slate-500">Syncing with Firestore...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Application Notifications</h1>
            <p className="text-slate-500 text-sm">Manage professional automated responses.</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
            Save & Blast Email
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
          <div 
            className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-colors ${isOpen ? 'bg-slate-50/50' : 'hover:bg-slate-50'}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${formData.isEnabled ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                <Mail size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Professional Auto-Reply</h3>
                <p className="text-[12px] text-slate-500">Standard candidate response template</p>
              </div>
            </div>
            <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 border-r pr-6 border-slate-200">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${formData.isEnabled ? 'text-blue-600' : 'text-slate-400'}`}>
                  {formData.isEnabled ? "Active" : "Paused"}
                </span>
                <Switch 
                  checked={formData.isEnabled} 
                  onCheckedChange={(val) => setFormData(prev => ({ ...prev, isEnabled: val }))}
                />
              </div>
              {isOpen ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronUp size={18} className="text-slate-400" />}
            </div>
          </div>

          {isOpen && (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[12px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                    <User size={14} /> Sender Name
                  </Label>
                  <Input 
                    value={formData.from} 
                    onChange={(e) => setFormData(prev => ({ ...prev, from: e.target.value }))} 
                    className="focus-visible:ring-blue-500 h-11"
                    placeholder="e.g. TFVC Admissions"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[12px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                    <Send size={14} /> Reply-To Address
                  </Label>
                  <Input 
                    value={formData.replyTo} 
                    onChange={(e) => setFormData(prev => ({ ...prev, replyTo: e.target.value }))} 
                    className="focus-visible:ring-blue-500 h-11"
                    placeholder="admissions@tfvc.edu.ph"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[12px] uppercase tracking-widest text-slate-500 font-bold">Email Subject Line</Label>
                <Input 
                  value={formData.subject} 
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))} 
                  className="focus-visible:ring-blue-500 h-11 font-medium"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[12px] uppercase tracking-widest text-slate-500 font-bold">Email Body (Markdown Support)</Label>
                <div className="group border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                  <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center gap-1">
                    <ToolbarBtn onClick={() => applyFormatting('# ', '')} icon={<Heading1 size={16} />} />
                    <ToolbarBtn onClick={() => applyFormatting('## ', '')} icon={<Heading2 size={16} />} />
                    <div className="w-px h-6 bg-slate-200 mx-1" />
                    <ToolbarBtn onClick={() => applyFormatting('**', '**')} icon={<Bold size={16} />} />
                    <ToolbarBtn onClick={() => applyFormatting('_', '_')} icon={<Italic size={16} />} />
                    <div className="w-px h-6 bg-slate-200 mx-1" />
                    <ToolbarBtn onClick={() => applyFormatting('\n- ', '')} icon={<List size={16} />} />
                    <ToolbarBtn onClick={() => applyFormatting('\n1. ', '')} icon={<ListOrdered size={16} />} />
                    <ToolbarBtn onClick={() => applyFormatting('\n> ', '')} icon={<Quote size={16} />} />
                  </div>
                  
                  <textarea 
                    ref={textareaRef}
                    className="w-full min-h-[350px] p-6 text-sm leading-relaxed outline-none resize-none"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  />
                  
                  <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span>Smart Tags: {"{applicant}"}, {"{position}"}</span>
                    <span>{formData.content.length} chars</span>
                  </div>
                </div>
              </div>
            </div>
          )}
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
      className="p-2 text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-sm rounded-md transition-all active:scale-95"
    >
      {icon}
    </button>
  )
}