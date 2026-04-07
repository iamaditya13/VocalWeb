"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api";
import { WebsiteCard } from "@/components/dashboard/WebsiteCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Skeleton } from "boneyard-js/react";

export default function WebsitesPage() {
  const [search, setSearch] = useState("");
  const { isLoaded, isSignedIn } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["websites"],
    queryFn: () => apiClient.get("/websites").then((r) => r.data),
    enabled: isLoaded && !!isSignedIn,
  });

  const websites = data?.data || [];
  const filtered = websites.filter((w: Record<string, unknown>) =>
    (w.businessName as string)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-zinc-900 tracking-tight">My Websites</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">
            {websites.length} website{websites.length !== 1 ? "s" : ""} created
          </p>
        </div>
        <Link
          href="/dashboard/create"
          className="flex items-center gap-2 bg-zinc-900 text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl hover:bg-zinc-800 transition-all"
        >
          <Plus size={14} />
          New website
        </Link>
      </div>

      {/* Search */}
      {websites.length > 4 && (
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search websites..."
            className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 rounded-xl text-[13px] text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all"
          />
        </div>
      )}

      {/* Grid */}
      <Skeleton name="websites-grid" loading={isLoading} className="min-h-[300px]">
        {filtered.length === 0 ? (
          <EmptyState
            title={search ? "No results" : "No websites yet"}
            description={
              search
                ? `No websites match "${search}"`
                : "Create your first website using your voice. It takes under 60 seconds."
            }
            cta={!search ? "Create your first website" : undefined}
            ctaHref="/dashboard/create"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((website: Record<string, unknown>, i: number) => (
              <motion.div
                key={website.id as string}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <WebsiteCard website={website} />
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: filtered.length * 0.05, duration: 0.4 }}
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
      </Skeleton>
    </div>
  );
}
