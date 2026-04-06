"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-elegant"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 bg-zinc-900 rounded-lg flex items-center justify-center transition-transform group-hover:scale-95">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 2C5.5 2 4 3 4 5v2c0 1.7 1.3 3 3 3s3-1.3 3-3V5c0-2-1.5-3-3-3z"
                  fill="white"
                  opacity="0.9"
                />
                <path d="M2 7c0 2.8 2.2 5 5 5s5-2.2 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                <line x1="7" y1="12" x2="7" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              </svg>
            </div>
            <span className="font-semibold text-[15px] text-zinc-900 tracking-tight">VocalWeb</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "How it works", href: "#how-it-works" },
              { label: "Features", href: "#features" },
              { label: "Pricing", href: "#pricing" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[13px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-[13px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="text-[13px] font-semibold bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-all duration-150 shadow-sm"
            >
              Get started free
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-0 top-16 z-40 bg-white border-b border-zinc-100 p-6 md:hidden shadow-float"
          >
            <div className="flex flex-col gap-4">
              {["How it works", "Features", "Pricing"].map((label) => (
                <a
                  key={label}
                  href={`#${label.toLowerCase().replace(" ", "-")}`}
                  onClick={() => setMobileOpen(false)}
                  className="text-[14px] font-medium text-zinc-600 hover:text-zinc-900 py-1"
                >
                  {label}
                </a>
              ))}
              <div className="pt-4 border-t border-zinc-100 flex flex-col gap-3">
                <Link href="/auth/login" className="text-center text-[14px] font-medium text-zinc-600 py-2">
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-center text-[14px] font-semibold bg-zinc-900 text-white py-2.5 rounded-lg"
                >
                  Get started free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
