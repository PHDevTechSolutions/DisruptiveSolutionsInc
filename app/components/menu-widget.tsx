"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MessageSquare, ShoppingCart, LayoutGrid, FileText } from 'lucide-react';
import { cn } from "@/lib/utils";
import Image from 'next/image';
import Link from 'next/link';

// Firebase imports
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

// I-import ang widgets mo
import FloatingChatWidget from './chat-widget';
import QuoteCartPanel from './QuoteCartPanel';

export default function FloatingMenuWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activePanels, setActivePanels] = useState<{chat: boolean, cart: boolean}>({
    chat: false,
    cart: false
  });

  // Notification States
  const [cartCount, setCartCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [hasNotifications, setHasNotifications] = useState(false);

  const togglePanel = (panel: 'chat' | 'cart') => {
    setActivePanels(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }));

    // Clear unread messages when opening chat
    if (panel === 'chat') {
      setUnreadMessages(0);
    }
  };

  // Monitor Cart Count
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("disruptive_quote_cart") || "[]");
      setCartCount(cart.length);
    };

    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  // Monitor Unread Messages from Admin
  useEffect(() => {
    const userData = localStorage.getItem("disruptive_user_session");
    if (!userData) return;

    try {
      const user = JSON.parse(userData);
      const q = query(
        collection(db, "chats"),
        where("website", "==", "disruptivesolutionsinc"),
        where("senderEmail", "==", user.email),
        where("isAdmin", "==", true),
        orderBy("timestamp", "desc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const adminMessages = snapshot.docs.map(doc => doc.data());
        
        // Count unread messages (simplified - you can add a 'read' field in production)
        if (!activePanels.chat && adminMessages.length > 0) {
          setUnreadMessages(adminMessages.length);
        }
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Error monitoring messages:", err);
    }
  }, [activePanels.chat]);

  // Update main hub notification indicator
  useEffect(() => {
    setHasNotifications(cartCount > 0 || unreadMessages > 0);
  }, [cartCount, unreadMessages]);

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4 antialiased font-sans">
      
      {/* The Dynamic Widget Container */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false);
                setActivePanels({ chat: false, cart: false });
              }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[-1]"
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="flex flex-col items-end gap-4 mb-2 w-full max-w-md"
            >

              {/* NEW: View Quotes Button */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Link href="/quote">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 bg-white text-black px-5 py-3 rounded-2xl shadow-2xl hover:shadow-xl transition-all border border-gray-100 w-full"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] font-black uppercase tracking-wider">Free Quotes</span>
                    </div>
                    <div className="w-10 h-10 bg-[#d11a2a] rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                  </motion.button>
                </Link>
              </motion.div>

              {/* Quote Cart - Full Panel or Icon */}
              <AnimatePresence mode="wait">
                {activePanels.cart ? (
                  <motion.div 
                    key="cart-panel"
                    initial={{ x: 20, opacity: 0, scale: 0.9 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ x: 20, opacity: 0, scale: 0.9 }}
                    className="shadow-2xl w-full"
                  >
                    <QuoteCartPanel embedded={true} onClose={() => togglePanel('cart')} />
                  </motion.div>
                ) : (
                  <motion.button
                    key="cart-icon"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    onClick={() => togglePanel('cart')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 bg-white text-black px-5 py-3 rounded-2xl shadow-2xl hover:shadow-xl transition-all border border-gray-100 relative"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] font-black uppercase tracking-wider">Quote Cart</span>
                      <span className="text-[8px] text-gray-400 font-bold">View your items</span>
                    </div>
                    <div className="w-10 h-10 bg-[#d11a2a] rounded-xl flex items-center justify-center relative">
                      <ShoppingCart className="w-5 h-5 text-white" />
                      
                      {/* Cart Count Badge */}
                      {cartCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 bg-white text-[#d11a2a] text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#d11a2a] shadow-lg"
                        >
                          {cartCount}
                        </motion.span>
                      )}
                    </div>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Chat Widget - Full Panel or Icon */}
              <AnimatePresence mode="wait">
                {activePanels.chat ? (
                  <motion.div 
                    key="chat-panel"
                    initial={{ x: 20, opacity: 0, scale: 0.9 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ x: 20, opacity: 0, scale: 0.9 }}
                    className="shadow-2xl w-full"
                  >
                    <FloatingChatWidget embedded={true} onClose={() => togglePanel('chat')} />
                  </motion.div>
                ) : (
                  <motion.button
                    key="chat-icon"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    onClick={() => togglePanel('chat')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 bg-white text-black px-5 py-3 rounded-2xl shadow-2xl hover:shadow-xl transition-all border border-gray-100 relative"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] font-black uppercase tracking-wider">Live Chat</span>
                      <span className="text-[8px] text-gray-400 font-bold">Talk to support</span>
                    </div>
                    <div className="w-10 h-10 bg-[#d11a2a] rounded-xl flex items-center justify-center relative">
                      <MessageSquare className="w-5 h-5 text-white" />
                      
                      {/* Unread Messages Badge */}
                      {unreadMessages > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 bg-white text-[#d11a2a] text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#d11a2a] shadow-lg animate-pulse"
                        >
                          {unreadMessages}
                        </motion.span>
                      )}
                    </div>
                  </motion.button>
                )}
              </AnimatePresence>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* The Main Trigger Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) {
            setActivePanels({ chat: false, cart: false });
          }
        }}
        className={cn(
          "relative h-13 w-13 flex items-center justify-center rounded-full shadow-2xl transition-all duration-500 border",
          isOpen 
            ? "bg-white text-black border-white" 
            : "bg-[#0a0a0a] text-white border-white/10 hover:border-[#d11a2a]/50"
        )}
      >
        {/* Global Notification Indicator - TOTAL COUNT */}
        {!isOpen && hasNotifications && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-[#d11a2a] text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-lg z-10 animate-pulse"
          >
            {cartCount + unreadMessages}
          </motion.span>
        )}

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              className="flex items-center justify-center"
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              className="flex items-center justify-center"
            >
               {/* Logo */}
               <Image 
                 src="/images/icon.png" 
                 alt="Hub Logo" 
                 width={32} 
                 height={32}
                 className="object-contain"
               />
               {/* Pulse Effect */}
               <div className="absolute inset-0 bg-[#d11a2a]/10 animate-pulse rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}