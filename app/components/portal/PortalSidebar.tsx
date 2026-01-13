"use client";

import React from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, FileText, Settings, LogOut } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setOpen: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (val: string) => void;
  handleLogout: () => void;
}

export default function PortalSidebar({ isOpen, setOpen, activeTab, setActiveTab, handleLogout }: SidebarProps) {
  return (
    <aside className={`fixed lg:relative z-50 h-screen transition-all duration-500 border-r border-white/5 bg-[#0a0a0a] flex flex-col ${isOpen ? "w-72" : "w-20"}`}>
      <div className="p-8 flex items-center justify-between">
        <h2 className={`font-black italic tracking-tighter transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 hidden"}`}>
          DISRUPTIVE <span className="text-[#d11a2a]">OS</span>
        </h2>
        <button onClick={() => setOpen(!isOpen)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[#d11a2a]">
          <LayoutDashboard size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <NavItem icon={LayoutDashboard} label="Overview" active={activeTab === "overview"} isOpen={isOpen} onClick={() => setActiveTab("overview")} />
        <NavItem icon={FileText} label="Quotations" active={activeTab === "quotes"} isOpen={isOpen} onClick={() => setActiveTab("quotes")} />
        <NavItem icon={Settings} label="Security Settings" active={activeTab === "settings"} isOpen={isOpen} onClick={() => setActiveTab("settings")} />
      </nav>

      <div className="p-6 border-t border-white/5">
        <button onClick={handleLogout} className="flex items-center gap-4 text-gray-500 hover:text-[#d11a2a] transition-all group overflow-hidden w-full">
          <LogOut size={20} className="shrink-0 group-hover:rotate-12 transition-transform" />
          <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 hidden"}`}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}

function NavItem({ icon: Icon, label, active, isOpen, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all relative group ${active ? "bg-[#d11a2a] text-white shadow-xl shadow-[#d11a2a]/20" : "text-gray-500 hover:bg-white/5 hover:text-white"}`}>
      <Icon size={20} className="shrink-0" />
      <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-opacity duration-300 whitespace-nowrap ${isOpen ? "opacity-100" : "opacity-0 hidden"}`}>
        {label}
      </span>
      {active && <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />}
    </button>
  );
}