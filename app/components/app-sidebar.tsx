"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore"
import {
  BookOpen, Frame, GalleryVerticalEnd, SquareTerminal, Inbox,
  LayoutGrid, MessageSquareDot, BellRing, Briefcase,
  SettingsIcon
} from "lucide-react"

import { NavMain } from "../components/nav-main"
import { NavProjects } from "../components/nav-projects"
import { NavUser } from "../components/nav-user"
import { TeamSwitcher } from "../components/team-switcher"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ onNavigate, ...props }: any) {
  const [mounted, setMounted] = useState(false)
  const [adminUser, setAdminUser] = useState({
    name: "User",
    email: "",
    avatar: "",
    role: "admin" // Default muna habang loading
  })

  const [counts, setCounts] = useState({
    customer: 0,
    quotation: 0,
    job: 0,
    product: 0,
    messenger: 0
  })

  useEffect(() => {
    setMounted(true)

    // --- 1. GET USER DATA & ROLE ---
    const savedUser = localStorage.getItem("disruptive_admin_user")
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        setAdminUser({
          name: parsed.name || "Admin User",
          email: parsed.email || "",
          avatar: parsed.avatar || "",
          role: parsed.role || "admin"
        })
      } catch (err) {
        console.error("Error parsing user data:", err)
      }
    }

    // --- 2. FIREBASE LISTENERS ---
    const listenToInquiryCount = (type: string, key: string) => {
      const q = query(
        collection(db, "inquiries"),
        where("type", "==", type),
        where("status", "==", "unread")
      );
      return onSnapshot(q, (snap) => {
        setCounts(prev => ({ ...prev, [key]: snap.size }));
      });
    };

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

    const listenToMessenger = () => {
      const q = query(
        collection(db, "chats"),
        where("website", "==", "disruptivesolutionsinc"),
        orderBy("timestamp", "desc")
      );

      return onSnapshot(q, (snapshot) => {
        const unreadThreads = new Set();
        const latestPerClient: Record<string, any> = {};

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (!latestPerClient[data.senderEmail]) {
            latestPerClient[data.senderEmail] = data;
          }
        });

        Object.values(latestPerClient).forEach((msg: any) => {
          if (msg.isAdmin === false) {
            unreadThreads.add(msg.senderEmail);
          }
        });

        setCounts(prev => ({ ...prev, messenger: unreadThreads.size }));
      });
    };

    const unsubCustomer = listenToInquiryCount("customer", "customer");
    const unsubQuotation = listenToInquiryCount("quotation", "quotation");
    const unsubJob = listenToInquiryCount("job", "job");
    const unsubProduct = listenToProductCount();
    const unsubMessenger = listenToMessenger();

    return () => {
      unsubCustomer();
      unsubQuotation();
      unsubJob();
      unsubProduct();
      unsubMessenger();
    };
  }, []);

  const totalInquiries = counts.customer + counts.quotation  + counts.messenger;
  const total = counts.job ;
  // Shortcut para sa role check
  const isSales = adminUser.role === "warehouse";

  // --- 3. DYNAMIC SIDEBAR DATA ---
  const sidebarData = {
    user: adminUser,
    teams: [
      {
        name: "Disruptive Solutions Inc",
        logo: GalleryVerticalEnd,
        plan: isSales ? "Guest (Warehouse)" : "Enterprise (Admin)"
      },
    ],
    navMain: [
      {
        title: "Product",
        url: "#",
        icon: SquareTerminal,
        badge: (!isSales && counts.product > 0) ? counts.product : null,
        items: isSales 
          ? [
              { title: "All Product", url: "#" },
              { title: "Add new product", url: "#" },
            ]
          : [
            // { title: "Bulk Product", url: "#" },
              { title: "All Product", url: "#" },
              { title: "Add new product", url: "#" },
              { title: "Orders", url: "#", badge: counts.product > 0 ? counts.product : null },
              { title: "Category", url: "#" },
              { title: "Specifications Maintenance", url: "#" },
              { title: "Application", url: "#" },
              { title: "Reviews", url: "#" },
            ],
      },
      // Itago itong mga sections na ito kung Sales (Guest)
      ...(!isSales ? [
        {
          title: "Inquiries",
          url: "#",
          icon: Inbox,
          badge: totalInquiries > 0 ? totalInquiries : null,
          items: [
            { title: "Messenger", url: "#", icon: MessageSquareDot, badge: counts.messenger > 0 ? counts.messenger : null },
            { title: "Customer Inquiries", url: "#", badge: counts.customer > 0 ? counts.customer : null },
            { title: "Quotation", url: "#", badge: counts.quotation > 0 ? counts.quotation : null },
          ],
        },
        {
          title: "Job Openings",
          url: "#",
          icon: Briefcase,
           badge: total > 0 ? total : null,
          items: [
            { title: "Job Application", url: "#", badge: counts.job > 0 ? counts.job : null },
            { title: "Notification", url: "#" },
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
            { title: "Brands", url: "#" },
            { title: "Partners", url: "#" },
            { title: "HomePopup", url: "#" },
            { title: "Contact Info", url: "#" },
            { title: "Faq Settings", url: "#" },
          ],
        },
      ] : []),

      // Settings Section: Visible sa lahat pero filtered ang items base sa role
      {
        title: "Settings",
        url: "#",
        icon: SettingsIcon,
        items: isSales 
          ? [
              { title: "Change Password", url: "#" }, // Guest/Sales can only see this
            ]
          : [
              { title: "All Users", url: "#" },      // Admin can see both
              { title: "Change Password", url: "#" },
            ],
      },
    ],
    projects: isSales ? [] : [
      { name: "Design Engineering", url: "#", icon: Frame },
    ],
  }

  if (!mounted) return null;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} onNavigate={onNavigate} />
        {sidebarData.projects.length > 0 && (
          <NavProjects projects={sidebarData.projects} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}