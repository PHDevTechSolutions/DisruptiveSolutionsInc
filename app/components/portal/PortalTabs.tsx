"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Download, Calendar, Tag, Activity, Clock, Key } from "lucide-react";

// --- OVERVIEW TAB ---
export const OverviewTab = ({ userData, date, time }: any) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
    <div>
      <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
        Welcome Back, <br/><span className="text-[#d11a2a]">{userData?.fullName?.split(' ')[0]}</span>
      </h1>
      <div className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-gray-300">System Online</span>
        </div>
        <span className="text-white/10">|</span>
        <div className="flex items-center gap-2">
          <Activity size={12} className="text-[#d11a2a]" />
          <span>{date}</span>
        </div>
        <span className="text-white/10">|</span>
        <div className="flex items-center gap-2 text-white font-mono bg-white/5 px-2 py-1 rounded">
          <Clock size={12} className="text-gray-500" />
          <span>{time}</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white/5 border border-white/10 p-6 rounded-[32px]">
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Account Status</p>
        <div className="text-2xl font-black mt-4 uppercase">Active</div>
        <p className="mt-2 text-[9px] font-bold text-[#d11a2a] uppercase tracking-widest">Secured</p>
      </div>
      <div className="bg-white/5 border border-white/10 p-6 rounded-[32px]">
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Cloud Sync</p>
        <div className="text-2xl font-black mt-4 uppercase">Real-time</div>
        <p className="mt-2 text-[9px] font-bold text-[#d11a2a] uppercase tracking-widest">Enabled</p>
      </div>
      <div className="bg-white/5 border border-white/10 p-6 rounded-[32px]">
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Access Level</p>
        <div className="text-2xl font-black mt-4 uppercase">Premium</div>
        <p className="mt-2 text-[9px] font-bold text-[#d11a2a] uppercase tracking-widest">Partner</p>
      </div>
    </div>
  </motion.div>
);

// --- QUOTATIONS TAB ---
export const QuotesTab = ({ quotes, loading }: { quotes: any[], loading: boolean }) => {
  if (loading) return <div className="py-20 text-center animate-pulse text-gray-500 uppercase text-[10px] font-black tracking-widest">Syncing Documents...</div>;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
       {quotes.length === 0 ? (
          <div className="text-center py-20">
             <FileText size={48} className="mx-auto text-gray-800 mb-4" />
             <h2 className="text-xl font-black uppercase italic tracking-tighter">No Recent Quotations</h2>
          </div>
       ) : (
          <div className="grid grid-cols-1 gap-4">
            {quotes.map((quote) => (
              <div key={quote.id} className="bg-white/5 border border-white/10 p-6 rounded-[32px] flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <FileText className="text-[#d11a2a]" />
                  <span className="font-bold uppercase text-xs tracking-widest">{quote.title}</span>
                </div>
                <a href={quote.fileUrl} target="_blank" className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-black uppercase hover:bg-[#d11a2a] hover:text-white transition-all">Download PDF</a>
              </div>
            ))}
          </div>
       )}
    </motion.div>
  );
};

// --- SETTINGS TAB ---
export const SettingsTab = ({ handlePassUpdate, newPass, setNewPass, status }: any) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md space-y-8">
    <h2 className="text-2xl font-black uppercase italic text-[#d11a2a]">Portal Security</h2>
    <form onSubmit={handlePassUpdate} className="bg-white/5 border border-white/10 p-8 rounded-[40px] space-y-6">
      <div className="space-y-2">
        <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">New Security Password</label>
        <div className="relative">
          <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="password" 
            required 
            value={newPass} 
            onChange={(e) => setNewPass(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-[#d11a2a]"
            placeholder="MIN. 6 CHARACTERS"
          />
        </div>
      </div>
      <button type="submit" className="w-full bg-white text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#d11a2a] hover:text-white transition-all">
        Update Security Key
      </button>
      {status.message && (
        <p className={`text-center text-[9px] font-black uppercase p-3 rounded-xl ${status.error ? 'text-red-500 bg-red-500/10' : 'text-green-500 bg-green-500/10'}`}>
          {status.message}
        </p>
      )}
    </form>
  </motion.div>
);