"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    Package,
    Settings,
    LogOut,
    Search,
    Bell,
    ArrowUpRight,
    TrendingUp,
    Clock,
    ChevronRight,
    User,
    ShieldCheck,
    Key,
    Activity
} from "lucide-react";

// FIREBASE IMPORTS
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, updatePassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function PortalPage() {
    // UI STATES
    const [activeTab, setActiveTab] = useState("overview");
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    
    // DATA STATES
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // SETTINGS STATES
    const [newPassword, setNewPassword] = useState("");
    const [passwordStatus, setPasswordStatus] = useState({ message: "", error: false });
    
    const router = useRouter();

    // --- 1. AUTHENTICATION & DATA FETCHING ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Kunin ang extra user details mula sa Firestore
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        // Fallback data kung wala pa sa Firestore
                        setUserData({ 
                            fullName: user.displayName || "Authorized User", 
                            email: user.email,
                            role: "Client"
                        });
                    }
                } catch (err) {
                    console.error("Error fetching user data:", err);
                } finally {
                    setLoading(false);
                }
            } else {
                // Pag walang session, balik sa login
                router.push("/auth");
            }
        });

        return () => unsubscribe();
    }, [router]);

    // --- 2. LOGOUT LOGIC ---
    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/auth");
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    // --- 3. CHANGE PASSWORD LOGIC ---
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordStatus({ message: "", error: false });

        if (newPassword.length < 6) {
            setPasswordStatus({ message: "Password must be at least 6 characters.", error: true });
            return;
        }

        try {
            if (auth.currentUser) {
                await updatePassword(auth.currentUser, newPassword);
                setPasswordStatus({ message: "Security credentials updated successfully!", error: false });
                setNewPassword("");
            }
        } catch (error: any) {
            setPasswordStatus({ 
                message: "Error: Please re-login to change sensitive data.", 
                error: true 
            });
        }
    };

    // --- LOADING SCREEN ---
    if (loading) return (
        <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-[#d11a2a] border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Syncing Ecosystem...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white flex font-sans overflow-hidden">

            {/* --- SIDEBAR NAVIGATION --- */}
            <aside className={`fixed lg:relative z-50 h-screen transition-all duration-500 border-r border-white/5 bg-[#0a0a0a] flex flex-col ${isSidebarOpen ? "w-72" : "w-20"}`}>
                <div className="p-8 flex items-center justify-between">
                    <h2 className={`font-black italic tracking-tighter transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 hidden"}`}>
                        DISRUPTIVE <span className="text-[#d11a2a]">OS</span>
                    </h2>
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[#d11a2a]">
                        <LayoutDashboard size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <NavItem icon={LayoutDashboard} label="Overview" active={activeTab === "overview"} isOpen={isSidebarOpen} onClick={() => setActiveTab("overview")} />
                    <NavItem icon={FileText} label="Quotations" active={activeTab === "quotes"} isOpen={isSidebarOpen} onClick={() => setActiveTab("quotes")} />
                    <NavItem icon={Settings} label="Security Settings" active={activeTab === "settings"} isOpen={isSidebarOpen} onClick={() => setActiveTab("settings")} />
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 text-gray-500 hover:text-[#d11a2a] transition-all group overflow-hidden w-full"
                    >
                        <LogOut size={20} className="shrink-0 group-hover:rotate-12 transition-transform" />
                        <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 hidden"}`}>
                            Sign Out
                        </span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN PORTAL AREA --- */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* HEADER / TOPBAR */}
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

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        
                        {/* OVERVIEW TAB */}
                        {activeTab === "overview" && (
                            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                <div>
                                    <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
                                        Welcome Back, <br/><span className="text-[#d11a2a]">{userData?.fullName?.split(' ')[0]}</span>
                                    </h1>
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-4 flex items-center gap-2">
                                        <Activity size={12} className="text-green-500" /> System Online • Jan 12, 2026
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <StatCard label="Account Status" value="Active" trend="Secured" />
                                    <StatCard label="Cloud Sync" value="Real-time" trend="Enabled" />
                                    <StatCard label="Access Level" value="Premium" trend="Partner" />
                                </div>

                                <div className="p-12 border border-white/5 rounded-[40px] bg-gradient-to-br from-white/[0.02] to-transparent">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Notice</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed font-medium">Your quotations and project files will appear in the Quotations tab once they are processed by the Disruptive team.</p>
                                </div>
                            </motion.div>
                        )}

                        {/* QUOTATIONS TAB (Placeholder for now) */}
                        {activeTab === "quotes" && (
                            <motion.div key="quotes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 text-center py-20">
                                <FileText size={48} className="mx-auto text-gray-800 mb-4" />
                                <h2 className="text-xl font-black uppercase italic tracking-tighter">No Recent Quotations</h2>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">When quotes are issued, they will appear here.</p>
                            </motion.div>
                        )}

                        {/* SETTINGS / CHANGE PASSWORD TAB */}
                        {activeTab === "settings" && (
                            <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md space-y-8">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter italic text-[#d11a2a]">Portal Security</h2>
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2">Update your authentication keys below.</p>
                                </div>

                                <form onSubmit={handleChangePassword} className="bg-white/5 border border-white/10 p-8 rounded-[40px] space-y-6 backdrop-blur-md">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">New Security Password</label>
                                        <div className="relative">
                                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                            <input 
                                                type="password" 
                                                required
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="MIN. 6 CHARACTERS" 
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold outline-none focus:border-[#d11a2a] transition-all text-white"
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full bg-white text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#d11a2a] hover:text-white transition-all flex items-center justify-center gap-3 group">
                                        <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" /> Update Security Key
                                    </button>

                                    {passwordStatus.message && (
                                        <p className={`text-center text-[9px] font-black uppercase tracking-widest p-3 rounded-xl ${passwordStatus.error ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                            {passwordStatus.message}
                                        </p>
                                    )}
                                </form>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

// --- REUSABLE SUB-COMPONENTS ---

function NavItem({ icon: Icon, label, active, isOpen, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all relative group ${
                active ? "bg-[#d11a2a] text-white shadow-xl shadow-[#d11a2a]/20" : "text-gray-500 hover:bg-white/5 hover:text-white"
            }`}
        >
            <Icon size={20} className="shrink-0" />
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-opacity duration-300 whitespace-nowrap ${isOpen ? "opacity-100" : "opacity-0 hidden"}`}>
                {label}
            </span>
            {active && (
                <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
            )}
        </button>
    );
}

function StatCard({ label, value, trend }: any) {
    return (
        <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] hover:border-[#d11a2a]/30 transition-all group relative overflow-hidden">
            <div className="relative z-10">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-gray-300 transition-colors">{label}</p>
                <div className="text-2xl font-black tracking-tighter mt-4">{value}</div>
                <div className="mt-2 text-[9px] font-bold text-[#d11a2a] uppercase tracking-widest flex items-center gap-2">
                    <Clock size={10} /> {trend}
                </div>
            </div>
            {/* Ambient Background Glow */}
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-[#d11a2a]/5 blur-3xl group-hover:bg-[#d11a2a]/10 transition-all rounded-full" />
        </div>
    );
}