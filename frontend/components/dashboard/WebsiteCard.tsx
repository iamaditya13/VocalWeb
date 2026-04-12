"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, Download, RotateCcw, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Website {
  id: string;
  businessName: string;
  themeColor: string;
  status: "generating" | "ready" | "failed";
  liveUrl?: string;
  createdAt: string;
  regenerationCount: number;
  validationPassed: boolean;
}

export function WebsiteCard({ website }: { website: Record<string, unknown> }) {
  const site = website as unknown as Website;
  const statusConfig = {
    generating: { label: "Generating", color: "bg-amber-50 text-amber-700 border-amber-100" },
    ready: { label: "Ready", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    failed: { label: "Failed", color: "bg-red-50 text-red-700 border-red-100" },
  };

  const status = statusConfig[site.status] || statusConfig.ready;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-card-hover hover:border-zinc-300 transition-all duration-200 group"
    >
      {/* Color preview bar */}
      <div
        className="h-2 w-full"
        style={{ backgroundColor: site.themeColor || "#18181b" }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="text-[14px] font-semibold text-zinc-900 leading-tight">
              {site.businessName || "Untitled"}
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {formatDistanceToNow(new Date(site.createdAt), { addSuffix: true })}
            </p>
          </div>
          <div
            className={cn(
              "flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border",
              status.color
            )}
          >
            {status.label}
          </div>
        </div>

        {/* Miniature preview */}
        <div className="h-20 bg-zinc-50 rounded-xl border border-zinc-100 mb-4 overflow-hidden flex items-center justify-center">
          {site.status === "generating" ? (
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          ) : (
            <div className="w-full h-full relative overflow-hidden">
              <div
                className="absolute inset-x-0 top-0 h-6 flex items-center px-3 justify-between"
                style={{ backgroundColor: site.themeColor || "#18181b" }}
              >
                <div className="w-10 h-1.5 bg-white/50 rounded-full" />
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-5 h-1 bg-white/30 rounded-full" />
                  ))}
                </div>
              </div>
              <div className="absolute inset-x-0 top-6 bottom-0 bg-white p-2 space-y-1.5">
                <div className="h-1.5 bg-zinc-100 rounded w-3/4" />
                <div className="h-1 bg-zinc-100 rounded w-full" />
                <div className="h-1 bg-zinc-100 rounded w-5/6" />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/websites/${site.id}`}
            className="flex-1 text-center text-[12px] font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 py-2 rounded-lg hover:bg-zinc-100 transition-all"
          >
            View
          </Link>
          {site.liveUrl && (
            <a
              href={site.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-all"
            >
              <ExternalLink size={12} />
            </a>
          )}
          <button className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-all">
            <MoreHorizontal size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
