"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect for trying it out.",
    features: [
      "1 website",
      "Download HTML",
      "Basic support",
      "VocalWeb subdomain",
    ],
    cta: "Get started",
    href: "/auth/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹999",
    period: "per month",
    description: "For growing businesses.",
    features: [
      "Unlimited websites",
      "Custom domain support",
      "Unlimited regenerations",
      "Priority generation",
      "Analytics dashboard",
      "Email support",
    ],
    cta: "Start Pro",
    href: "/auth/signup?plan=pro",
    highlight: true,
  },
  {
    name: "Business",
    price: "₹2,999",
    period: "per month",
    description: "For agencies and teams.",
    features: [
      "Everything in Pro",
      "5 team members",
      "White-label option",
      "API access",
      "Dedicated support",
      "Custom integrations",
    ],
    cta: "Start Business",
    href: "/auth/signup?plan=business",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-zinc-50 border-t border-zinc-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-4"
          >
            Pricing
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-[36px] md:text-[44px] font-bold tracking-tight text-zinc-900"
          >
            Simple, honest pricing.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-[16px] text-zinc-500"
          >
            Start for free. Upgrade when you're ready.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.highlight
                  ? "bg-zinc-900 border-zinc-800 text-white"
                  : "bg-white border-zinc-200"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="bg-white text-zinc-900 text-[11px] font-semibold px-3 py-1 rounded-full border border-zinc-200 shadow-sm">
                    Most popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className={`text-[12px] font-semibold uppercase tracking-widest mb-3 ${plan.highlight ? "text-zinc-400" : "text-zinc-400"}`}>
                  {plan.name}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-[36px] font-bold tracking-tight ${plan.highlight ? "text-white" : "text-zinc-900"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-[13px] ${plan.highlight ? "text-zinc-400" : "text-zinc-400"}`}>
                    /{plan.period}
                  </span>
                </div>
                <p className={`text-[13px] ${plan.highlight ? "text-zinc-400" : "text-zinc-500"}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      plan.highlight ? "bg-white/10" : "bg-zinc-50 border border-zinc-200"
                    }`}>
                      <Check size={9} className={plan.highlight ? "text-white" : "text-zinc-700"} strokeWidth={3} />
                    </div>
                    <span className={`text-[13px] ${plan.highlight ? "text-zinc-300" : "text-zinc-600"}`}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full text-center text-[14px] font-semibold py-3 rounded-xl transition-all duration-150 ${
                  plan.highlight
                    ? "bg-white text-zinc-900 hover:bg-zinc-50"
                    : "bg-zinc-900 text-white hover:bg-zinc-800"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8 text-[12px] text-zinc-400"
        >
          All plans include SSL, mobile-responsive design, and SEO-ready HTML.
          Cancel anytime. No questions asked.
        </motion.p>
      </div>
    </section>
  );
}
