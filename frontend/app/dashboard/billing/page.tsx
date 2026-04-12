"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Zap, Building2, CreditCard } from "lucide-react";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    features: ["1 website", "Download HTML", "Basic support", "VocalWeb subdomain"],
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹999",
    period: "per month",
    features: [
      "Unlimited websites",
      "Custom domain support",
      "Unlimited regenerations",
      "Priority generation",
      "Analytics dashboard",
      "Email support",
    ],
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    price: "₹2,999",
    period: "per month",
    features: [
      "Everything in Pro",
      "5 team members",
      "White-label option",
      "API access",
      "Dedicated support",
      "Custom integrations",
    ],
    highlight: false,
  },
];

export default function BillingPage() {
  const { data: billing } = useQuery({
    queryKey: ["billing"],
    queryFn: () => apiClient.get("/billing/subscription").then((r) => r.data),
  });

  const upgradeMutation = useMutation({
    mutationFn: (planId: string) =>
      apiClient.post("/billing/create-checkout", { planId }).then((r) => r.data),
    onSuccess: (data) => {
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    },
    onError: () => toast.error("Failed to start checkout. Please try again."),
  });

  const currentPlan = billing?.plan || "free";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[20px] font-bold text-zinc-900 tracking-tight">Billing</h1>
        <p className="text-[13px] text-zinc-400 mt-0.5">Manage your subscription and plan</p>
      </div>

      {/* Current plan */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-zinc-200 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Current plan
            </div>
            <div className="text-[20px] font-bold text-zinc-900 capitalize">
              {currentPlan} Plan
            </div>
            {billing?.renewsAt && (
              <div className="text-[12px] text-zinc-400 mt-1">
                Renews on {new Date(billing.renewsAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-semibold px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              Active
            </div>
          </div>
        </div>

        {currentPlan !== "free" && (
          <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center gap-3">
            <button className="text-[12px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
              Manage subscription
            </button>
            <span className="text-zinc-200">·</span>
            <button className="text-[12px] font-medium text-red-400 hover:text-red-600 transition-colors">
              Cancel plan
            </button>
          </div>
        )}
      </motion.div>

      {/* Plans */}
      <div>
        <h2 className="text-[15px] font-semibold text-zinc-900 mb-4">
          {currentPlan === "free" ? "Upgrade your plan" : "Switch plan"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan, i) => {
            const isCurrent = plan.id === currentPlan;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className={`relative rounded-2xl border p-6 flex flex-col ${
                  plan.highlight
                    ? "bg-zinc-900 border-zinc-800"
                    : "bg-white border-zinc-200"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="bg-white text-zinc-900 text-[10px] font-semibold px-3 py-1 rounded-full border border-zinc-200 shadow-sm">
                      Most popular
                    </div>
                  </div>
                )}

                <div className="mb-5">
                  <div className={`text-[11px] font-semibold uppercase tracking-widest mb-2 ${plan.highlight ? "text-zinc-400" : "text-zinc-400"}`}>
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-[28px] font-bold ${plan.highlight ? "text-white" : "text-zinc-900"}`}>
                      {plan.price}
                    </span>
                    <span className={`text-[12px] ${plan.highlight ? "text-zinc-400" : "text-zinc-400"}`}>
                      /{plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.highlight ? "bg-white/10" : "bg-zinc-50 border border-zinc-200"}`}>
                        <Check size={8} className={plan.highlight ? "text-white" : "text-zinc-700"} strokeWidth={3} />
                      </div>
                      <span className={`text-[12px] ${plan.highlight ? "text-zinc-300" : "text-zinc-600"}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className={`w-full text-center text-[13px] font-medium py-2.5 rounded-xl ${plan.highlight ? "bg-white/10 text-white" : "bg-zinc-50 text-zinc-500"}`}>
                    Current plan
                  </div>
                ) : (
                  <button
                    onClick={() => upgradeMutation.mutate(plan.id)}
                    disabled={upgradeMutation.isPending}
                    className={`w-full text-[13px] font-semibold py-2.5 rounded-xl transition-all ${
                      plan.highlight
                        ? "bg-white text-zinc-900 hover:bg-zinc-100"
                        : "bg-zinc-900 text-white hover:bg-zinc-800"
                    }`}
                  >
                    {plan.id === "free" ? "Downgrade" : `Upgrade to ${plan.name}`}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Payment method */}
      {currentPlan !== "free" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-zinc-200 rounded-2xl p-6"
        >
          <h2 className="text-[13px] font-semibold text-zinc-900 mb-4">Payment method</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 bg-zinc-100 rounded border border-zinc-200 flex items-center justify-center">
              <CreditCard size={14} className="text-zinc-500" />
            </div>
            <div>
              <div className="text-[13px] font-medium text-zinc-900">•••• •••• •••• 4242</div>
              <div className="text-[11px] text-zinc-400">Expires 12/27</div>
            </div>
            <button className="ml-auto text-[12px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
              Update
            </button>
          </div>
        </motion.div>
      )}

      {/* Invoice note */}
      <p className="text-[12px] text-zinc-400 text-center">
        All payments are processed securely via Razorpay. GST invoices available on request.
      </p>
    </div>
  );
}
