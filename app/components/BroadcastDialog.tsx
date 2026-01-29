"use client"

import React, { useState, useEffect, useRef } from "react"
import { 
  Bold, Italic, List, Quote, Loader2, Mail, User, Send, 
  Heading1, Heading2, Plus, Trash2, MailPlus, Database
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore"

export default function BroadcastDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
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

  // Load settings once the dialog opens
  useEffect(() => {
    if (open) {
      const fetchSettings = async () => {
        try {
          const docRef = doc(db, "settings", "emailConfig");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) setFormData(docSnap.data() as any);
        } catch (error) {
          toast.error("Failed to load email settings.");
        } finally {
          setLoading(false);
        }
      };
      fetchSettings();
    }
  }, [open]);

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
    const manualEmails = extraRecipients.map(e => e.trim()).filter(e => e !== "" && e.includes("@"));
    const replyToEmail = formData.replyTo.trim();
    
    if (!includeDbUsers && manualEmails.length === 0 && (!replyToEmail || !replyToEmail.includes("@"))) {
      toast.error("No recipients found.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Sending broadcast...");

    try {
      const settingsRef = doc(db, "settings", "emailConfig");
      await setDoc(settingsRef, formData, { merge: true });

      let finalRecipientList: string[] = [];
      if (includeDbUsers) {
        const querySnapshot = await getDocs(collection(db, "users"));
        finalRecipientList = querySnapshot.docs.map(doc => doc.data().email).filter(e => e?.includes("@"));
      }
      if (replyToEmail && replyToEmail.includes("@")) finalRecipientList.push(replyToEmail);
      finalRecipientList = Array.from(new Set([...finalRecipientList, ...manualEmails]));

      const res = await fetch('/api/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recipients: finalRecipientList })
      });

      if (!res.ok) throw new Error("Dispatch failed");
      
      toast.success(`Success! Sent to ${finalRecipientList.length} recipients.`, { id: toastId });
      setOpen(false); // Close dialog on success
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 rounded-xl">
          <Send size={16} /> Execute Broadcast
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] p-0 border-none shadow-2xl">
        <div className="bg-[#fcfcfd] min-h-full">
          {/* Internal Header */}
          <div className="px-8 py-6 border-b bg-white flex items-center justify-between sticky top-0 z-10">
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">Communication Center</DialogTitle>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Broadcast Management Protocol</p>
            </div>
            <div className="flex items-center gap-4">
               <Button onClick={handleSave} disabled={isSaving || loading} size="sm" className="bg-blue-600 font-bold px-6">
                {isSaving ? <Loader2 className="animate-spin mr-2" size={14} /> : <Send className="mr-2" size={14} />}
                Send Now
              </Button>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Identity Group */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</Label>
                <Input value={formData.from} onChange={(e) => setFormData(p => ({ ...p, from: e.target.value }))} className="h-11 rounded-xl bg-white border-slate-200" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To:</Label>
                  <button onClick={() => setShowManualRecipients(!showManualRecipients)} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1">
                    <MailPlus size={12}/> {showManualRecipients ? "Hide Manual" : "Add Direct"}
                  </button>
                </div>
                <Input value={formData.replyTo} onChange={(e) => setFormData(p => ({ ...p, replyTo: e.target.value }))} className="h-11 rounded-xl bg-white border-slate-200" />
              </div>
            </div>

            {/* Manual List Expansion */}
            {showManualRecipients && (
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3 animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-blue-600 uppercase"></span>
                  <Button onClick={addEmailField} variant="ghost" size="sm" className="h-6 text-[9px] font-bold">Add Field</Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {extraRecipients.map((email, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input value={email} onChange={(e) => updateEmailField(idx, e.target.value)} className="h-9 bg-white text-xs" placeholder="email@test.com" />
                      <button onClick={() => removeEmailField(idx)} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Line</Label>
              <Input value={formData.subject} onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))} className="h-11 rounded-xl font-bold" />
            </div>

            {/* Editor */}
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message Body</Label>
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">

              <textarea 
                ref={textareaRef} 
                className="w-full min-h-[250px] p-6 text-sm outline-none resize-none font-medium text-slate-700" 
                value={formData.content} 
                onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))} 
              />
              <div className="px-4 py-2 bg-slate-50 border-t flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase">
                <span>Status: {includeDbUsers ? "Broadcast Active" : "Manual Only"}</span>
                <span>{formData.content.length} chars</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ToolbarBtn({ icon, onClick }: { icon: React.ReactNode, onClick: () => void }) {
  return <button type="button" onClick={onClick} className="p-2 text-slate-500 hover:bg-white hover:text-blue-600 rounded-lg transition-all">{icon}</button>
}