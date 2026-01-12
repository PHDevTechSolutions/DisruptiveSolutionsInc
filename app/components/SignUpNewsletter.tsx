"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, ShoppingCart, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function SignUpNewsletter() {
  return (
    <div className="md:col-span-2 bg-white/5 backdrop-blur-lg rounded-[24px] p-6 border border-white/10 shadow-xl relative overflow-hidden group">
      
      {/* Subtle Background Glow */}
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#d11a2a]/10 rounded-full blur-[80px] group-hover:bg-[#d11a2a]/15 transition-all duration-1000" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6">
        
        {/* TEXT CONTENT */}
        <div className="flex-1">
          <h4 className="text-lg font-black uppercase tracking-tighter mb-1 text-white leading-tight">
            Project <span className="text-[#d11a2a]">Dashboard</span>
          </h4>
          <p className="text-gray-400 text-[11px] leading-snug max-w-sm mb-4">
            Track quotes, view history, and manage solutions in one place.
          </p>

          {/* COMPACT PROPOSITIONS */}
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
              <BarChart3 size={14} className="text-[#d11a2a]" />
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-200">Quotes</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
              <ShoppingCart size={14} className="text-[#d11a2a]" />
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-200">Orders</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
              <ShieldCheck size={14} className="text-[#d11a2a]" />
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-200">Logs</span>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="shrink-0 flex flex-col gap-3">
          <Link href="/auth">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center justify-center gap-3 bg-[#d11a2a] px-6 py-3 rounded-xl hover:bg-[#b11422] transition-all duration-300 w-full lg:w-auto"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-white">
                Get Started
              </span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-white" />
            </motion.button>
          </Link>
          
          <Link href="/auth?mode=login" className="text-center lg:text-left text-[9px] text-gray-500 font-black uppercase tracking-[0.1em] hover:text-white transition-colors">
            Partner <span className="text-white">Login</span>
          </Link>
        </div>

      </div>
    </div>
  );
}