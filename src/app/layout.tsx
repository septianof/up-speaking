import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Nunito, Baloo_2 } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Font ramah anak untuk sisi siswa
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
  display: "swap",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Up Speaking Placement Test",
  description: "Sistem Informasi Tes Penempatan Berbasis Web - Up Speaking Learning Centre",
  icons: {
    icon: "/images/logo_transparent.png",
    shortcut: "/images/logo_transparent.png",
    apple: "/images/logo_transparent.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} ${nunito.variable} ${baloo.variable}`}>
      <body className="min-h-screen bg-surface-bg text-text-primary antialiased selection:bg-primary-100 selection:text-primary-700">
        {children}
      </body>
    </html>
  );
}
