"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
};

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Badge */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-full px-4 py-1.5 text-[12px] font-medium text-zinc-600">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Now live — Build your website in under 60 seconds
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-center text-[52px] md:text-[72px] font-bold tracking-tight text-zinc-900 leading-[1.05] max-w-4xl mx-auto"
        >
          Your business website,
          <br />
          <span className="text-zinc-400">built by your voice.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-center mt-6 text-[17px] text-zinc-500 max-w-xl mx-auto leading-relaxed"
        >
          Describe your business out loud. VocalWeb instantly generates a polished,
          responsive website — no designers, no developers required.
        </motion.p>

        {/* CTAs */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10"
        >
          <Link
            href="/auth/signup"
            className="group flex items-center gap-2 bg-zinc-900 text-white text-[14px] font-semibold px-6 py-3 rounded-xl hover:bg-zinc-800 transition-all duration-150 shadow-sm"
          >
            Start building free
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <button className="flex items-center gap-2 text-[14px] font-medium text-zinc-600 hover:text-zinc-900 px-4 py-3 rounded-xl hover:bg-zinc-50 transition-all">
            <div className="w-7 h-7 bg-zinc-100 rounded-full flex items-center justify-center">
              <Play size={10} className="ml-0.5 text-zinc-700" fill="currentColor" />
            </div>
            Watch 45s demo
          </button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex items-center justify-center gap-6 mt-10 text-[12px] text-zinc-400"
        >
          <span>No credit card required</span>
          <span className="w-1 h-1 bg-zinc-300 rounded-full" />
          <span>Live in 60 seconds</span>
          <span className="w-1 h-1 bg-zinc-300 rounded-full" />
          <span>1,200+ businesses launched</span>
        </motion.div>

        {/* Hero preview */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-16 relative"
        >
          <div className="relative mx-auto max-w-4xl">
            {/* Browser chrome */}
            <div className="bg-zinc-100 rounded-t-2xl border border-zinc-200 border-b-0 px-4 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-zinc-300" />
                <div className="w-3 h-3 rounded-full bg-zinc-300" />
                <div className="w-3 h-3 rounded-full bg-zinc-300" />
              </div>
              <div className="flex-1 bg-white rounded-md h-6 flex items-center px-3">
                <span className="text-[11px] text-zinc-400 font-mono">vocalweb.ai/sites/bloom-salon</span>
              </div>
            </div>

            {/* Preview content */}
            <div className="bg-white border border-zinc-200 rounded-b-2xl overflow-hidden shadow-float">
              <PreviewMockup />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PreviewMockup() {
  return (
    <div className="h-[400px] overflow-hidden relative">
      {/* Mock website preview */}
      <div className="absolute inset-0 flex">
        {/* Left - recording UI */}
        <div className="w-[40%] border-r border-zinc-100 p-8 flex flex-col justify-center gap-6 bg-zinc-50">
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Voice Input</div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shadow-sm">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2C5.5 2 4 3 4 5v2c0 1.7 1.3 3 3 3s3-1.3 3-3V5c0-2-1.5-3-3-3z" fill="white" />
                  <path d="M2 7c0 2.8 2.2 5 5 5s5-2.2 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div className="text-[12px] font-semibold text-zinc-800">Listening...</div>
                <div className="flex gap-0.5 mt-1">
                  {[3, 5, 8, 5, 7, 4, 6, 3, 5].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-zinc-800 rounded-full opacity-80"
                      style={{ height: `${h * 2}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-elegant">
            <div className="text-[11px] text-zinc-500 leading-relaxed">
              "I run a hair salon called Bloom. We have 5 stylists, we do hair, nails, and bridal makeup.
              We're open 9am to 8pm..."
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 h-8 bg-zinc-100 rounded-lg" />
            <div className="w-20 h-8 bg-zinc-900 rounded-lg" />
          </div>
        </div>

        {/* Right - generated website preview */}
        <div className="flex-1 overflow-hidden bg-white">
          <div className="h-full flex flex-col">
            {/* Mock nav */}
            <div className="border-b border-zinc-100 px-6 h-10 flex items-center justify-between bg-white">
              <div className="w-16 h-3 bg-zinc-200 rounded-full" />
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-2 bg-zinc-100 rounded-full" />
                ))}
              </div>
            </div>

            {/* Mock hero */}
            <div className="flex-1 bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center relative overflow-hidden">
              <div className="text-center z-10 px-8">
                <div className="text-[18px] font-bold text-white mb-1">Bloom Salon</div>
                <div className="text-[11px] text-zinc-400 mb-4">Premium Hair & Bridal Services</div>
                <div className="w-20 h-6 bg-white/10 rounded-lg mx-auto border border-white/20" />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
              <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-white/5 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Generation overlay animation */}
      <div className="absolute bottom-4 right-4">
        <div className="bg-zinc-900 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-float">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          Generated in 4.2s
        </div>
      </div>
    </div>
  );
}
