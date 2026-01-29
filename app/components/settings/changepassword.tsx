"use client"

import * as React from "react"
import { useState } from "react"
import { auth } from "@/lib/firebase"
import { 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from "firebase/auth"
import { 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Loader2, 
  ShieldCheck 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Basic Validations
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error("Pakisulat ang lahat ng fields.")
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Hindi magtugma ang new password at confirm password.")
    }
    if (newPassword.length < 6) {
      return toast.error("Dapat hindi bababa sa 6 characters ang password.")
    }

    setIsLoading(true)
    const passToast = toast.loading("Updating password...")

    try {
      const user = auth.currentUser
      if (!user || !user.email) throw new Error("No user found")

      // 2. Re-authentication (Security Requirement ng Firebase)
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)

      // 3. Update the Password
      await updatePassword(user, newPassword)

      toast.success("Password updated successfully!", { id: passToast })
      
      // Clear inputs
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      console.error(error)
      if (error.code === "auth/wrong-password") {
        toast.error("Mali ang iyong 'Current Password'.", { id: passToast })
      } else {
        toast.error("Failed to update password. Try again.", { id: passToast })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="border-none shadow-xl rounded-[24px] overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-8">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mb-4">
            <KeyRound className="text-white w-6 h-6" />
          </div>
          <CardTitle className="text-xl font-black uppercase tracking-tight">Security Settings</CardTitle>
          <CardDescription className="text-xs font-bold uppercase text-slate-400">Update your administrator credentials</CardDescription>
        </CardHeader>

        <CardContent className="pt-8">
          <form onSubmit={handleChangePassword} className="space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type={showPass ? "text" : "password"}
                  placeholder="Enter current password"
                  className="pl-11 h-12 rounded-xl border-slate-100"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* New Password */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">New Password</Label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type={showPass ? "text" : "password"}
                  placeholder="At least 6 characters"
                  className="pl-11 h-12 rounded-xl border-slate-100"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Confirm New Password</Label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type={showPass ? "text" : "password"}
                  placeholder="Repeat new password"
                  className="pl-11 h-12 rounded-xl border-slate-100"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 h-12 rounded-xl font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-slate-200"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}