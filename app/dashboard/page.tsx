"use client";

import React, { useState, useEffect, useCallback, useId } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, limit, where } from "firebase/firestore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import SignUpNewsletter from "../components/SignUpNewsletter"
import Footer from "../components/navigation/footer";
import Navbar from "../components/navigation/navbar";
import {
  Menu, X, FileSignature, ArrowRight, Sparkles, ChevronUp,
  MessageSquare, Send, Brain, Zap, Code, Facebook,
  Instagram, Linkedin, Video, ShieldCheck, User, LogOut, Plus, Loader2
} from "lucide-react";
import HomePopup from "../components/modals/HomePopup";
import FloatingChatWidget from "../components/chat-widget";

// --- MOCK UI COMPONENTS (Para sa Chat Widget) ---
const Avatar = ({ children, className }: any) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>
);
const AvatarImage = ({ src }: any) => <img src={src} className="aspect-square h-full w-full" />;
const AvatarFallback = ({ children, className }: any) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 ${className}`}>{children}</div>
);
const cn = (...classes: any) => classes.filter(Boolean).join(" ");

// --- AI AGENTS DATA ---
const AI_AGENTS = [
  { id: "gpt4", name: "Disruptive AI", role: "Smart Lighting Expert", avatar: "https://github.com/shadcn.png", status: "online", icon: Sparkles, gradient: "from-red-500/20 to-rose-500/20" },
  { id: "gemini", name: "Sales Pro", role: "Quotation Assistant", avatar: "https://github.com/shadcn.png", status: "online", icon: Zap, gradient: "from-blue-500/20 to-cyan-500/20" },
];



export default function DisruptiveLandingPage() {
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false); // Mobile Nav Toggle
  const [isChatOpen, setIsChatOpen] = useState(false); // Chat Widget Toggle
  const [message, setMessage] = useState("");
  const pathname = usePathname();
  const [userSession, setUserSession] = useState<any>(null);
  


  // --- NEW: PROJECT FETCHING STATE ---
  const [fetchedProjects, setFetchedProjects] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  // Check session on mount
  useEffect(() => {
    const session = localStorage.getItem("disruptive_user_session");
    if (session) {
      setUserSession(JSON.parse(session));
    }
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("disruptive_user_session");
    setUserSession(null);
    window.location.reload(); // Refresh para bumalik sa default nav
  };

useEffect(() => {
    // 4 columns * 8 rows = 32 projects total
    const q = query(
      collection(db, "projects"), 
      orderBy("createdAt", "desc"), 
      limit(32)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFetchedProjects(data);
      setProjectsLoading(false);
    });

    return () => unsubscribe();
  }, []);





  const LOGO_RED = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-red-scaled.png";
  const LOGO_WHITE = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-white-scaled.png";

  const navLinks = [
    { name: "Home", href: "/dashboard" },
    { name: "Product & Solutions", href: "/lighting-products-smart-solutions" },
    { name: "Brands", href: "trusted-technology-brands" },
    { name: "Contact", href: "/contact-us" },
  ];

  const footerLinks = [
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact Us", href: "/contact-us" },
  ];
  const socials = [
    { icon: Facebook, href: "#", color: "hover:bg-[#1877F2]" },
    { icon: Instagram, href: "#", color: "hover:bg-[#E4405F]" },
    { icon: Linkedin, href: "#", color: "hover:bg-[#0A66C2]" },
  ];
  const brandData = [
    {
      category: "Smart Lighting",
      title: "Zumtobel's Lighting Solutions",
      description: "Global leader in premium lighting solutions, combines design, innovation and sustainability.",
      image: "https://disruptivesolutionsinc.com/wp-content/uploads/2025/11/ZUMTOBELs.png",
      href: "/lighting-products-smart-solutions"
    },
    {
      category: "Power Solutions",
      title: "Affordable Lighting That Works as Hard as You Do",
      description: "Smart lighting at smarter prices - reliable quality without compromise",
      image: "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/Lit-Rectangle-black-scaled-e1754460691526.png",
      href: "/lit-lighting-solutions"
    }
  ];

  

  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    // Gumawa ng query na ang 'website' ay 'disruptivesolutionsinc'
    const q = query(
      collection(db, "blogs"),
      where("website", "==", "disruptivesolutionsinc"), // Eto yung filter
      orderBy("createdAt", "desc"),
      limit(3) // Karaniwang 3 lang pinapakita sa landing page grid
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBlogs(data);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentAgent = AI_AGENTS[0];

  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "brand_name"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBrands(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const [partners, setPartners] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "brand_name"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const urls = snap.docs.map(doc => doc.data().logoUrl);
      // Dinudoble (Array.from) para sa seamless loop
      setPartners(urls.length > 0 ? [...urls, ...urls, ...urls] : []);
    });
    return () => unsub();
  }, []);

  if (partners.length === 0) return null;

  // --- DYNAMIC COLUMN CALCULATOR ---
const getGridConfig = () => {
  const count = brands.length;
  if (count === 1) return "grid-cols-1 max-w-[500px]"; // Limit width pag solo
  if (count === 2) return "grid-cols-1 md:grid-cols-2 max-w-[1000px]"; 
  if (count === 3) return "grid-cols-1 md:grid-cols-3 max-w-[1200px]";
  if (count === 4) return "grid-cols-2 lg:grid-cols-4 max-w-[1400px]";
  return "grid-cols-2 md:grid-cols-3 lg:grid-cols-5 max-w-[1550px]"; // Standard 5-col
};

  if (loading && brands.length === 0) {
    return (
      <div className="w-full py-24 flex justify-center items-center">
        <Loader2 className="animate-spin text-[#d11a2a]" size={40} />
      </div>
    );
  }

  return (

    <>
    <FloatingChatWidget/>
    <HomePopup/>
    <div className="min-h-screen bg-[#f8f9fa] font-sans selection:bg-[#d11a2a]/10 selection:text-[#d11a2a] overflow-x-hidden">
      
   <Navbar/>


   
{/* --- 2. HERO SECTION (WITH IMAGE ON RIGHT) --- */}
<section className="relative min-h-[112vh] flex items-center bg-[#0a0a0a] overflow-hidden pt-1">
  
  {/* --- 1. THE BACKGROUND IMAGE LAYER --- */}
  <div className="absolute inset-0 z-0">
    <img 
      src="https://disruptivesolutionsinc.com/wp-content/uploads/2025/09/HOME-PAGE-HERO.png" // Palitan mo ng sarili mong image URL
      alt="Engineering Background"
      className="w-full h-full object-cover opacity-40 grayscale-[10%]" 
    />
    {/* Dark Overlays para mabasa ang text */}
    <div className="absolute inset-0 bg-black/60 md:bg-black/40" />
    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
  </div>

  {/* Background Glows (Engineering Vibes) */}
  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/40 via-transparent to-transparent z-[1]" />
  <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-[1]" 
  />

  <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      
      {/* LEFT SIDE: Text Content */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.8 }} 
        className="text-center lg:text-left flex flex-col items-center lg:items-start"
      >
        <span className="inline-flex items-center gap-2 text-[#d11a2a] text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-6 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
          <Sparkles size={14} /> Innovation at our core
        </span>
        
        <h1 className="text-white text-5xl md:text-7xl lg:text-7xl font-black leading-[0.9] tracking-tighter mb-8 uppercase drop-shadow-2xl">
          Disruptive <br /> Solutions <span className="text-[#d11a2a] italic">Inc.</span>
        </h1>
        
        <p className="text-gray-300 text-base md:text-lg max-w-lg leading-relaxed mb-10 font-medium">
          We deliver premium, <span className="text-white font-semibold">future-ready lighting solutions</span> that brighten spaces, cut costs, and power smarter business across the globe.
        </p>

        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
          <Link href="/trusted-technology-brands" className="bg-[#d11a2a] text-white px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 shadow-xl shadow-red-900/30">
            Explore Products
          </Link>
        </div>
      </motion.div>

      {/* RIGHT SIDE: Ang dating Floating Image box, ngayon pwede nating gawing "Tech Frame" */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, x: 30 }} 
        animate={{ opacity: 1, scale: 1, x: 0 }} 
        transition={{ duration: 1, delay: 0.2 }}
        className="relative hidden lg:block"
      >
        <motion.div 
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10"
        >
          {/* Isang Glassmorphism Card para sa Stats sa tapat ng image */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-2xl">
            <h2 className="text-[#d11a2a] font-black text-4xl mb-2 tracking-tighter italic">99.9%</h2>
            <p className="text-white font-bold uppercase text-[10px] tracking-[0.3em] mb-8">System Reliability</p>
            
            <div className="space-y-6">
              {[
                { label: "Precision Engineering", val: "100%" },
                { label: "Energy Savings", val: "75%" },
                { label: "Global Reach", val: "24/7" },
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-end border-b border-white/10 pb-2">
                  <span className="text-gray-400 text-[10px] font-bold uppercase">{stat.label}</span>
                  <span className="text-white font-black text-sm tracking-widest">{stat.val}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

    </div>
  </div>

  {/* Transition to next section */}
  <div className="absolute bottom-0 left-0 w-full h-18 bg-gradient-to-t from-[#f8f9fa] to-transparent z-20" />
</section>
<section className="relative w-full bg-white overflow-hidden py-24">
      {/* Background Grid Layer */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.2]" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #e5e7eb 1px, transparent 4px), linear-gradient(to bottom, #e5e7eb 1px, transparent 4px)`, 
          backgroundSize: '40px 40px' 
        }} 
      />

      {/* Main Container with generous side margins (px-20+) */}
      <div className="max-w-full mx-auto px-8 md:px-16 lg:px-28 relative z-10 flex flex-col items-center">
        
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center text-center mb-16 max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            className="flex flex-col items-center"
          >
            <span className="inline-flex items-center gap-2 text-[#d11a2a] text-[10px] font-black uppercase tracking-[0.4em] mb-6 bg-red-50 px-5 py-2 rounded-full border border-red-100/50">
              <Zap size={12} className="fill-[#d11a2a]" /> Premium Products
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-[-0.04em] uppercase leading-[0.9] mb-8">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d11a2a] to-red-500">Brands</span>
            </h2>
            <div className="h-1.5 w-16 bg-[#d11a2a] mb-8 rounded-full shadow-[0_2px_10px_rgba(209,26,42,0.3)]" />
          </motion.div>
        </div>

        {/* The Grid */}
        <motion.div
          className={`grid gap-5 md:gap-6 w-full justify-center mx-auto ${getGridConfig()}`}
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true }}
          variants={{ 
            hidden: { opacity: 0 }, 
            show: { opacity: 1, transition: { staggerChildren: 0.1 } } 
          }}
        >
          {brands.map((brand) => (
            <motion.div
              key={brand.id}
              variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -8 }}
              className="w-full flex justify-center"
            >
              <Link 
                href={brand.href || "#"} 
                className="group relative w-full h-[400px] md:h-[460px] block rounded-[28px] overflow-hidden bg-gray-900 shadow-xl border border-gray-100 transition-all duration-500"
              >
                {/* Background Image Layer */}
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={brand.image}
                    alt={brand.title}
                    className="w-full h-full object-cover brightness-[0.6] group-hover:scale-110 transition-transform duration-1000 group-hover:brightness-[0.4]"
                  />
                  {/* Fixed Dark Gradient para mabasa agad yung text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                </div>

                {/* Always Visible Content Layer */}
                <div className="absolute inset-0 p-6 md:p-7 flex flex-col justify-end z-10">
                  <div className="mb-4">
                    <span className="bg-[#d11a2a] text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-md">
                      {brand.category}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter leading-tight">
                      {brand.title}
                    </h3>
                    
                    {/* --- DESCRIPTION IS NOW ALWAYS VISIBLE --- */}
                    <p className="text-white/80 text-[10px] md:text-xs leading-relaxed line-clamp-3 font-medium italic">
                      {brand.description}
                    </p>

                    <div className="flex items-center gap-3 pt-2 text-white/60 group-hover:text-[#d11a2a] transition-colors">
                      <div className="h-[1.5px] w-6 bg-white/20 group-hover:bg-[#d11a2a] group-hover:w-10 transition-all duration-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Learn More</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

   <section className="relative py-16 md:py-24 bg-white overflow-hidden border-y border-gray-100">
  <div className="max-w-full mx-auto">
    
    {/* HEADER SECTION */}
    <div className="text-center mb-16 px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <span className="inline-flex items-center gap-2 text-[#d11a2a] text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] mb-4 bg-red-50 px-4 py-2 rounded-full border border-red-100/50">
          <Zap size={12} className="fill-[#d11a2a]" /> Scalable Excellence
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-[0.85]">
          Our Disruptive <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d11a2a] to-red-500">Partners</span>
        </h2>
      </motion.div>
    </div>

    {/* DYNAMIC SLIDER */}
    <div className="relative w-full overflow-hidden py-10">
      <motion.div
        className="flex whitespace-nowrap items-center"
        animate={{ x: ["0%", "-75.33%"] }}
        transition={{
          duration: 30,
          ease: "linear",
          repeat: Infinity
        }}
      >
        {partners.map((logo, idx) => (
          <div 
            key={idx} 
            className="mx-3 md:mx-4 flex items-center justify-center shrink-0"
          >
            {/* --- STEADY TILE WITH ZOOMED LOGO --- */}
            <div className="relative h-28 w-48 md:h-44 md:w-80 bg-white rounded-[24px] flex items-center justify-center p-2 group transition-all duration-500 
                /* FIXED BORDER & STEADY CARD (Walang hover:scale) */
                border-[3px] border-gray-100 hover:border-[#d11a2a]
                /* HEAVY SHADOW */
                shadow-[0_20px_50px_rgba(0,0,0,0.1)] 
                hover:shadow-[0_30px_60px_rgba(209,26,42,0.15)]
                overflow-hidden">
              
              <img
                src={logo}
                alt="Partner Brand"
                /* ZOOMED LOGO: h-[90%] default, scale-125 on hover */
                className="h-[90%] w-[90%] object-contain mix-blend-multiply opacity-100 transition-transform duration-700 ease-out group-hover:scale-125"
              />
            </div>
          </div>
        ))}
      </motion.div>

      {/* Side Fades */}
      <div className="absolute inset-y-0 left-0 w-32 md:w-72 bg-gradient-to-r from-white via-white/95 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 md:w-72 bg-gradient-to-l from-white via-white/95 to-transparent z-10 pointer-events-none" />
    </div>
  </div>
</section>

<section className="relative w-full bg-white py-16 md:py-24">
  {/* 1. Nilagyan natin ng px-8 hanggang px-28 (depende sa screen size)
      2. Max-width is set to [1550px] para hindi lumagpas sa standard viewing angle 
  */}
  <div className="max-w-[1550px] mx-auto px-8 md:px-16 lg:px-28 relative z-10">
    
    {/* HEADER SECTION */}
    <div className="flex flex-col items-center justify-center text-center mb-16 max-w-3xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.8 }} 
        className="flex flex-col items-center"
      >
        <span className="inline-flex items-center gap-2 text-[#d11a2a] text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] mb-6 bg-red-50 px-5 py-2 rounded-full border border-red-100/50">
          <Zap size={12} className="fill-[#d11a2a]" /> Portfolios
        </span>
        <h2 className="text-4xl md:text-5xl lg:text-5xl font-black text-gray-900 tracking-[-0.04em] uppercase leading-[0.9] mb-8">
          Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d11a2a] to-red-500">Projects</span>
        </h2>
        <div className="h-1.5 w-16 bg-[#d11a2a] mb-8 rounded-full shadow-[0_2px_10px_rgba(209,26,42,0.3)]" />
      </motion.div>
    </div>

    {/* GRID: Ngayon ay may sapat na gap at padding sa gilid */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 justify-center">
      {projectsLoading ? (
        <div className="col-span-full py-20 flex justify-center w-full">
          <Loader2 className="animate-spin text-[#d11a2a]" size={40} />
        </div>
      ) : (
        fetchedProjects.map((project) => (
          <motion.div 
            key={project.id} 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            className="w-full"
          >
            <Link 
              href={`/projects/${project.id}`} 
              className="group relative h-[220px] md:h-[400px] block rounded-[32px] overflow-hidden bg-gray-900 shadow-xl border border-gray-100"
            >
              {/* Main Project Image */}
              <img 
                src={project.imageUrl} 
                alt={project.title} 
                className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000 ease-in-out group-hover:opacity-40" 
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 group-hover:opacity-0 transition-opacity duration-500" />
              
              {/* HOVER OVERLAY */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center p-6 text-center">
                {project.logoUrl && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full" />
                    <img 
                      src={project.logoUrl} 
                      alt="Client Logo" 
                      className="relative w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]" 
                    />
                  </motion.div>
                )}
                
              </div>

              {/* Static Content (Visible pag hindi naka-hover) */}
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end group-hover:opacity-0 transition-opacity duration-300">
                <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-tight leading-tight line-clamp-2">
                  {project.title}
                </h3>
              </div>
            </Link>
          </motion.div>
        ))
      )}
    </div>

    {/* SEE MORE BUTTON */}
    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-10 mb-10 flex justify-center">
            <Link href="/projects" className="mt-8 group flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#d11a2a] transition-all">
              View All Projects
              <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-[#d11a2a] group-hover:bg-[#d11a2a] group-hover:text-white transition-all">
                <ArrowRight size={16} />
              </div>
            </Link>
    </motion.div>
  </div>
</section>


      {/* --- 5. LATEST ARTICLES (CENTERED TITLE) --- */}
      <section className="relative py-1 bg-[#fcfcfc] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">

          {/* CENTERED HEADER SECTION */}
          <div className="flex flex-col items-center justify-center text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center w-full"
            >
              {/* BADGE */}
              <span className="inline-flex items-center gap-2 text-[#d11a2a] text-[11px] font-black uppercase tracking-[0.3em] mb-4 bg-red-50 px-4 py-1.5 rounded-full">
                <Zap size={12} className="fill-current" /> Knowledge Base
              </span>

              {/* TITLE */}
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-tight">
                Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d11a2a] to-red-400">Insights</span>
              </h2>

              {/* ACCENT LINE */}
              <div className="h-1.5 w-16 bg-[#d11a2a] mt-6 rounded-full" />
            </motion.div>
          </div>

          {/* The Grid: 3 Columns Desktop / 1 Column Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <Link href={`/blog/${blog.slug || blog.id}`} key={blog.id} className="group">
                  <div className="bg-white border border-gray-100 p-2 h-full flex flex-col transition-all duration-500 hover:shadow-[0_20px_50px_rgba(209,26,42,0.1)]">

                    {/* Image Container */}
                    <div className="relative h-56 bg-gray-50 overflow-hidden mb-6">
                      {blog.coverImage ? (
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 p-4"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 font-black italic text-[10px] uppercase">
                          No Image Available
                        </div>
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="px-4 pb-6 flex-grow flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="h-[1px] w-6 bg-[#d11a2a]" />
                        <span className="text-[#d11a2a] text-[9px] font-black uppercase tracking-widest">
                          {blog.category || "General"}
                        </span>
                      </div>

                      <h3 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter leading-tight mb-4 group-hover:text-[#d11a2a] transition-colors line-clamp-2">
                        {blog.title}
                      </h3>

                      <p className="text-gray-400 text-xs leading-relaxed mb-6 line-clamp-2 font-medium italic">
                        {blog.sections?.[0]?.description || "Click to read more about this disruptive technology update."}
                      </p>

                      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 group-hover:translate-x-2 transition-transform flex items-center gap-2">
                          Read Full Story <ArrowRight size={12} className="text-[#d11a2a]" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              // Skeleton or Placeholder kapag walang articles
              [1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl" />
              ))
            )}
          </div>
        </div>
        {/* CENTERED HEADER SECTION */}
          <div className="flex flex-col items-center justify-center text-center mb-16">
        
            {/* Explore All Link */}
            <Link href="/blog" className="mt-5 group flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#d11a2a] transition-all">
              Explore All Stories
              <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-[#d11a2a] group-hover:bg-[#d11a2a] group-hover:text-white transition-all">
                <ArrowRight size={16} />
              </div>
            </Link>
          </div>
      </section>

      
<Footer/>
    </div>
    </>
  );
}
