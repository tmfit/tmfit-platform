import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: "TMFIT | Nutrizione, movimento e biohacking",
    template: "%s | TMFIT",
  },
  description: siteConfig.description,
  keywords: [
    "TMFIT",
    "Matteo Trobbiani",
    "nutrizione",
    "allenamento personalizzato",
    "biologo nutrizionista",
    "nutraceutica",
    "biohacking",
    "microbiota intestinale",
    "intolleranze alimentari",
    "monitoraggio progressi",
  ],
  openGraph: {
    title: "TMFIT | Nutrizione, movimento e biologia individuale",
    description: siteConfig.description,
    url: siteConfig.siteUrl,
    siteName: "TMFIT",
    locale: "it_IT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TMFIT | Nutrizione, movimento e biohacking",
    description: siteConfig.description,
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f2f0eb",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="it">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
