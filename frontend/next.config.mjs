import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "vocalweb.ai"],
    },
    // Tree-shake large packages — avoids shipping unused icons/components
    optimizePackageImports: ["framer-motion", "lucide-react", "date-fns"],
  },

  // Compress responses with gzip
  compress: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
    // Serve modern formats (avif/webp) automatically
    formats: ["image/avif", "image/webp"],
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },

  // Security headers + production-only static asset caching
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    return [
      ...(isProd
        ? [
            {
              source: "/_next/static/:path*",
              headers: [
                { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
              ],
            },
          ]
        : []),
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
