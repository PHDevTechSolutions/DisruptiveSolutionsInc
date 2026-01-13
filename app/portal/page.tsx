"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    Settings,
    LogOut,
    ChevronRight,
    Clock,
    ExternalLink,
    Lock,
    Eye,
    EyeOff,
    Menu,
    X,
    Package,
    Calendar,
    User,
    Home
} from "lucide-react";

// FIREBASE IMPORTS
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, updatePassword } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default function PortalPage() {
    // --- UI STATES ---
    const [activeTab, setActiveTab] = useState("quotes");
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedInquiry, setSelectedInquiry] = useState<any>(null);

    // --- DATA STATES ---
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [inquiriesLoading, setInquiriesLoading] = useState(false);
    const [email, setEmail] = useState("");

    // --- SECURITY STATES ---
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState({ loading: false, message: "", error: false });

    const router = useRouter();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    const fetchInquiriesByEmail = async (targetEmail: string) => {
        setInquiriesLoading(true);
        try {
            const q = query(
                collection(db, "inquiries"),
                where("customerDetails.email", "==", targetEmail),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            setInquiries(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err: any) {
            console.error("Fetch Error:", err.message);
        } finally {
            setInquiriesLoading(false);
        }
    };

    useEffect(() => {
        const sessionData = localStorage.getItem("disruptive_user_session");
        let targetEmail = "";

        if (sessionData) {
            try {
                const parsed = JSON.parse(sessionData);
                targetEmail = parsed.email;
            } catch (e) { console.error(e); }
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setEmail(targetEmail || user.email || "");
                const docSnap = await getDoc(doc(db, "users", user.uid));
                setUserData(docSnap.exists() ? docSnap.data() : { fullName: user.displayName || "User" });
                if (targetEmail || user.email) fetchInquiriesByEmail(targetEmail || user.email || "");
                setLoading(false);
            } else {
                router.push("/auth");
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setUpdatingStatus({ loading: false, message: "Password must be at least 6 characters.", error: true });
            return;
        }
        setUpdatingStatus({ loading: true, message: "", error: false });
        try {
            if (auth.currentUser) {
                await updatePassword(auth.currentUser, newPassword);
                setUpdatingStatus({ loading: false, message: "Password updated successfully!", error: false });
                setNewPassword("");
            }
        } catch (err: any) {
            setUpdatingStatus({ loading: false, message: "Security measure: Please re-login.", error: true });
        }
    };

    // --- UPDATED LOGOUT LOGIC ---
    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem("disruptive_user_session"); // Linisin ang session
            router.push("/auth");
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    if (loading) return (
        <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-[#d11a2a] border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Syncing System...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white flex font-sans overflow-hidden relative">
            
            {/* QUOTATION MODAL */}
            <AnimatePresence>
                {selectedInquiry && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedInquiry(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                                <div>
                                    <span className="text-[8px] font-black bg-[#d11a2a] px-3 py-1 rounded-full uppercase mb-2 inline-block">
                                        {selectedInquiry.status || "Processing"}
                                    </span>
                                    <h3 className="text-2xl font-black italic tracking-tighter uppercase">Quotation Details</h3>
                                </div>
                                <button onClick={() => setSelectedInquiry(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#d11a2a]">Requested Items</p>
                                    <div className="grid gap-3">
                                        {selectedInquiry.items?.map((item: any, i: number) => (
                                            <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                                <img src={item.image} className="w-16 h-16 rounded-xl bg-white p-1 object-contain" alt="product" />
                                                <div className="flex-1">
                                                    <h5 className="text-xs font-black uppercase">{item.name || "Product Name"}</h5>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Qty: {item.quantity || 1}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-6 rounded-[24px] border border-white/5">
                                        <div className="flex items-center gap-2 text-[#d11a2a] mb-2"><Calendar size={14}/> <span className="text-[9px] font-black uppercase">Date Filed</span></div>
                                        <p className="text-xs font-bold">{selectedInquiry.createdAt?.toDate().toLocaleDateString()}</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-[24px] border border-white/5">
                                        <div className="flex items-center gap-2 text-[#d11a2a] mb-2"><Package size={14}/> <span className="text-[9px] font-black uppercase">Reference ID</span></div>
                                        <p className="text-xs font-bold">#{selectedInquiry.id.slice(-8).toUpperCase()}</p>
                                    </div>
                                </div>

                                <div className="bg-white/5 p-6 rounded-[24px] border border-white/5 space-y-4">
                                    <div className="flex items-center gap-2 text-[#d11a2a]"><User size={14}/> <span className="text-[9px] font-black uppercase">Client Information</span></div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[8px] text-gray-500 uppercase font-black">Full Name</label>
                                            <p className="text-xs font-bold uppercase">{selectedInquiry.customerDetails?.fullName}</p>
                                        </div>
                                        <div>
                                            <label className="text-[8px] text-gray-500 uppercase font-black">Contact Number</label>
                                            <p className="text-xs font-bold">{selectedInquiry.customerDetails?.phone || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-white/5 border-t border-white/5">
                                <p className="text-[9px] text-center text-gray-500 font-bold uppercase italic">
                                    Our team is currently reviewing your request. Expect a formal quote in your email.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* SIDEBAR */}
            <aside className={`
                fixed lg:relative z-[70] h-screen transition-all duration-500 border-r border-white/5 bg-[#0a0a0a] flex flex-col
                ${isSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0 w-0 lg:w-72"}
                lg:block
            `}>
                <div className="p-8 flex items-center justify-between">
                    <h2 className="font-black italic tracking-tighter text-xl text-white">
                        DISRUPTIVE <span className="text-[#d11a2a]">OS</span>
                    </h2>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500"><X /></button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {/* BACK TO DASHBOARD BUTTON */}
                    <button 
                        onClick={() => router.push('/')}
                        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all text-gray-400 hover:bg-white/5 hover:text-white mb-6 border border-white/5 group"
                    >
                        <Home size={20} className="group-hover:text-[#d11a2a] transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Main</span>
                    </button>

                    <NavItem icon={LayoutDashboard} label="Overview" active={activeTab === "overview"} onClick={() => {setActiveTab("overview"); setSidebarOpen(false);}} />
                    <NavItem icon={FileText} label="Quotations" active={activeTab === "quotes"} onClick={() => {setActiveTab("quotes"); setSidebarOpen(false);}} />
                    <NavItem icon={Settings} label="Security" active={activeTab === "settings"} onClick={() => {setActiveTab("settings"); setSidebarOpen(false);}} />
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button onClick={handleLogout} className="flex items-center gap-4 text-gray-500 hover:text-[#d11a2a] w-full p-4 transition-colors">
                        <LogOut size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden w-full">
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-8 bg-[#0a0a0a]/40 backdrop-blur-xl shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-[#d11a2a]"><Menu size={24}/></button>
                        
                        {/* QUICK BACK BUTTON IN HEADER */}
                        <button 
                            onClick={() => router.push('/')}
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#d11a2a]/40 transition-all group"
                        >
                            <Home size={12} className="text-[#d11a2a]"/>
                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">Main Site</span>
                        </button>

                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                            <span className="hidden sm:inline">Portal</span> <ChevronRight size={14} className="hidden sm:inline" /> <span className="text-white">{activeTab}</span>
                        </div>
                    </div>
                    <div className="text-[10px] font-mono text-[#d11a2a] bg-[#d11a2a]/10 px-3 py-1 rounded-full border border-[#d11a2a]/20">
                        {formattedTime}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        
                        {activeTab === "overview" && (
                            <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 lg:space-y-8">
                                <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter italic">
                                    Welcome, <span className="text-[#d11a2a]">{userData?.fullName?.split(' ')[0]}</span>
                                </h1>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                                    <StatCard label="Account Email" value={email} trend="Verified" />
                                    <StatCard label="My Requests" value={inquiries.length} trend="Total Records" />
                                    <StatCard label="Access Level" value="Authorized" trend="Standard Client" />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "quotes" && (
                            <motion.div key="qt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                <h2 className="text-2xl font-black uppercase tracking-tighter italic text-[#d11a2a]">Quotation History</h2>
                                {inquiriesLoading ? (
                                    <div className="py-20 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#d11a2a] border-t-transparent rounded-full mx-auto" /></div>
                                ) : inquiries.length === 0 ? (
                                    <div className="py-20 text-center bg-white/5 rounded-[32px] border border-dashed border-white/10 text-gray-500 uppercase text-[10px] font-black">No Records Found</div>
                                ) : (
                                    <div className="grid gap-4">
                                        {inquiries.map((inq) => (
                                            <div 
                                                key={inq.id} 
                                                onClick={() => setSelectedInquiry(inq)}
                                                className="bg-white/5 border border-white/10 p-5 lg:p-8 rounded-[32px] group cursor-pointer hover:bg-white/[0.08] hover:border-[#d11a2a]/30 transition-all"
                                            >
                                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                                    <div className="space-y-3">
                                                        <span className="text-[8px] font-black bg-[#d11a2a] px-3 py-1 rounded-full uppercase">{inq.status || "Pending"}</span>
                                                        <h4 className="text-lg font-black uppercase italic">#{inq.id.slice(-6).toUpperCase()}</h4>
                                                        <div className="flex -space-x-2">
                                                            {inq.items?.map((item: any, i: number) => (
                                                                <img key={i} src={item.image} className="w-10 h-10 rounded-lg bg-white p-1 border border-black/10 object-contain shadow-xl" alt="thumb" />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="sm:text-right flex flex-row sm:flex-col justify-between items-end">
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase">{inq.createdAt?.toDate().toLocaleDateString()}</p>
                                                        <button className="text-[10px] font-black uppercase text-[#d11a2a] flex items-center gap-1 group-hover:gap-3 transition-all">
                                                            Open Details <ExternalLink size={14}/>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === "settings" && (
                            <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-xl mx-auto lg:mx-0 space-y-6">
                                <div>
                                    <h2 className="text-2xl font-black uppercase italic text-[#d11a2a]">Security Settings</h2>
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2">Manage your account access</p>
                                </div>
                                <form onSubmit={handleUpdatePassword} className="bg-white/5 border border-white/10 p-6 lg:p-10 rounded-[40px] space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                            <Lock size={12}/> New Security Password
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type={showPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="MINIMUM 6 CHARACTERS"
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:border-[#d11a2a] transition-all"
                                                required
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                            >
                                                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                            </button>
                                        </div>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={updatingStatus.loading}
                                        className="w-full bg-white text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#d11a2a] hover:text-white transition-all disabled:opacity-50"
                                    >
                                        {updatingStatus.loading ? "Updating System..." : "Save New Password"}
                                    </button>
                                    {updatingStatus.message && (
                                        <p className={`text-[9px] font-black uppercase text-center p-4 rounded-xl ${updatingStatus.error ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}>
                                            {updatingStatus.message}
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

// --- REUSABLE COMPONENTS ---

function NavItem({ icon: Icon, label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all relative group ${
                active ? "bg-[#d11a2a] text-white" : "text-gray-500 hover:bg-white/5 hover:text-white"
            }`}
        >
            <Icon size={20} className="shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
            {active && (
                <motion.div layoutId="navIndicator" className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
            )}
        </button>
    );
}

function StatCard({ label, value, trend }: any) {
    return (
        <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] group relative overflow-hidden">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">{label}</p>
            <div className="text-lg lg:text-xl font-black tracking-tighter truncate">{value}</div>
            <div className="mt-2 text-[9px] font-bold text-[#d11a2a] uppercase flex items-center gap-2">
                <Clock size={10} /> {trend}
            </div>
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#d11a2a]/5 blur-3xl rounded-full" />
        </div>
    );
}