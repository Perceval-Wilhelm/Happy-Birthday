import type { NextConfig } from "next";

// Vercel's preview toolbar (comments, sharing) loads from vercel.live; production never needs it.
const toolbar = process.env.VERCEL_ENV === "preview" ? " https://vercel.live" : "";

// Everything the card loads is same-origin, so the policy can stay tight. Next.js inlines its
// bootstrap scripts on a static page, which needs 'unsafe-inline' unless every request gets a nonce.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${toolbar}`,
  `style-src 'self' 'unsafe-inline'${toolbar}`,
  `img-src 'self' data: blob:${toolbar}${toolbar && " https://vercel.com"}`,
  `font-src 'self'${toolbar}${toolbar && " https://assets.vercel.com"}`,
  "media-src 'self'",
  `connect-src 'self'${toolbar}${toolbar && " wss://ws-us3.pusher.com"}`,
  `frame-src${toolbar || " 'none'"}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // The microphone is only ever used to blow out the candles, on this origin.
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), payment=(), usb=(), microphone=(self)" },
  // A personal card: keep it out of search results.
  { key: "X-Robots-Tag", value: "noindex, nofollow, noimageindex" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: process.cwd() },
  devIndicators: false,
  agentRules: false,
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    // Development relies on eval for Fast Refresh, so the policy applies to production builds only.
    if (process.env.NODE_ENV !== "production") return [];
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
