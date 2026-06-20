import type { Metadata, Viewport } from "next";
import { PerfInit } from "@/components/app/PerfInit";
import { ServiceWorkerRegister } from "@/components/app/ServiceWorkerRegister";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://shecare.ractrotech.com"),
  title: "She Care — PCOS & PCOD Companion",
  description:
    "Your calm companion for PCOS & PCOD — cycle tracking, insights, and gentle care",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "She Care",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#C4647A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PerfInit />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
