"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import {
  BookOpen, Frame, GalleryVerticalEnd, SquareTerminal, Inbox, LayoutGrid
} from "lucide-react"

import { NavMain } from "../components/nav-main"
import { NavProjects } from "../components/nav-projects"
import { NavUser } from "../components/nav-user"
import { TeamSwitcher } from "../components/team-switcher"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ onNavigate, ...props }: any) {
  const [counts, setCounts] = useState({
    customer: 0,
    quotation: 0,
    job: 0,
    product: 0 
  })

  useEffect(() => {
    // Para sa Inquiries (customer, quotation, job), "unread" ang ginagamit mo
    const listenToInquiryCount = (type: string, key: string) => {
      const q = query(
        collection(db, "inquiries"), 
        where("type", "==", type), 
        where("status", "==", "unread") // Status para sa Inquiries
      );
      
      return onSnapshot(q, (snap) => {
        setCounts(prev => ({ ...prev, [key]: snap.size }));
      });
    };

    // Para sa Orders (product), "pending" ang ginagamit ng Panel mo
    const listenToProductCount = () => {
      const q = query(
        collection(db, "inquiries"), 
        where("type", "==", "product"), 
        where("status", "==", "pending") 
      );
      
      return onSnapshot(q, (snap) => {
        setCounts(prev => ({ ...prev, product: snap.size }));
      });
    };

    const unsubCustomer = listenToInquiryCount("customer", "customer");
    const unsubQuotation = listenToInquiryCount("quotation", "quotation");
    const unsubJob = listenToInquiryCount("job", "job");
    const unsubProduct = listenToProductCount();

    return () => {
      unsubCustomer();
      unsubQuotation();
      unsubJob();
      unsubProduct();
    };
  }, []);

  // Computation para sa main "Inquiries" menu badge
  const totalInquiries = counts.customer + counts.quotation + counts.job;

  const data = {
    user: { 
      name: "Admin User", 
      email: "admin@disruptive.com", 
      avatar: "/avatars/admin.jpg" 
    },
    teams: [
      { 
        name: "Disruptive Solutions Inc", 
        logo: GalleryVerticalEnd, 
        plan: "Enterprise" 
      },
    ],
    navMain: [
      {
        title: "Product",
        url: "#",
        icon: SquareTerminal,
        badge: counts.product > 0 ? counts.product : null,
        items: [
          
          { title: "All Product", url: "#" },
          { title: "Add new product", url: "#" },
          { 
            title: "Orders", 
            url: "#", 
            badge: counts.product > 0 ? counts.product : null 
          },
          { title: "Application", url: "#" },
          { title: "Category", url: "#" },
        ],
      },
      {
        title: "Inquiries",
        url: "#",
        icon: Inbox,
        // DITO ANG INDICATION: Pagsasama-samahin ang customer + quotation + job
        badge: totalInquiries > 0 ? totalInquiries : null, 
        items: [
          { 
            title: "Customer Inquiries", 
            url: "#", 
            badge: counts.customer > 0 ? counts.customer : null 
          },
          { 
            title: "Quotation", 
            url: "#", 
            badge: counts.quotation > 0 ? counts.quotation : null 
          },
          { 
            title: "Job Application", 
            url: "#", 
            badge: counts.job > 0 ? counts.job : null 
          },
        ],
      },
      {
        title: "Pages",
        url: "#",
        icon: BookOpen,
        items: [
          { title: "All Blogs", url: "#" },
          { title: "Careers", url: "#" },
          { title: "Catalog", url: "#" },
          { title: "Projects", url: "#" },
        ],
      },
    ],
    projects: [
      { name: "Design Engineering", url: "#", icon: Frame },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
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