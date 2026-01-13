import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- UPDATED METADATA ---
export const metadata: Metadata = {
  // Title Configuration
  title: {
    default: "Disruptive Solutions Inc.", // Default title para sa homepage
    template: "%s | Disruptive Solutions Inc.", // Template para sa ibang pages (e.g., "About | Disruptive...")
  },
  description: "Innovative lighting and smart solutions for modern spaces.",
  
  // Icon Configuration
  icons: {
    icon: "/favicon.ico", // Siguraduhin na ang file na ito ay nasa loob ng /public folder
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png", // Optional: para sa iPhone home screen
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Kahit hindi maglagay ng <link> dito, automatic na babasahin ni Next.js ang icons sa metadata */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}