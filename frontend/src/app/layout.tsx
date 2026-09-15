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

export const metadata: Metadata = {
  title: {
    default: "Validra — Intelligent Packaged Commodity Compliance System",
    template: "%s | Validra",
  },
  description:
    "AI-assisted packaged commodity compliance checking system under India's Legal Metrology Act, 2009 and Packaged Commodities Rules, 2011. Automated OCR, deterministic rule validation, and court-admissible evidence reporting.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500 selection:text-zinc-950">
        {children}
      </body>
    </html>
  );
}
