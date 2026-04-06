"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Globe, Zap, TrendingUp, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { WebsiteCard } from "@/components/dashboard/WebsiteCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiClient.get("/dashboard/stats").then((r) => r.data),
  });

  const { data: websites, isLoading: websitesLoading } = useQuery({
    queryKey: ["websites-recent"],
    queryFn: () => apiClient.get("/websites?limit=6").then((r) => r.data),
  });

  const statItems = [
    {
      label: "Total websites",
      value: stats?.totalWebsites ?? 0,
      icon: Globe,
      change: `${stats?.thisMonth ?? 0} this month`,
    },
    {
      label: "Live websites",
      value: stats?.liveWebsites ?? 0,
      icon: TrendingUp,
      change: "Currently published",
    },
    {
      label: "Generations used",
      value: stats?.generationsUsed ?? 0,
      icon: Zap,
      change: `Limit: ${stats?.generationLimit ?? "∞"}`,
    },
    {
      label: "Last generated",
      value: stats?.lastGeneratedAgo ?? "—",
      icon: Clock,
      change: "Most recent activity",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Stats */}
      <div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statItems.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              {statsLoading ? (
                <Skeleton className="h-28 rounded-2xl" />
              ) : (
                <StatsCard {...stat} />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent websites */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[16px] font-semibold text-zinc-900">Recent websites</h2>
            <p className="text-[12px] text-zinc-400 mt-0.5">Your latest creations</p>
          </div>
          <Link
            href="/dashboard/websites"
            className="text-[12px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            View all →
          </Link>
        </div>

        {websitesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-2xl" />
            ))}
          </div>
        ) : websites?.data?.length === 0 ? (
          <EmptyState
            title="No websites yet"
            description="Create your first website using your voice. It takes under 60 seconds."
            cta="Create your first website"
            ctaHref="/dashboard/create"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {websites?.data?.map((website: Record<string, unknown>, i: number) => (
              <motion.div
                key={website.id as string}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
              >
                <WebsiteCard website={website} />
              </motion.div>
            ))}

            {/* New website card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (websites?.data?.length || 0) * 0.06, duration: 0.4 }}
            >
              <Link
                href="/dashboard/create"
                className="flex flex-col items-center justify-center h-52 rounded-2xl border-2 border-dashed border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 transition-all group"
              >
                <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center group-hover:bg-zinc-200 transition-colors mb-3">
                  <Plus size={18} className="text-zinc-500" />
                </div>
                <span className="text-[13px] font-medium text-zinc-500 group-hover:text-zinc-700">
                  Create new website
                </span>
              </Link>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Plan callout */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="bg-zinc-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            Free Plan
          </div>
          <h3 className="text-[16px] font-semibold mb-1">Upgrade for unlimited websites</h3>
          <p className="text-[13px] text-zinc-400">
            Pro gives you unlimited sites, custom domains, and priority generation.
          </p>
        </div>
        <Link
          href="/dashboard/billing"
          className="flex-shrink-0 bg-white text-zinc-900 text-[13px] font-semibold px-5 py-2.5 rounded-xl hover:bg-zinc-100 transition-all"
        >
          Upgrade to Pro
        </Link>
      </motion.div>
    </div>
  );
}
