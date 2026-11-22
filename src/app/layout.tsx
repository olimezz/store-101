import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "STORE 101 — Pneumatici Premium Estivi, Invernali e 4 Stagioni",
    template: "%s | STORE 101",
  },
  description:
    "Acquista online pneumatici premium Michelin, Bridgestone, Goodyear, Pirelli e Continental. Spedizione Express 24/48h, sconto -5% su 4 gomme e checkout sicuro Stripe.",
  keywords: [
    "pneumatici online",
    "gomme auto",
    "pneumatici estivi",
    "pneumatici invernali",
    "4 stagioni",
    "STORE 101",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0052FF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A] antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
