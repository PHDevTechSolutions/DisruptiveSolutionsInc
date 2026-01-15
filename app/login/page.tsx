"use client"

import * as React from "react"
import { useState } from "react"
import { auth } from "@/lib/firebase" // Siguraduhin ang path ng firebase config mo
import { signInWithEmailAndPassword } from "firebase/auth"
import { useRouter } from "next/navigation"
import { 
  Lock, 
  Mail, 
  Loader2, 
  Eye, 
  EyeOff, 
  ShieldCheck 
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
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      return toast.error("Please fill in all fields")
    }

    setIsLoading(true)
    const loginToast = toast.loading("Authenticating...")

    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success("Welcome back!", { id: loginToast })
      
      // I-redirect sa Inventory page pagkatapos ng login
      setTimeout(() => {
        router.push("/admin-panel")
      }, 1000)
    } catch (error: any) {
      console.error(error)
      toast.error("Invalid credentials. Please try again.", { id: loginToast })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden px-4">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />

      <Card className="w-full max-w-md border-none shadow-2xl rounded-[32px] overflow-hidden bg-white/80 backdrop-blur-xl ring-1 ring-slate-200/50">
        <CardHeader className="pt-10 pb-6 text-center">
          <div className="mx-auto w-12 h-12 bg-[#d11a2a] rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 mb-4">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">
            TaskFlow Admin
          </CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Enter your credentials to manage inventory
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-10 px-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type="email" 
                  placeholder="admin@taskflow.com" 
                  className="pl-11 h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Password</Label>
                <button type="button" className="text-[9px] font-black uppercase text-blue-500 hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="pl-11 pr-11 h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#d11a2a] hover:bg-red-700 h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-red-500/20 transition-all active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Authorize Access"
              )}
            </Button>

            <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
              Protected by Enterprise-grade Security
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}