"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { Mail, Phone, MapPin, Package, Clock, ExternalLink } from "lucide-react";

export default function InquiriesPanel() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // I-fetch ang inquiries sorted by pinakabago
    const q = query(collection(db, "inquiries"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInquiries(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold animate-pulse">Loading Inquiries...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#d11a2a]">
          Customer Inquiries
        </h2>
        <span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase">
          {inquiries.length} Total
        </span>
      </div>

      <div className="grid gap-6">
        {inquiries.map((inquiry) => (
          <div key={inquiry.id} className="border rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Header info */}
            <div className="p-6 border-b bg-gray-50/50 flex flex-wrap justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-black uppercase text-lg leading-none">
                  {inquiry.customerDetails.firstName} {inquiry.customerDetails.lastName}
                </h3>
                <div className="flex flex-wrap gap-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Mail size={12}/> {inquiry.customerDetails.email}</span>
                  <span className="flex items-center gap-1"><Phone size={12}/> {inquiry.customerDetails.phone || "No Phone"}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1 justify-end">
                  <Clock size={12}/> {inquiry.createdAt?.toDate().toLocaleDateString()}
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded mt-2 inline-block ${
                  inquiry.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                }`}>
                  {inquiry.status}
                </span>
              </div>
            </div>

            {/* Content info */}
            <div className="p-6 grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                    <MapPin size={12}/> Delivery Address
                  </h4>
                  <p className="text-sm font-medium leading-relaxed">
                    {inquiry.customerDetails.streetAddress}, {inquiry.customerDetails.apartment && inquiry.customerDetails.apartment}
                  </p>
                </div>
                {inquiry.customerDetails.orderNotes && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Notes</h4>
                    <p className="text-sm bg-yellow-50 p-3 rounded-lg border border-yellow-100 italic">
                      "{inquiry.customerDetails.orderNotes}"
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                  <Package size={12}/> Requested Items
                </h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {inquiry.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
                      <img src={item.image} alt="" className="w-10 h-10 object-contain bg-white rounded-lg border" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black uppercase truncate">{item.name}</p>
                        <p className="text-[9px] font-bold text-gray-400 italic uppercase">SKU: {item.sku}</p>
                      </div>
                      <div className="font-black text-[#d11a2a] text-sm">x{item.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}