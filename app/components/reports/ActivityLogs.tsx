"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { Activity, BarChart3, ListOrdered, X, Smartphone, Monitor, Eye } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface PageStats {
  page: string;
  count: number;
  lastSeen: Timestamp;
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<PageStats[]>([]);
  const [loading, setLoading] = useState(true);
  
  // MODAL STATES
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [showAllLogs, setShowAllLogs] = useState(false);

  useEffect(() => {
    // 1. Siguraduhing naka-order by timestamp para laging bago ang nasa taas
    const q = query(collection(db, "cmsactivity_logs"), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // FIX: Siguraduhing kinukuha ang doc.id para magamit na unique key
      const rawLogs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setLogs(rawLogs);

      const summaryMap = new Map<string, PageStats>();
      rawLogs.forEach((log: any) => {
        if (!summaryMap.has(log.page)) {
          summaryMap.set(log.page, {
            page: log.page,
            count: 1,
            lastSeen: log.timestamp
          });
        } else {
          const current = summaryMap.get(log.page)!;
          summaryMap.set(log.page, { ...current, count: current.count + 1 });
        }
      });

      setStats(Array.from(summaryMap.values()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const modalLogs = showAllLogs ? logs : logs.filter(log => log.page === selectedPage);
  const modalTitle = showAllLogs ? "Full System Audit Logs" : selectedPage;

  if (loading) return <div className="p-4 text-xs animate-pulse font-bold uppercase italic text-gray-400">Loading Analytics...</div>;

  return (
    <div className="bg-white border border-gray-100 rounded-none shadow-md overflow-hidden font-sans relative">
      
      {/* HEADER */}
      <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-black">
          <BarChart3 size={14} className="text-[#d11a2a]" />
          Traffic Summary
        </h3>
        
        <button 
          onClick={() => setShowAllLogs(true)}
          className="text-[9px] font-black uppercase border-2 border-black px-3 py-1 hover:bg-black hover:text-white transition-all flex items-center gap-2 text-black"
        >
          <ListOrdered size={12} />
          View Raw Logs
        </button>
      </div>

      {/* SUMMARY TABLE */}
      <div className="overflow-y-auto max-h-[500px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100 text-[9px] font-black uppercase tracking-widest text-gray-400">
            <tr>
              <th className="p-4">Page Section</th>
              <th className="p-4">Total Views</th>
              <th className="p-4">Last Seen</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-black">
            {stats.map((stat) => (
              // KEY FIX: Ginamit ang page name dahil unique ito sa summary
              <tr key={`summary-${stat.page}`} className="hover:bg-gray-50 transition-all group">
                <td className="p-4 text-[11px] font-black uppercase italic text-gray-700 group-hover:text-[#d11a2a]">
                  {stat.page}
                </td>
                <td className="p-4">
                  <span className="text-sm font-black text-gray-900">{stat.count}</span>
                </td>
                <td className="p-4 text-black">
                  <div className="flex flex-col text-[10px]">
                    <span className="font-bold text-gray-500 uppercase">
                       {stat.lastSeen ? format(stat.lastSeen.toDate(), "MMM dd") : "---"}
                    </span>
                    <span className="text-gray-400 italic">
                      {stat.lastSeen ? format(stat.lastSeen.toDate(), "hh:mm a") : "---"}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => setSelectedPage(stat.page)}
                    className="p-2 hover:bg-[#d11a2a]/10 text-gray-300 hover:text-[#d11a2a] transition-all rounded-full"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL SECTION */}
      <AnimatePresence>
        {(selectedPage || showAllLogs) && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-6 text-black">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setSelectedPage(null); setShowAllLogs(false); }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <div>
                  <h4 className="text-xl font-black uppercase italic text-[#d11a2a] leading-none">
                    {modalTitle}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">
                    {showAllLogs ? "Showing all website interactions" : `Detailed logs for ${selectedPage}`}
                  </p>
                </div>
                <button 
                  onClick={() => { setSelectedPage(null); setShowAllLogs(false); }}
                  className="p-2 hover:bg-gray-100 transition-colors rounded-full"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 bg-white">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-gray-50 text-[9px] font-black uppercase text-gray-400 border-b border-gray-100 z-10">
                    <tr>
                      {showAllLogs && <th className="p-4">Page</th>}
                      <th className="p-4">Device / User Agent</th>
                      <th className="p-4 text-right">Time & Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {modalLogs.map((log) => (
                      // KEY FIX: Ginamit ang unique Firestore doc ID
                      <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                        {showAllLogs && (
                          <td className="p-4 text-[10px] font-black text-[#d11a2a] uppercase italic">
                            {log.page}
                          </td>
                        )}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {log.userAgent?.includes("Mobile") ? <Smartphone size={12} className="text-gray-400" /> : <Monitor size={12} className="text-gray-400" />}
                            <span className="text-[9px] text-gray-500 font-medium break-all max-w-[250px] line-clamp-1">
                              {log.userAgent}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-[10px] font-bold text-gray-900 block">
                            {log.timestamp ? format(log.timestamp.toDate(), "hh:mm:ss a") : "---"}
                          </span>
                          <span className="text-[9px] text-gray-400 uppercase">
                             {log.timestamp ? format(log.timestamp.toDate(), "MMM dd, yyyy") : "---"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* FOOTER */}
              <div className="p-4 bg-black text-white flex justify-between items-center font-black italic text-[10px] tracking-widest">
                <span>TOTAL ENTRIES: {modalLogs.length}</span>
                <span className="text-[#d11a2a]">DISRUPTIVE ANALYTICS V1.0</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}