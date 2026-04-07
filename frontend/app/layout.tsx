import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";
import { BonesRegistry } from "@/components/BonesRegistry";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VocalWeb — Create Your Business Website by Speaking",
    template: "%s | VocalWeb",
  },
  description:
    "Speak about your business, get a beautiful website in seconds. No design skills needed. Built for small business owners.",
  keywords: ["website builder", "voice website", "AI website", "small business website"],
  authors: [{ name: "VocalWeb" }],
  creator: "VocalWeb",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://vocalweb.ai"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vocalweb.ai",
    title: "VocalWeb — Create Your Business Website by Speaking",
    description: "Speak about your business, get a beautiful website in seconds.",
    siteName: "VocalWeb",
  },
  twitter: {
    card: "summary_large_image",
    title: "VocalWeb — Create Your Business Website by Speaking",
    description: "Speak about your business, get a beautiful website in seconds.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable} suppressHydrationWarning>
        <body className="min-h-screen bg-white font-sans text-zinc-900 antialiased">
          <Providers>
            <BonesRegistry />
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#18181b",
                  color: "#fafafa",
                  border: "1px solid #3f3f46",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 500,
                  padding: "12px 16px",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                },
                success: {
                  iconTheme: { primary: "#4ade80", secondary: "#18181b" },
                },
                error: {
                  iconTheme: { primary: "#f87171", secondary: "#18181b" },
                },
              }}
            />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
