"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, 
  Search, 
  Image as ImageIcon, 
  ArrowLeft, 
  ChevronUp,
  Facebook,
  Instagram,
  Linkedin,
  Twitter
} from "lucide-react";
import Link from "next/link";

// --- MOCK ASSETS (Siguraduhin na ang mga ito ay tama sa project mo) ---
const LOGO_WHITE = "/logo-white.png"; // Palitan ng tamang path

const socials = [
  { icon: Facebook, color: "hover:text-blue-500", href: "#" },
  { icon: Instagram, color: "hover:text-pink-500", href: "#" },
  { icon: Linkedin, color: "hover:text-blue-400", href: "#" },
  { icon: Twitter, color: "hover:text-sky-400", href: "#" },
];

const footerLinks = [
  { name: "Home", href: "/" },
  { name: "Solutions", href: "/solutions" },
  { name: "Portal", href: "/portal" },
  { name: "Contact", href: "/contact" },
];

const CATALOG_DATA = [
  {
    id: 1,
    title: "Interior Masterpieces 2026",
    description: "Our flagship collection of architectural lighting designs.",
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=2070",
    fileUrl: "/downloads/interior-2026.pdf",
    category: "Architecture"
  },
  {
    id: 2,
    title: "The Industrial Series",
    description: "Rugged, raw, and disruptive lighting for modern spaces.",
    image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=2070",
    fileUrl: "/downloads/industrial-series.pdf",
    category: "Industrial"
  },
  {
    id: 3,
    title: "Smart Home Integration",
    description: "Wireless controls and IoT-ready lighting ecosystems.",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=2070",
    fileUrl: "/downloads/smart-tech.pdf",
    category: "Technology"
  },
];

// Placeholder component kung wala ka pang Newsletter component
const SignUpNewsletter = () => (
  <div className="flex flex-col h-full">
    <h4 className="text-xl font-black uppercase tracking-tighter mb-4 text-white">Get Tech Insights</h4>
    <p className="text-gray-400 text-xs mb-6">Subscribe to receive the latest updates on disruptive lighting tech.</p>
    <div className="flex gap-2">
      <input type="email" placeholder="Email Address" className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm w-full outline-none focus:border-[#d11a2a] transition-all" />
      <button className="bg-[#d11a2a] px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#b01624] transition-all">Join</button>
    </div>
  </div>
);

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredCatalogs = CATALOG_DATA.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] selection:bg-[#d11a2a]/10 selection:text-[#d11a2a]">
      {/* MAIN CONTENT WRAPPER */}
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-32">
        
        {/* HEADER SECTION */}
        <header className="mb-16">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-[#d11a2a] transition-colors mb-8 group w-fit">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Home</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[#d11a2a]/10 text-[#d11a2a] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Partner Access
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 uppercase tracking-tighter">
                Exclusive <span className="text-[#d11a2a]">Catalogs</span>
              </h1>
              <p className="mt-4 text-gray-500 max-w-md font-medium leading-relaxed">
                High-resolution assets and technical specifications for our latest disruptive lighting collections.
              </p>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#d11a2a] transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Search catalogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-6 w-full md:w-[300px] shadow-sm focus:ring-2 focus:ring-[#d11a2a]/20 focus:border-[#d11a2a] outline-none transition-all font-bold text-sm"
              />
            </div>
          </div>
        </header>

        {/* GRID SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredCatalogs.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-50"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                    <span className="text-white/80 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <ImageIcon size={14} /> {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                    {item.description}
                  </p>
                  
                  <a 
                    href={item.fileUrl}
                    download
                    className="flex items-center justify-between w-full bg-gray-50 group-hover:bg-[#d11a2a] px-6 py-4 rounded-2xl transition-all duration-300"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 group-hover:text-white">
                      Download PDF
                    </span>
                    <Download size={18} className="text-[#d11a2a] group-hover:text-white" />
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredCatalogs.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <Search className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-400 font-black uppercase tracking-widest">No matching catalogs found</p>
          </div>
        )}
      </main>

      {/* --- 5. MODERN FOOTER --- */}
      <footer className="bg-[#0a0a0a] text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20 items-start">
            {/* BRAND COLUMN */}
            <div className="space-y-8">
              <div className="h-12 flex items-center">
                <span className="text-2xl font-black tracking-tighter uppercase">Disruptive<span className="text-[#d11a2a]">.</span></span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm font-medium">
                The leading edge of lighting technology. Disrupting the standard to build a brighter, smarter world.
              </p>
              <div className="flex gap-4">
                {socials.map((soc, i) => (
                  <Link
                    key={i}
                    href={soc.href}
                    className={`h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 ${soc.color}`}
                  >
                    <soc.icon size={18} />
                  </Link>
                ))}
              </div>
            </div>

            {/* QUICK LINKS */}
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-[#d11a2a]">
                Quick Links
              </h4>
              <ul className="space-y-4">
                {footerLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 text-sm flex items-center gap-2 hover:text-white transition-colors group"
                    >
                      <span className="h-[2px] w-0 bg-[#d11a2a] group-hover:w-3 transition-all" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* NEWSLETTER */}
            <div className="md:col-span-2 bg-white/5 backdrop-blur-xl rounded-[32px] p-10 border border-white/10 shadow-xl">
              <SignUpNewsletter />
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-gray-500 tracking-[0.25em] uppercase">
            <p>© 2026 Disruptive Solutions Inc.</p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 hover:text-[#d11a2a] transition-all"
            >
              Top <ChevronUp size={16} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}