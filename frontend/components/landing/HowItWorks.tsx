"use client";

import { motion } from "framer-motion";
import { Mic, Wand2, Globe } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Mic,
    title: "Speak about your business",
    description:
      "Click record and describe what you do — your services, hours, location, and personality. No scripts. Just talk.",
  },
  {
    number: "02",
    icon: Wand2,
    title: "AI builds your website",
    description:
      "Our AI understands your business context and generates a complete, beautiful website with all the right sections.",
  },
  {
    number: "03",
    icon: Globe,
    title: "Publish in one click",
    description:
      "Review your site, make any tweaks, then publish instantly. Share your link and start getting customers.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 border-t border-zinc-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-4"
          >
            Process
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-[36px] md:text-[44px] font-bold tracking-tight text-zinc-900"
          >
            Three steps to live.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-4 text-[16px] text-zinc-500 max-w-md mx-auto"
          >
            From idea to published website in under two minutes.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] right-[-50%] h-px bg-zinc-100 z-0" />
              )}

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-center">
                    <step.icon size={20} className="text-zinc-700" />
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-300 font-mono">{step.number}</span>
                </div>

                <h3 className="text-[17px] font-semibold text-zinc-900 mb-2 tracking-tight">{step.title}</h3>
                <p className="text-[14px] text-zinc-500 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
