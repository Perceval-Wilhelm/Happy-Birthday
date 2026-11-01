import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Dancing_Script, Playfair_Display } from "next/font/google";
import type { ReactNode } from "react";
import { ErrorReporter } from "@/components/error-reporter";
import { SiteMonitoring } from "@/components/site-monitoring";
import { card } from "@/content/card";
import "@/features/card/card.css";

// Self-hosted at build time, each with the Vietnamese subset so no letter falls back to another font.
const sans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "600"],
  variable: "--font-sans",
  display: "swap",
});
const serif = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const script = Dancing_Script({ subsets: ["latin", "vietnamese"], variable: "--font-script", display: "swap" });

const teaser = "Có một món quà nhỏ đang chờ mở ✨";

// Vercel provides the project's production domain, so share previews link to the real site.
const domain = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const metadata: Metadata = {
  metadataBase: new URL(domain ? `https://${domain}` : "http://localhost:3000"),
  title: "Happy Birthday! 🎂",
  description: teaser,
  // A personal card: keep it out of search engines.
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  openGraph: { title: `Gửi ${card.you} ${card.name} 💌`, description: teaser, type: "website", locale: "vi_VN" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#0b0820", viewportFit: "cover" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={`${sans.variable} ${serif.variable} ${script.variable}`}>
      <body>
        {children}
        <ErrorReporter />
        <SiteMonitoring enabled={process.env.VERCEL_ENV === "production" && process.env.NODE_ENV === "production"} />
      </body>
    </html>
  );
}
