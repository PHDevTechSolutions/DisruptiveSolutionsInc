"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/lib/firebase"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 
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

  // --- REFINED LOGGER FUNCTION ---
  const logActivity = async (actionName: string, targetPath?: string) => {
    // Redundancy Check: Kung ang user ay nasa target path na, huwag nang i-log.
    if (typeof window !== "undefined" && targetPath) {
      const currentPath = window.location.pathname;
      if (currentPath === targetPath) {
        console.log(`Log skipped: User already on ${targetPath}`);
        return;
      }
    }

    try {
      await addDoc(collection(db, "cmsactivity_logs"), {
        page: actionName,
        timestamp: serverTimestamp(),
        userAgent: typeof window !== "undefined" ? navigator.userAgent : "Server",
        userEmail: userSession?.email || "Anonymous Guest", 
      });
    } catch (err) {
      console.error("Logging failed:", err);
    }
  };

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
    await logActivity("User Signed Out"); 
    await signOut(auth);
    localStorage.removeItem("disruptive_user_session");
    window.location.reload();
  };

  return (
    <>
      <AnimatePresence>
        {isNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNavOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[2000] lg:hidden"
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="fixed top-0 left-0 h-full w-[80%] bg-[#0a0a0a] z-[2001] lg:hidden flex flex-col shadow-2xl"
            >
              <div className="p-8 flex items-center justify-between border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
                <motion.img
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  src={LOGO_WHITE}
                  alt="Logo"
                  className="h-11 w-auto object-contain brightness-110"
                />

                <button
                  onClick={() => setIsNavOpen(false)}
                  className="w-10 h-10 flex items-center justify-center border border-white/10 rounded-full text-white/40 hover:text-white hover:bg-[#d11a2a] hover:border-[#d11a2a] transition-all duration-300"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-grow py-4 px-2">
                {navLinks.map((link, idx) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => {
                        setIsNavOpen(false);
                        logActivity(`Mobile Nav: ${link.name}`, link.href); 
                    }}
                    className="group flex items-center justify-between px-6 py-5 border-b border-white/5 relative overflow-hidden transition-all"
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <span className="text-[10px] font-mono text-[#d11a2a] opacity-50 group-hover:opacity-100">0{idx + 1}</span>
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-white group-hover:translate-x-2 transition-transform duration-300">
                        {link.name}
                      </span>
                    </div>
                    <ArrowRight size={14} className="text-white/20 group-hover:text-[#d11a2a] group-hover:translate-x-1 transition-all" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#d11a2a]/10 to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                  </Link>
                ))}

                {userSession && (
                  <div className="mt-8 px-6 space-y-4">
                    <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">Internal Systems</p>
                    <div className="grid gap-2">
                      <Link href="/catalog" onClick={() => { setIsNavOpen(false); logActivity("Mobile: Catalog View", "/catalog"); }} className="flex items-center gap-3 text-[10px] font-bold text-white/70 uppercase tracking-widest hover:text-[#d11a2a] transition-colors">
                        <FileSignature size={14} /> Catalog
                      </Link>
                      <Link href="/portal" onClick={() => { setIsNavOpen(false); logActivity("Mobile: Portal View", "/portal"); }} className="flex items-center gap-3 text-[10px] font-bold text-white/70 uppercase tracking-widest hover:text-[#d11a2a] transition-colors">
                        <ShieldCheck size={14} /> Client Portal
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-white/5 bg-white/[0.02]">
                <Link
                  href="/quote"
                  onClick={() => { setIsNavOpen(false); logActivity("Mobile Action: Start Project", "/quote"); }}
                  className="flex items-center justify-between group"
                >
                  <span className="text-[11px] font-black uppercase tracking-widest text-white">Start a Project</span>
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#d11a2a] group-hover:border-[#d11a2a] transition-all">
                    <Zap size={14} className="text-white fill-white" />
                  </div>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed top-0 left-0 w-full z-[1000] py-4 transition-all duration-500">
        <motion.div
          initial={false}
          animate={{
            backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.75)" : "rgba(255, 255, 255, 0)",
            backdropFilter: isScrolled ? "blur(16px)" : "blur(0px)",
            boxShadow: isScrolled ? "0 4px 30px rgba(0, 0, 0, 0.05)" : "0 0px 0px rgba(0, 0, 0, 0)",
            height: isScrolled ? "70px" : "90px",
          }}
          className="absolute inset-0 transition-all duration-500"
        />

        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative z-10 h-full">
          <div className="relative shrink-0">
            <Link href="/" onClick={() => logActivity("Navigation: Logo Home", "/")}>
              <motion.img
                animate={{ scale: isScrolled ? 0.85 : 1 }}
                src={isScrolled ? LOGO_RED : LOGO_WHITE}
                alt="Logo"
                className="h-10 md:h-12 w-auto object-contain transition-all duration-500"
              />
            </Link>
          </div>

          <motion.div
            initial={false}
            animate={{
              gap: isScrolled ? "2px" : "12px",
              backgroundColor: isScrolled ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.15)",
            }}
            className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center py-1.5 rounded-full transition-all duration-500 ease-in-out border border-white/10"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => logActivity(`Navigation: ${link.name}`, link.href)}
                className={`px-5 py-2 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-500 rounded-full relative group ${isScrolled ? "text-gray-900" : "text-white"
                  }`}
              >
                <motion.span className="absolute inset-0 bg-[#d11a2a] rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100" />
                <span className="relative z-10 group-hover:text-white transition-colors">
                  {link.name}
                </span>
              </Link>
            ))}
          </motion.div>

          <div className="hidden lg:flex items-center gap-4">
            {userSession && (
              <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Link
                    href="/catalog"
                    onClick={() => logActivity("Action: Catalog Clicked", "/catalog")}
                    className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 border-2 flex items-center gap-2 ${isScrolled
                      ? "border-gray-200 text-gray-900 hover:bg-gray-100"
                      : "border-white/20 text-white hover:bg-white/10"
                      }`}
                  >
                    <FileSignature size={14} className="text-[#d11a2a]" />
                    Catalog
                  </Link>
                </motion.div>

                <div className="relative group">
                  <div className="flex items-center cursor-pointer py-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isScrolled ? "border-[#d11a2a] bg-red-50" : "border-white/30 bg-white/10"
                      }`}>
                      <User size={18} className={isScrolled ? "text-[#d11a2a]" : "text-white"} />
                    </div>

                    <div className="absolute top-full right-0 mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[1001]">
                      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden text-left">
                        <div className="p-5 bg-gray-50 border-b border-gray-100">
                          <p className="text-[9px] font-black text-[#d11a2a] uppercase tracking-widest mb-1 italic">Active Partner</p>
                          <h4 className="text-sm font-black text-gray-900 uppercase truncate">
                            {userSession.displayName || "Disruptive User"}
                          </h4>
                          <p className="text-[10px] font-medium text-gray-400 truncate lowercase">
                            {userSession.email}
                          </p>
                        </div>

                        <div className="p-2">
                          <Link href="/portal" onClick={() => logActivity("Navigation: Portal Access", "/portal")} className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-50 text-gray-600 hover:text-[#d11a2a] transition-colors">
                            <ShieldCheck size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Client Portal</span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-900 hover:text-white text-gray-400 transition-all"
                          >
                            <LogOut size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <motion.div animate={{ scale: isScrolled ? 0.9 : 1 }}>
              <Link
                href="/quote"
                onClick={() => logActivity("Action: Quote Request Click", "/quote")}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 shadow-xl ${isScrolled
                  ? "bg-[#d11a2a] text-white shadow-red-500/20"
                  : "bg-white text-gray-900"
                  }`}
              >
                Free Quote
              </Link>
            </motion.div>
          </div>

          <button
            className="lg:hidden p-2 relative z-[1001]"
            onClick={() => {
                setIsNavOpen(true);
                logActivity("Mobile: Menu Toggled"); // Toggled is fine to log always
            }}
          >
            <div className="space-y-1.5">
              <div className={`w-6 h-0.5 transition-all ${isScrolled ? "bg-black" : "bg-white"}`}></div>
              <div className={`w-4 h-0.5 transition-all ${isScrolled ? "bg-[#d11a2a]" : "bg-white/60"}`}></div>
            </div>
          </button>
        </div>
      </nav>
    </>
  );
}