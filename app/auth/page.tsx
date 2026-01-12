"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// FIREBASE IMPORTS
import { auth, db } from "@/lib/firebase"; 
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

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

  // --- HANDLE LOGIN / SIGNUP ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setResetMessage("");

    try {
      if (isLogin) {
        // LOG IN
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/portal"); 
      } else {
        // SIGN UP
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: fullName });

        // Save to Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          fullName: fullName,
          email: email,
          role: "customer",
          createdAt: new Date().toISOString(),
        });

        router.push("/portal");
      }
    } catch (err: any) {
      // Handle Firebase Errors
      if (err.code === "auth/invalid-email") {
        setError("THE EMAIL ADDRESS IS MALFORMED. PLEASE CHECK FOR SPACES.");
      } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("INVALID CREDENTIALS. PLEASE TRY AGAIN.");
      } else {
        setError(err.message.toUpperCase());
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- FORGOT PASSWORD LOGIC ---
  const handleForgotPassword = async () => {
    if (!email) {
      setError("PLEASE ENTER YOUR EMAIL ADDRESS FIRST.");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      // Uses the template configured in your Firebase Console
      await sendPasswordResetEmail(auth, email);
      setResetMessage("PASSWORD RESET LINK SENT! CHECK YOUR INBOX OR SPAM IN YOUR GMAIL.");
    } catch (err: any) {
      if (err.code === "auth/invalid-email") {
        setError("INVALID EMAIL FORMAT.");
      } else if (err.code === "auth/user-not-found") {
        setError("NO ACCOUNT FOUND WITH THIS EMAIL.");
      } else {
        setError(err.message.toUpperCase());
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* DECORATION */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#d11a2a]/20 blur-[120px] rounded-full" />
      </div>

      <Link href="/" className="absolute top-10 left-10 z-20 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[450px] relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
            DISRUPTIVE<br/>
            <span className="text-transparent" style={{ WebkitTextStroke: "1px white" }}>PORTAL</span>
          </h2>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl rounded-[40px] p-8 md:p-12 border border-white/10 shadow-2xl">
          
          {/* FEEDBACK MESSAGES */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl text-[10px] text-red-500 font-bold uppercase tracking-widest text-center animate-pulse">
              {error}
            </div>
          )}
          {resetMessage && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-2xl text-[10px] text-green-500 font-bold uppercase tracking-widest text-center">
              {resetMessage}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={isLogin ? "login" : "signup"} initial={{ opacity: 0, x: isLogin ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isLogin ? 20 : -20 }}>
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      required type="text" placeholder="FULL NAME"
                      value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-[#d11a2a] transition-colors"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    required type="email" placeholder="EMAIL ADDRESS"
                    value={email} onChange={(e) => setEmail(e.target.value.trim())} // FIX FOR INVALID EMAIL
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-[#d11a2a] transition-colors"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    required type="password" placeholder="PASSWORD"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-[#d11a2a] transition-colors"
                  />
                </div>

                {isLogin && (
                  <div className="flex justify-end px-2">
                    <button 
                      type="button" 
                      onClick={handleForgotPassword}
                      className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-[#d11a2a] transition-colors"
                    >
                      Forgot Security Key?
                    </button>
                  </div>
                )}

                <button 
                  disabled={isLoading} type="submit"
                  className="w-full bg-[#d11a2a] py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all group disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <> {isLogin ? "Sign In" : "Create Account"} <ArrowRight size={18} /> </>
                  )}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="text-center mt-10">
          <button onClick={() => { setIsLogin(!isLogin); setError(""); setResetMessage(""); }} className="text-gray-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
            {isLogin ? "Don't have an account? SIGN UP" : "Already a member? LOGIN"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}