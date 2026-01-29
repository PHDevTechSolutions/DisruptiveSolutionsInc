"use client"

import * as React from "react"
import { useState } from "react"
import { getDoc, doc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase" 
import { signInWithEmailAndPassword, signOut } from "firebase/auth"
import { Lock, Mail, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react"
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
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill in all fields");

    setIsLoading(true);
    const loginToast = toast.loading("Checking Internal Access...");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Kunin ang doc gamit ang UID
      const userDoc = await getDoc(doc(db, "adminaccount", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // --- POWERFUL NORMALIZATION ---
        // Hahanapin natin ang 'role' kahit 'Role' o 'ROLE' ang pagkaka-save
        const entries = Object.entries(userData);
        const roleEntry = entries.find(([key]) => key.toLowerCase() === "role");
        const statusEntry = entries.find(([key]) => key.toLowerCase() === "status");

        const rawRole = roleEntry ? String(roleEntry[1]) : "";
        const rawStatus = statusEntry ? String(statusEntry[1]) : "";

        const userRole = rawRole.toLowerCase().trim();
        const userStatus = rawStatus.toLowerCase().trim();

        // LOGGING para makita mo sa console kung anong nakuha natin
        console.log("🔥 DATABASE CHECK:", { 
          uid: user.uid, 
          detectedRole: userRole, 
          detectedStatus: userStatus 
        });

        if (userStatus !== "active") {
          throw new Error("account_disabled");
        }

        // Listahan ng mga valid roles para sa CMS
        const validRoles = ["admin", "warehouse", "staff", "inventory"];

        if (validRoles.includes(userRole)) {
          document.cookie = "admin_session=true; path=/; max-age=3600; SameSite=Strict";

          localStorage.setItem("disruptive_admin_user", JSON.stringify({
            uid: user.uid,
            name: userData.fullName || userData.name || "Internal Staff",
            email: user.email,
            role: userRole,
            accessLevel: userData.accessLevel || (userRole === "admin" ? "full" : "staff")
          }));

          toast.success(`Access Authorized: ${userRole.toUpperCase()}`, { id: loginToast });
          setTimeout(() => window.location.href = "/admin-panel", 1000);
        } else {
          // Dito siya bumabagsak kaya lumalabas ang error mo
          console.error("❌ Invalid Role Detected:", userRole);
          throw new Error("unauthorized_role");
        }
      } else {
        console.error("❌ Document does not exist in 'adminaccount' for UID:", user.uid);
        throw new Error("user_not_found");
      }
    } catch (error: any) {
      await signOut(auth);
      // Cleanup
      document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      localStorage.removeItem("disruptive_admin_user");

      if (error.message === "unauthorized_role") {
        toast.error("Access Denied: Your account role is not recognized.", { id: loginToast });
      } else if (error.message === "user_not_found") {
        toast.error("Access Denied: No CMS profile found for this email.", { id: loginToast });
      } else if (error.code === "auth/invalid-credential") {
        toast.error("Invalid email or password.", { id: loginToast });
      } else {
        toast.error(error.message || "An error occurred.", { id: loginToast });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[32px] bg-white/80 backdrop-blur-xl">
        <CardHeader className="text-center pt-10">
          <div className="mx-auto w-14 h-14 bg-[#d11a2a] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-100">
            <ShieldCheck className="text-white w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-black italic uppercase tracking-tighter text-slate-800">CMS PANEL</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Internal System Access</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-10 pt-4">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Staff Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="pl-11 h-12 rounded-2xl border-slate-100 bg-slate-50/50" 
                  placeholder="name@disruptive.com" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="pl-11 pr-11 h-12 rounded-2xl border-slate-100 bg-slate-50/50" 
                  placeholder="••••••••" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-[#d11a2a] hover:bg-red-700 h-14 rounded-2xl font-black uppercase tracking-widest text-xs"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize Access"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}