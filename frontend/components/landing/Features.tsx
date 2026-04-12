"use client";

import { motion } from "framer-motion";
import {
  Mic,
  Smartphone,
  Download,
  RotateCcw,
  ShieldCheck,
  Zap,
  Globe,
  Palette,
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Voice-first creation",
    description: "Natural language processing understands context, tone, and business details from your speech.",
  },
  {
    icon: Smartphone,
    title: "Mobile responsive",
    description: "Every generated website looks flawless on all devices — desktop, tablet, and mobile.",
  },
  {
    icon: Zap,
    title: "Generated in seconds",
    description: "Powered by Claude AI, your site is built in under 10 seconds. Refresh it as many times as you want.",
  },
  {
    icon: Download,
    title: "Downloadable HTML",
    description: "Get a single, clean HTML file. Host it anywhere — no lock-in, no subscriptions required.",
  },
  {
    icon: Globe,
    title: "Instant publish",
    description: "Get a shareable link immediately. Share it with customers before you've even had your coffee.",
  },
  {
    icon: Palette,
    title: "Brand colors",
    description: "Choose your brand color and the AI intelligently applies it throughout the entire design.",
  },
  {
    icon: RotateCcw,
    title: "One-click regenerate",
    description: "Not happy with the result? Regenerate with different style — same business info.",
  },
  {
    icon: ShieldCheck,
    title: "Validated output",
    description: "Every generated site passes HTML5, accessibility, and mobile responsiveness checks before preview.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-zinc-50 border-t border-zinc-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-4"
          >
            Features
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-[36px] md:text-[44px] font-bold tracking-tight text-zinc-900"
          >
            Everything a small business needs.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-[16px] text-zinc-500 max-w-lg mx-auto"
          >
            Designed specifically for business owners who are great at their craft
            but don't have time for web design.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="group bg-white border border-zinc-200 rounded-2xl p-6 hover:border-zinc-300 hover:shadow-card transition-all duration-200"
            >
              <div className="w-9 h-9 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-zinc-900 group-hover:border-zinc-900 transition-all duration-200">
                <feature.icon
                  size={16}
                  className="text-zinc-600 group-hover:text-white transition-colors duration-200"
                />
              </div>
              <h3 className="text-[14px] font-semibold text-zinc-900 mb-1.5">{feature.title}</h3>
              <p className="text-[13px] text-zinc-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
