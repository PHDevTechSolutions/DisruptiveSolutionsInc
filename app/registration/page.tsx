"use client"

import * as React from "react"
import { useState } from "react"
import { auth, db } from "@/lib/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Loader2, 
  ShieldAlert,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // --- VALIDATIONS ---
    if (!email || !password || !fullName) {
      return toast.error("Please fill in all fields")
    }
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters")
    }

    setIsLoading(true)
    const regToast = toast.loading("Creating admin account...")

    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // 2. Save Additional Info in Firestore (Optional but recommended)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: fullName,
        email: email,
        role: "admin", // Default role
        createdAt: serverTimestamp()
      })

      toast.success("Account created successfully!", { id: regToast })
      
      // Redirect to Dashboard
      setTimeout(() => {
        router.push("/login")
      }, 1500)

    } catch (error: any) {
      console.error(error)
      if (error.code === 'auth/email-already-in-use') {
        toast.error("Email is already registered", { id: regToast })
      } else {
        toast.error("Registration failed. Try again.", { id: regToast })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden px-4 py-10">
      {/* Background Decor */}
      <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-red-500/5 rounded-full blur-[100px]" />

      <Card className="w-full max-w-md border-none shadow-2xl rounded-[32px] overflow-hidden bg-white/80 backdrop-blur-xl ring-1 ring-slate-200/50">
        <CardHeader className="pt-10 pb-6 text-center relative">
          <Link href="/login" className="absolute left-6 top-10 text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mb-4">
            <UserPlus className="text-white w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">
            Create Admin
          </CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Register a new authorized manager
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-10 px-8">
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type="text" 
                  placeholder="John Doe" 
                  className="pl-11 h-12 rounded-2xl border-slate-100 bg-slate-50/50"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type="email" 
                  placeholder="admin@taskflow.com" 
                  className="pl-11 h-12 rounded-2xl border-slate-100 bg-slate-50/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-11 h-12 rounded-2xl border-slate-100 bg-slate-50/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl transition-all active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100 mt-4">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[9px] font-medium text-amber-800 leading-tight">
                By registering, you are granting this account administrative access to the product inventory and sensitive data.
              </p>
            </div>
          </form>

          <p className="text-center mt-6 text-[10px] font-bold text-slate-400 uppercase">
            Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign In</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}