"use client"

import * as React from "react"
import {
  AudioWaveform, BookOpen, Bot, Command, Frame,
  GalleryVerticalEnd, Map, PieChart, Settings2, SquareTerminal,Inbox
} from "lucide-react"

import { NavMain } from "../components/nav-main"
import { NavProjects } from "../components/nav-projects"
import { NavUser } from "../components/nav-user"
import { TeamSwitcher } from "../components/team-switcher"
import {
  Sidebar, SidebarContent, SidebarFooter,
  SidebarHeader, SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: { name: "shadcn", email: "m@example.com", avatar: "/avatars/shadcn.jpg" },
  teams: [
    { name: "Disruptive Solutions Inc", logo: GalleryVerticalEnd, plan: "Enterprise" },
  ],
  navMain: [
    {
      title: "Product",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: "All Product", url: "#" },
        { title: "Add new product", url: "#" },
        { 
          title: "Inquiries", 
          url: "#",      // <--- Dagdagan nito
          icon: Inbox     // <--- Gagana na ito dahil sa change sa NavMain
        },
      ],
    },
    // ... ibang menu items mo
  ],
  projects: [
    { name: "Design Engineering", url: "#", icon: Frame },
  ],
}

// Siguraduhin na ang onNavigate ay kasama sa props
export function AppSidebar({ 
  onNavigate, 
  ...props 
}: React.ComponentProps<typeof Sidebar> & { onNavigate: (view: string) => void }) {
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {/* Mahalaga: I-pass ang onNavigate dito */}
        <NavMain items={data.navMain} onNavigate={onNavigate} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}