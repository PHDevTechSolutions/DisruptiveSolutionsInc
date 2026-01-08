"use client"

import * as React from "react"
import { useState } from "react"
import { AppSidebar } from "../components/app-sidebar"
import { AllProducts } from "../components/products/AllProducts"
import AddNewProduct from "../components/products/AddnewProduct"
import InquiriesPanel from "../components/products/InquiriesPanel"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function Page() {
  // Eto ang state na titingin kung ano ang dapat i-render
  const [activeView, setActiveView] = useState("all-products")

  // Function para i-render ang tamang component base sa state
  const renderContent = () => {
    switch (activeView) {
      case "All Product":
        return <AllProducts />
      case "Inquiries": // <--- Idagdag ito
      return <InquiriesPanel />
      case "Add new product":
        return <AddNewProduct />
      default:
        return <AllProducts /> // Default view
    }
  }

  return (
    <SidebarProvider>
      {/* Ipasa ang setActiveView sa Sidebar */}
      <AppSidebar onNavigate={(view) => setActiveView(view)} />
      
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="capitalize">
                  {activeView.replace("-", " ")}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Dito lalabas ang Dashboard Components */}
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 p-6 md:min-h-min">
            {renderContent()}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}