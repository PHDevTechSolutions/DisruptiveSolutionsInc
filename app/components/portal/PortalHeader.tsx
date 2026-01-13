"use client";

import React from "react";
import { ChevronRight, User } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  userData: any;
}

export default function PortalHeader({ activeTab, userData }: HeaderProps) {
  return (
    <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0a]/40 backdrop-blur-xl shrink-0">
      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
        <span>Portal</span>
        <ChevronRight size={14} />
        <span className="text-white">{activeTab}</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none">{userData?.fullName || "User"}</p>
            <p className="text-[8px] text-[#d11a2a] font-bold uppercase tracking-widest mt-1">
              {userData?.role || "Authorized Access"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-white/50">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}