"use client"

import * as React from "react"
import { useState } from "react"
import { AppSidebar } from "../components/app-sidebar"
import { AllProducts } from "../components/products/AllProducts"
import AddNewProduct from "../components/products/AddnewProduct";
import InquiriesPanel from "../components/inquiries/QuoteInquiries"
import CareersManager from "../components/pages/CareersManager"
import BlogManager from "../components/pages/BlogManager" 
import ApplicationInquiries from "../components/inquiries/JobApplication"
import CustomerInquiries from "../components/inquiries/CustomerInquiries" 
import Quotation from "../components/inquiries/Quotation" 
import Categories from "../components/products/Category";
import Application from "../components/products/Application";
import CatalogManager from "../components/pages/CatalogManager"
import ProjectManager from "../components/pages/ProjectManager"
import BrandsManager from "../components/pages/BrandsManager"
import PartnersManager from "../components/pages/PartnersManager"
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
  // Gamitin natin ang activeView at setActiveView consistently
  const [activeView, setActiveView] = useState("All Product")

  // Tama na ang type definition dito para mawala ang Error 7006
  const handleNavigate = (view: string) => { 
    setActiveView(view)
  }

  const renderContent = () => {
    switch (activeView) {
      case "All Product":
        return <AllProducts />
      case "Orders":
        return <InquiriesPanel />
      case "Job Application":
        return <ApplicationInquiries />
      case "Add new product":
        return <AddNewProduct />
      case "Quotation":
        return <Quotation />
      case "Careers": 
        return <CareersManager />
              case "Projects": 
        return <ProjectManager />
      case "Catalog": 
        return <CatalogManager />
      case "Brands": 
        return <BrandsManager />
            case "Partners": 
        return <PartnersManager />
      case "Customer Inquiries": 
        return <CustomerInquiries />
              case "Application": 
        return <Application />
      case "All Blogs": 
        return <BlogManager />
            case "Category": 
        return <Categories />
      default:
        return <AllProducts />
    }
  }

  return (
    <SidebarProvider>
      {/* I-pass ang handleNavigate function */}
      <AppSidebar onNavigate={handleNavigate} />
      
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="capitalize font-black italic tracking-tighter text-[#d11a2a]">
                  {activeView}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="min-h-[100vh] flex-1 rounded-[2rem] bg-white p-6 md:min-h-min shadow-sm border border-gray-100">
            {renderContent()}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}