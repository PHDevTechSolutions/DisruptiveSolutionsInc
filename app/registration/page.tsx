"use client"

import * as React from "react"
import { useState } from "react"
import { auth, db } from "@/lib/firebase" // Idagdag ang db
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore" // Idagdag ito
import { useRouter } from "next/navigation"
import { UserPlus, Mail, Lock, User, Loader2, ArrowLeft, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import Link from "next/link"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("warehouse") // Default to warehouse
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !fullName || !role) return toast.error("Please fill in all fields")
    if (password.length < 5) return toast.error("Password must be at least 5 characters")

    setIsLoading(true)
    const regToast = toast.loading(`Provisioning ${role.toUpperCase()} account...`)

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // 2. Update Auth Profile
      await updateProfile(user, { displayName: fullName })

      // 3. Save DIRECTLY to adminaccount (Para iwas "customer" role bug)
      await setDoc(doc(db, "adminaccount", user.uid), {
        uid: user.uid,
        email: email,
        fullName: fullName,
        role: role, // 'admin' or 'warehouse'
        accessLevel: role === "admin" ? "full" : "staff",
        status: "active",
        website: "disruptivesolutionsinc",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      })

      toast.success("Account Authorized!", { id: regToast })
      setTimeout(() => router.push("/login"), 1500)

    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Registration failed.", { id: regToast })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[32px] bg-white/80 backdrop-blur-xl">
        <CardHeader className="pt-10 pb-6 text-center relative">
          <Link href="/login" className="absolute left-6 top-10 text-slate-400 hover:text-slate-600 transition-colors"><ArrowLeft size={20} /></Link>
          <div className="mx-auto w-12 h-12 bg-[#d11a2a] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-100">
            <UserPlus className="text-white w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">Internal Access</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Provisioning Authorized Staff & Admins</CardDescription>
        </CardHeader>

        <CardContent className="pb-10 px-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-400">Full Name</Label>
              <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Juan Dela Cruz" className="pl-11 h-12 rounded-2xl" value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-400">Account Role</Label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <Select onValueChange={(value) => setRole(value)} defaultValue={role}>
                  <SelectTrigger className="pl-11 h-12 rounded-2xl"><SelectValue placeholder="Select Role" /></SelectTrigger>
                  <SelectContent><SelectItem value="admin">Administrator</SelectItem><SelectItem value="warehouse">Warehouse Staff</SelectItem></SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-400">Email</Label>
              <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input type="email" placeholder="staff@disruptive.com" className="pl-11 h-12 rounded-2xl" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-400">Password</Label>
              <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input type="password" placeholder="••••••••" className="pl-11 h-12 rounded-2xl" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-[#d11a2a] h-14 rounded-2xl font-black uppercase tracking-widest text-xs mt-4">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}