"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  X,
  ArrowRight,
  ShieldCheck,
  FileSignature,
  Zap,
  User,
  LogOut,
} from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);

  const LOGO_RED = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-red-scaled.png";
  const LOGO_WHITE = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-white-scaled.png";

  const navLinks = [
    { name: "Home", href: "/dashboard" },
    { name: "Products & Solutions", href: "/lighting-products-smart-solutions" },
    { name: "Brands", href: "/trusted-technology-brands" },
    { name: "Contact", href: "/contact-us" },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserSession(user ? user : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("disruptive_user_session");
    window.location.reload();
  };

  return (
    <>
      {/* --- MOBILE NAV SIDEBAR --- */}
      <AnimatePresence>
        {isNavOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNavOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[2000] lg:hidden"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="fixed top-0 left-0 h-full w-[80%] bg-[#0a0a0a] z-[2001] lg:hidden flex flex-col shadow-2xl"
            >
              <div className="p-8 flex items-center justify-between border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
                <img src={LOGO_WHITE} alt="Logo" className="h-11 w-auto object-contain brightness-110" />
                <button
                  onClick={() => setIsNavOpen(false)}
                  className="w-10 h-10 flex items-center justify-center border border-white/10 rounded-full text-white/40 hover:text-white hover:bg-[#d11a2a] transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-grow py-4 px-2">
                {navLinks.map((link, idx) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsNavOpen(false)}
                    className="group flex items-center justify-between px-6 py-5 border-b border-white/5 relative overflow-hidden transition-all"
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <span className="text-[10px] font-mono text-[#d11a2a] opacity-50">0{idx + 1}</span>
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-white group-hover:translate-x-2 transition-transform">
                        {link.name}
                      </span>
                    </div>
                    <ArrowRight size={14} className="text-white/20 group-hover:text-[#d11a2a]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#d11a2a]/10 to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                  </Link>
                ))}

                {userSession && (
                  <div className="mt-8 px-6 space-y-4">
                    <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">Internal Systems</p>
                    <div className="grid gap-2">
                      <Link href="/catalog" className="flex items-center gap-3 text-[10px] font-bold text-white/70 uppercase tracking-widest hover:text-[#d11a2a]">
                        <FileSignature size={14} /> Catalog
                      </Link>
                      <Link href="/portal" className="flex items-center gap-3 text-[10px] font-bold text-white/70 uppercase tracking-widest hover:text-[#d11a2a]">
                        <ShieldCheck size={14} /> Client Portal
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-white/5 bg-white/[0.02]">
                <Link href="/quote" className="flex items-center justify-between group">
                  <span className="text-[11px] font-black uppercase tracking-widest text-white">Start a Project</span>
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#d11a2a] transition-all">
                    <Zap size={14} className="text-white fill-white" />
                  </div>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN DESKTOP NAVIGATION --- */}
      <nav className="fixed top-0 left-0 w-full z-[1000] py-4 transition-all duration-500">
        <motion.div
          animate={{
            backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0)",
            backdropFilter: isScrolled ? "blur(16px)" : "blur(0px)",
            height: isScrolled ? "70px" : "90px",
          }}
          className="absolute inset-0 -z-10"
        />

        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-full">
          <Link href="/">
            <motion.img
              animate={{ scale: isScrolled ? 0.85 : 1 }}
              src={isScrolled ? LOGO_RED : LOGO_WHITE}
              alt="Logo"
              className="h-10 md:h-12 w-auto object-contain transition-all"
            />
          </Link>

          {/* Desktop Menu Links */}
          <div className={`hidden lg:flex items-center gap-2 py-1.5 px-2 rounded-full border border-white/10 transition-all ${isScrolled ? "bg-black/5" : "bg-white/10"}`}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-5 py-2 text-[11px] font-black uppercase tracking-[0.15em] rounded-full transition-all hover:bg-[#d11a2a] hover:text-white ${isScrolled ? "text-gray-900" : "text-white"}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {userSession && (
              <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                <Link href="/catalog" className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 flex items-center gap-2 ${isScrolled ? "border-gray-200 text-gray-900" : "border-white/20 text-white"}`}>
                  <FileSignature size={14} className="text-[#d11a2a]" /> Catalog
                </Link>

                <div className="relative group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isScrolled ? "border-[#d11a2a] bg-red-50 text-[#d11a2a]" : "border-white/30 bg-white/10 text-white"}`}>
                    <User size={18} />
                  </div>
                  {/* Dropdown */}
                  <div className="absolute top-full right-0 mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[1001]">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                      <div className="p-5 bg-gray-50 border-b">
                        <p className="text-[9px] font-black text-[#d11a2a] uppercase tracking-widest italic">Active Partner</p>
                        <h4 className="text-sm font-black text-gray-900 truncate">{userSession.email}</h4>
                      </div>
                      <div className="p-2">
                        <Link href="/portal" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-gray-600">
                          <ShieldCheck size={16} /> <span className="text-[10px] font-black uppercase">Portal</span>
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-900 hover:text-white text-gray-400">
                          <LogOut size={16} /> <span className="text-[10px] font-black uppercase">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <Link href="/quote" className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl ${isScrolled ? "bg-[#d11a2a] text-white" : "bg-white text-gray-900"}`}>
              Free Quote
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button className="lg:hidden p-2" onClick={() => setIsNavOpen(true)}>
            <div className="space-y-1.5">
              <div className={`w-6 h-0.5 ${isScrolled ? "bg-black" : "bg-white"}`}></div>
              <div className={`w-4 h-0.5 ${isScrolled ? "bg-[#d11a2a]" : "bg-white/60"}`}></div>
            </div>
          </button>
        </div>
      </nav>
    </>
  );
}