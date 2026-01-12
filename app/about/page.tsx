"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, Zap, Lightbulb, Target, ArrowRight, ChevronUp, Check, Facebook, Linkedin, Twitter, X } from "lucide-react"
import SignUpNewsletter from "../components/SignUpNewsletter" 
export default function DisruptiveLandingPage() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isNavOpen, setIsNavOpen] = useState(false)

    const LOGO_RED = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-red-scaled.png"
    const LOGO_WHITE = "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-white-scaled.png"

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Products & Solutions", href: "/lighting-products-smart-solutions" },
        { name: "Brands", href: "/trusted-technology-brands" },
        { name: "Contact Us", href: "/contact-us" },
    ]

    const footerLinks = [
        { name: "About Us", href: "/about" },
        { name: "Blog", href: "/blog" },
        { name: "Careers", href: "/careers" },
        { name: "Contact Us", href: "/contact-us" },
    ];


  const brandData = [
    {
      category: "Smart Lighting",
      title: "Zumtobel's Lighting Solutions",
      description: "Global leader in premium lighting solutions, combines design, innovation and sustainability.",
      image: "https://disruptivesolutionsinc.com/wp-content/uploads/2025/11/ZUMTOBELs.png"
    },
    {
      category: "Power Solutions",
      title: "Affordable Lighting That Works as Hard as You Do",
      description: "Smart lighting at smarter prices - reliable quality without compromise",
      image: "https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/Lit-Rectangle-black-scaled-e1754460691526.png"
    }
  ];

    const socials = [
        { icon: Facebook, color: "hover:bg-blue-600" },
        { icon: Twitter, color: "hover:bg-sky-500" },
        { icon: Linkedin, color: "hover:bg-blue-700" }
    ]

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-[#d11a2a]/10 selection:text-[#d11a2a] overflow-x-hidden">

            {/* --- 1. PREMIUM NAVIGATION --- */}
            <nav className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-500 ${isScrolled ? "py-3" : "py-6"}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative">

                    <Link href="/" className="relative z-10">
                        <motion.img
                            animate={{ height: isScrolled ? 40 : 52 }}
                            src={isScrolled ? LOGO_RED : LOGO_WHITE}
                            alt="Logo"
                            className="w-auto object-contain"
                        />
                    </Link>

                    {/* Floating Pill Menu */}
                    <motion.div
                        animate={{
                            backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.05)",
                            backdropFilter: "blur(12px)",
                            padding: isScrolled ? "4px" : "8px",
                            boxShadow: isScrolled ? "0 10px 30px rgba(0,0,0,0.08)" : "none",
                        }}
                        className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center rounded-full border border-white/10"
                    >
                        {navLinks.map((link) => (
                            <Link key={link.name} href={link.href} className={`px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-full relative group ${isScrolled ? "text-gray-900" : "text-white"}`}>
                                <span className="relative z-10 group-hover:text-white transition-colors">{link.name}</span>
                                <motion.span className="absolute inset-0 bg-[#d11a2a] rounded-full -z-0 opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300" />
                            </Link>
                        ))}
                    </motion.div>

                    <div className="hidden lg:block relative z-10">
                        <Link href="/quote" className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${isScrolled ? "bg-[#d11a2a] text-white shadow-lg shadow-red-500/20" : "bg-white text-gray-900 hover:bg-gray-100"}`}>
                            Free Quote <ArrowRight size={14} />
                        </Link>
                    </div>

                    <button className="lg:hidden p-2 relative z-10" onClick={() => setIsNavOpen(true)}>
                        <Menu className={isScrolled ? "text-gray-900" : "text-white"} size={28} />
                    </button>
                </div>
            </nav>

            {/* --- 2. CINEMATIC HERO --- */}
            <section className="relative h-screen flex items-center justify-center bg-[#0a0a0a] overflow-hidden text-center">
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.5 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-white" />

                <div className="relative z-10 px-6 max-w-5xl">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[#d11a2a] text-sm font-black uppercase tracking-[0.5em] mb-6 block"
                    >
                        Innovating the Atmosphere
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-white text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8"
                    >
                        Redefining <br /> <span className="text-[#d11a2a] drop-shadow-[0_0_30px_rgba(209,26,42,0.3)]">Innovation</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto font-medium mb-10"
                    >
                        Integrated smart lighting and IoT solutions engineered for the next generation of architectural excellence.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                    
                    </motion.div>
                </div>
            </section>

            {/* --- 3. ABOUT SECTION (HIGH-END GRID) --- */}
            <section className="py-32 px-6 relative bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-8">
                                Lighting the <br /><span className="text-[#d11a2a]">Future, Today.</span>
                            </h2>
                            <p className="text-gray-500 text-lg leading-relaxed mb-8">
                                Disruptive Solutions Inc. is at the forefront of the smart lighting revolution. We don't just sell lights; we engineer intelligent ecosystems that respond to your needs, reduce costs, and protect the planet.
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                                {[["40%", "Energy Savings"], ["500+", "Projects Done"]].map(([val, label]) => (
                                    <div key={label} className="border-l-4 border-[#d11a2a] pl-4">
                                        <div className="text-3xl font-black text-gray-900">{val}</div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative rounded-[40px] overflow-hidden aspect-video shadow-2xl shadow-black/20"
                        >
                            <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070" className="w-full h-full object-cover" alt="Architecture" />
                            <div className="absolute inset-0 bg-[#d11a2a]/10 mix-blend-overlay" />
                        </motion.div>
                    </div>

                    {/* Core Values / What We Do */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Lightbulb, title: "Why Disruptive?", desc: "Future-ready lighting systems built for the evolving demands of infrastructure." },
                            { icon: Zap, title: "What We Do", desc: "Design and implementation of LED and smart automation for large-scale enterprises." },
                            { icon: Target, title: "Industries", desc: "Warehousing, Logistics, Real Estate, and Corporate Institutional facilities." }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="p-10 rounded-[32px] bg-gray-50 border border-gray-100 group transition-all"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-8 group-hover:bg-[#d11a2a] group-hover:text-white transition-all duration-500">
                                    <item.icon size={28} className="text-[#d11a2a] group-hover:text-white" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tighter">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

                  {/* --- 3. BRANDS SECTION --- */}
                  <section className="relative w-full bg-white overflow-hidden py-24">
                    {/* Subtle Engineering Grid Background */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-[0.3]"
                      style={{
                        backgroundImage: `
                    linear-gradient(to right, #e5e7eb 1px, transparent 4px),
                    linear-gradient(to bottom, #e5e7eb 1px, transparent 4px)
                  `,
                        backgroundSize: '40px 40px',
                      }}
                    />
            
                    <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
            
                      {/* --- BRAND SECTION HEADER (CENTERED & OPTIMIZED) --- */}
                      <div className="flex flex-col items-center justify-center text-center mb-20 max-w-3xl mx-auto px-4">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Mas smooth na "Out-Expo" ease
                          className="flex flex-col items-center"
                        >
                          {/* BADGE */}
                          <span className="inline-flex items-center gap-2 text-[#d11a2a] text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] mb-6 bg-red-50 px-5 py-2 rounded-full border border-red-100/50">
                            <Zap size={12} className="fill-[#d11a2a]" /> Premium Products
                          </span>
            
                          {/* TITLE */}
                          <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-[-0.04em] uppercase leading-[0.9] mb-8">
                            Our <br className="md:hidden" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d11a2a] to-red-500">
                              Brands
                            </span>
                          </h2>
            
                          {/* ACCENT LINE */}
                          <div className="h-1.5 w-16 bg-[#d11a2a] mb-8 rounded-full shadow-[0_2px_10px_rgba(209,26,42,0.3)]" />
            
                          {/* DESCRIPTION */}
                          <p className="text-gray-500 font-medium text-xs md:text-sm leading-relaxed italic max-w-2xl">
                            Empowering your space with world-class engineering and sustainable lighting solutions
                            from our <span className="text-gray-900 font-bold">trusted global technology partners</span>.
                          </p>
                        </motion.div>
                      </div>
            
                      {/* CENTERED GRID */}
                      <motion.div
                        className="flex flex-wrap justify-center gap-8 w-full"
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        variants={{
                          hidden: { opacity: 0 },
                          show: {
                            opacity: 1,
                            transition: { staggerChildren: 0.2 },
                          },
                        }}
                      >
                        {brandData.map((brand, idx) => (
                          <motion.div
                            key={idx}
                            variants={{
                              hidden: { opacity: 0, y: 40 },
                              show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
                            }}
                            whileHover={{ y: -10 }}
                            className="group relative h-[500px] w-full md:w-[calc(50%-1rem)] lg:w-[480px] rounded-[32px] overflow-hidden bg-gray-900 shadow-2xl border border-gray-100 transition-all duration-500"
                          >
                            {/* Image Layer - FIXED BLUR (HINDI NAWAWALA) */}
                            <div className="absolute inset-0 overflow-hidden">
                              <motion.img
                                src={brand.image}
                                alt={brand.title}
                                // Ginamit ang blur-[4px] para sakto lang ang labo. 
                                // Tinanggal ang group-hover:blur-none para manatiling blurred.
                                className="w-full h-full object-cover blur-[4px] brightness-[0.8] transition-transform duration-1000 group-hover:scale-110"
                              />
                              {/* Dark Gradient Overlay - Permanent readability */}
                              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
                            </div>
            
                            {/* Content Overlay */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
                              <div className="mb-4">
                                <span className="bg-[#d11a2a] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg">
                                  {brand.category}
                                </span>
                              </div>
            
                              <div className="transform transition-transform duration-500 group-hover:translate-y-[-5px]">
                                <h3 className="text-2xl md:text-3xl font-black text-white mb-3 uppercase tracking-tighter">
                                  {brand.title}
                                </h3>
                                <p className="text-white/90 text-xs md:text-sm leading-relaxed mb-6 line-clamp-2 group-hover:text-white transition-colors">
                                  {brand.description}
                                </p>
            
                                <div className="flex items-center gap-3 text-white">
                                  <div className="h-[2px] w-8 bg-[#d11a2a] group-hover:w-16 transition-all duration-500" />
                                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                                    View Details
                                  </span>
                                  <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </section>

            {/* --- 5. MODERN FOOTER (ENHANCED & ALIGNED) --- */}
            <footer className="bg-[#0a0a0a] text-white pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-6">

                    {/* TOP GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20 items-start">

                        {/* BRAND COLUMN */}
                        <div className="space-y-8">
                            <img src={LOGO_WHITE} alt="Logo" className="h-12" />

                            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                                The leading edge of lighting technology. Disrupting the standard to
                                build a brighter, smarter world.
                            </p>

                            <div className="flex gap-4">
                                {socials.map((soc, i) => (
                                    <div
                                        key={i}
                                        className={`
                h-10 w-10 rounded-full
                bg-white/5 border border-white/10
                flex items-center justify-center
                cursor-pointer
                transition-all duration-300
                hover:bg-white/10 hover:-translate-y-1
                ${soc.color}
              `}
                                    >
                                        <soc.icon size={18} />
                                    </div>
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
                                            className="
                  text-gray-400 text-sm
                  flex items-center gap-2
                  hover:text-white
                  transition-colors
                  group
                "
                                        >
                                            <span className="h-[2px] w-0 bg-[#d11a2a] group-hover:w-3 transition-all" />
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

            <div className="md:col-span-2 bg-white/5 backdrop-blur-xl rounded-[32px] p-10 border border-white/10 shadow-xl flex flex-col justify-between">
                <SignUpNewsletter></SignUpNewsletter>
            </div>
                    </div>

                    {/* BOTTOM BAR */}
                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-gray-500 tracking-[0.25em] uppercase">
                        <p>© 2026 Disruptive Solutions Inc.</p>

                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            className="
          flex items-center gap-2
          hover:text-[#d11a2a]
          transition-all
        "
                        >
                            Top <ChevronUp size={16} />
                        </button>
                    </div>

                </div>
            </footer>

        </div>
    )
}