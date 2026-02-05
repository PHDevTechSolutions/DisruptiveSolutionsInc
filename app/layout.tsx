import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 1. IMPORT TOASTER
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- FULLY UPDATED METADATA ---
export const metadata: Metadata = {
  title: {
    default: "Disruptive Solutions Inc.",
    template: "%s | Disruptive Solutions Inc.",
  },
  description: "Innovative lighting and smart solutions for modern spaces.",
  
  // --- ADDED GOOGLE VERIFICATION ---
  verification: {
    google: "YwPOzsVV68RGo2ZSrNyvFSKJZF9cNkAmmluFv-jHkHw",
  },

  // Icon Configuration
  icons: {
    icon: "/images/icon.png",
    shortcut: "/images/icon.png",
    apple: "/images/icon.png",
  },

  // OpenGraph Configuration (Para sa Facebook, LinkedIn, etc.)
  openGraph: {
    title: "Disruptive Solutions Inc.",
    description: "Innovative lighting and smart solutions for modern spaces.",
    url: "https://disruptivesolutionsinc.com", 
    siteName: "Disruptive Solutions Inc.",
    images: [
      {
        url: "/images/icon.png", 
        width: 800,
        height: 600,
        alt: "Disruptive Solutions Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter Configuration (Para sa X/Twitter cards)
  twitter: {
    card: "summary_large_image",
    title: "Disruptive Solutions Inc.",
    description: "Innovative lighting and smart solutions.",
    images: ["/images/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 2. ADD TOASTER COMPONENT */}
        <Toaster position="top-center" richColors closeButton />
        {children}
      </body>
    </html>
  );
}