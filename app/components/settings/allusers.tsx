"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { db, auth } from "@/lib/firebase"
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from "firebase/firestore"
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"
import { 
  Users, Mail, Shield, Trash2, Search, Loader2, Lock, AlertTriangle 
} from "lucide-react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

export default function AllUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentUserRole, setCurrentUserRole] = useState("")
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<{id: string, name: string} | null>(null)
  const [adminPassword, setAdminPassword] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  // --- HELPER: EMAIL MASKING ---
  // Halimbawa: staffmember@gmail.com -> staffm****@gmail.com
  const maskEmail = (email: string) => {
    if (!email) return ""
    const [localPart, domain] = email.split("@")
    if (localPart.length <= 4) {
      return "****@" + domain // Pag masyadong maikli, mask lahat bago ang @
    }
    const visiblePart = localPart.slice(0, -4) // Kunin lahat maliban sa huling apat
    return `${visiblePart}****@${domain}`
  }

  useEffect(() => {
    const savedUser = localStorage.getItem("disruptive_admin_user")
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        setCurrentUserRole(parsed.role)
      } catch (e) {
        console.error("Storage error", e)
      }
    }

    const q = query(collection(db, "adminaccount"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setUsers(usersData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const filteredUsers = users.filter((user: any) => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openDeleteModal = (userId: string, fullName: string, role: string) => {
    if (role === 'admin') {
      return toast.error("Security Alert: Administrators cannot be deleted.")
    }
    setUserToDelete({ id: userId, name: fullName })
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!adminPassword) return toast.error("Enter your password to authorize.")
    setIsDeleting(true)
    const deleteToast = toast.loading("Processing request...")

    try {
      const user = auth.currentUser
      if (!user || !user.email) throw new Error("Session expired.")
      const credential = EmailAuthProvider.credential(user.email, adminPassword)
      await reauthenticateWithCredential(user, credential)

      if (userToDelete) {
        await deleteDoc(doc(db, "adminaccount", userToDelete.id))
        toast.success(`Account of ${userToDelete.name} deleted.`, { id: deleteToast })
      }
      setIsDeleteModalOpen(false)
      setUserToDelete(null)
      setAdminPassword("")
    } catch (error: any) {
      toast.error(error.code === "auth/wrong-password" ? "Invalid admin password." : "Deletion failed.", { id: deleteToast })
    } finally {
      setIsDeleting(false)
    }
  }

  if (currentUserRole === 'warehouse' || currentUserRole === 'staff') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
          <Shield className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Access Restricted</h2>
        <p className="text-slate-500 text-sm max-w-xs mt-2">Only Administrators can manage the staff directory.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Card className="border-none shadow-2xl rounded-[32px] bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 pb-6 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-100">
                <Users className="text-white w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">Staff Directory</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                  {users.length} Total Internal Accounts
                </CardDescription>
              </div>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Filter identity..." 
                className="pl-12 h-12 rounded-2xl border-none bg-white shadow-inner text-xs font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-red-600" />
              <span className="text-[10px] font-black uppercase text-slate-400">Syncing...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/30">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-[10px] font-black uppercase px-8 py-4 text-slate-400">User Identity</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-center text-slate-400">System Role</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-right px-8 text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: any) => (
                    <TableRow key={user.id} className="hover:bg-slate-50/50 border-slate-50 transition-all">
                      <TableCell className="px-8 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm uppercase">{user.fullName}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                            <Mail size={10} className="text-slate-300" /> 
                            {/* DITO NATIN GINAMIT ANG MASKING */}
                            {maskEmail(user.email)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={user.role === 'admin' ? "destructive" : "secondary"} 
                          className="rounded-lg uppercase text-[9px] px-3 py-1 font-black tracking-widest"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openDeleteModal(user.id, user.fullName, user.role)}
                          className="hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                          disabled={user.role === 'admin'}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DELETE DIALOG (Same as before) */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="rounded-[40px] max-w-sm border-none shadow-2xl p-8 bg-white">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center">
              <AlertTriangle className="text-red-600 w-8 h-8" />
            </div>
            <div className="text-center">
              <DialogTitle className="text-xl font-black uppercase tracking-tighter">Confirm Termination</DialogTitle>
              <DialogDescription className="text-[10px] font-medium text-slate-500 uppercase mt-2">
                Permanently removing <span className="font-bold text-slate-900">{userToDelete?.name}</span>
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="py-6 space-y-3">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Admin Security Key</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                type="password"
                placeholder="Required"
                className="pl-11 h-14 rounded-2xl border-none bg-slate-100 font-bold focus-visible:ring-red-500"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-3">
            <Button 
              onClick={handleConfirmDelete}
              disabled={isDeleting || !adminPassword}
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase text-xs h-14"
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : "Authorize Deletion"}
            </Button>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} className="w-full rounded-2xl text-[10px] font-bold uppercase text-slate-400">Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}