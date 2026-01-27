"use client"

import { LogOut, ChevronsUpDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { toast } from "sonner"

export function NavUser({ user }: { user: { name: string; email: string; avatar: string } }) {
  const { isMobile } = useSidebar()

  const handleLogout = async () => {
    try {
      // 1. Firebase Sign Out
      await signOut(auth)

      // 2. BURAHIN ANG COOKIE (para sa Middleware)
      document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

      // 3. BURAHIN ANG LOCAL STORAGE
      // Pwedeng specific key lang:
      localStorage.removeItem("disruptive_admin_user");
      // O kung gusto mo lahat talaga burado:
      // localStorage.clear();
      
      toast.success("Logged out successfully")
      
      // 4. HARD REDIRECT
      // Gamit ang window.location.href para siguradong fresh state ang app
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Logout failed")
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <Avatar className="h-8 w-8 rounded-lg border border-slate-200 shadow-sm">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-bold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight font-medium">
                <span className="truncate">{user.name}</span>
                <span className="truncate text-[10px] text-slate-400 font-normal tracking-tight">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-slate-400" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-56 rounded-xl shadow-xl border-slate-100 p-1.5" 
            side={isMobile ? "bottom" : "right"} 
            align="end"
            sideOffset={12}
          >
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-lg px-3 py-2 transition-colors font-medium"
            >
              <LogOut className="mr-2 size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}