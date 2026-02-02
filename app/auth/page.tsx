"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, ArrowRight, Briefcase } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// FIREBASE IMPORTS
import { auth, db } from "@/lib/firebase"; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const router = useRouter();

  // FORM STATES
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("customer"); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, "customer_account", user.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          localStorage.setItem("disruptive_admin_user", JSON.stringify({
            uid: user.uid,
            name: data.fullName,
            role: data.role,
            email: user.email
          }));
          router.push("/portal");
        } else {
          throw new Error("UNAUTHORIZED: NO INTERNAL PROFILE FOUND.");
        }
      } else {
        // --- SIGN UP LOGIC (No more Customer Role) ---
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: fullName });

        // Force save to adminaccount with correct role
        const userData = {
          uid: user.uid,
          fullName: fullName,
          email: email,
          role: role, // 'warehouse' or 'admin'
          accessLevel: role === "customer",
          status: "active",
          website: "disruptivesolutionsinc",
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, "customer_account", user.uid), userData);
        localStorage.setItem("disruptive_admin_user", JSON.stringify(userData));
        router.push("/auth");
      }
    } catch (err: any) {
      setError(err.message.toUpperCase());
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return setError("ENTER EMAIL FIRST.");
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("CHECK YOUR EMAIL FOR RESET LINK.");
    } catch (err: any) { setError(err.message.toUpperCase()); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Link href="/" className="absolute top-10 left-10 z-20 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[450px] relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">DISRUPTIVE<br/><span className="text-transparent" style={{ WebkitTextStroke: "1px white" }}>SYSTEM</span></h2>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl rounded-[40px] p-8 md:p-12 border border-white/10 shadow-2xl">
          {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl text-[10px] text-red-500 font-bold uppercase tracking-widest text-center">{error}</div>}
          {resetMessage && <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-2xl text-[10px] text-green-500 font-bold uppercase tracking-widest text-center">{resetMessage}</div>}

          <AnimatePresence mode="wait">
            <motion.div key={isLogin ? "login" : "signup"} initial={{ opacity: 0, x: isLogin ? -20 : 20 }} animate={{ opacity: 1, x: 0 }}>
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input required type="text" placeholder="FULL NAME" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[10px] font-bold uppercase outline-none focus:border-[#d11a2a]" />
                    </div>
                   <div className="relative">
  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
  <select 
    value={role} 
    onChange={(e) => setRole(e.target.value)} 
    className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[10px] font-bold uppercase outline-none focus:border-[#d11a2a] appearance-none cursor-pointer"
  >
    <option value="customer">Customer / Client</option>
  </select>
</div>
                  </>
                )}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input required type="email" placeholder="EMAIL ADDRESS" value={email} onChange={(e) => setEmail(e.target.value.trim())} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[10px] font-bold uppercase outline-none focus:border-[#d11a2a]" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input required type="password" placeholder="PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[10px] font-bold uppercase outline-none focus:border-[#d11a2a]" />
                </div>
                {isLogin && <div className="flex justify-end px-2"><button type="button" onClick={handleForgotPassword} className="text-[9px] font-black uppercase text-gray-500 hover:text-[#d11a2a]">Forgot Key?</button></div>}
                <button disabled={isLoading} type="submit" className="w-full bg-[#d11a2a] py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all group">
                  {isLoading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : (isLogin ? "Authorize" : "Create Profile")}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="text-center mt-10">
          <button onClick={() => { setIsLogin(!isLogin); setError(""); }} className="text-gray-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
            {isLogin ? "Need internal access? REGISTER" : "Back to LOGIN"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}