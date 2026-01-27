"use client"

import * as React from "react"
import { useState } from "react"
import { getDoc, doc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase" 
import { signInWithEmailAndPassword, signOut } from "firebase/auth"
import { 
  Lock, Mail, Loader2, Eye, EyeOff, ShieldCheck 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return toast.error("Please fill in all fields")

    setIsLoading(true)
    const loginToast = toast.loading("Authenticating Admin...")

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      const userDoc = await getDoc(doc(db, "adminaccount", user.uid))
      
      if (userDoc.exists() && userDoc.data().role === "admin") {
        const adminData = userDoc.data();

        // --- 1. SET COOKIE (Para sa Middleware) ---
        document.cookie = "admin_session=true; path=/; max-age=3600; SameSite=Strict";

        // --- 2. STORE TO LOCALSTORAGE ---
        // Sine-save natin as string para madaling i-parse mamaya
        localStorage.setItem("disruptive_admin_user", JSON.stringify({
          uid: user.uid,
          name: adminData.name || "Admin",
          email: user.email,
          avatar: adminData.avatar || "", // Fallback kung walang picture
          role: adminData.role
        }));

        toast.success("Welcome, Admin! Access Granted.", { id: loginToast })
        
        setTimeout(() => {
          window.location.href = "/admin-panel" 
        }, 1500)
      } else {
        await signOut(auth) 
        document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        localStorage.removeItem("disruptive_admin_user"); // Linisin para sigurado
        toast.error("Access Denied: Administrators only.", { id: loginToast })
      }
    } catch (error: any) {
      toast.error("Invalid credentials.", { id: loginToast })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[32px] bg-white/80 backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-[#d11a2a] rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-black italic uppercase tracking-tighter">CMS PANEL</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Manage your inventory</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-10">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-11 h-12 rounded-2xl" placeholder="admin@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-11 pr-11 h-12 rounded-2xl" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-[#d11a2a] hover:bg-red-700 h-14 rounded-2xl font-black uppercase tracking-widest text-xs">
              {isLoading ? <Loader2 className="animate-spin" /> : "Authorize Access"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}