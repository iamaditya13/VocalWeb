import { SkeletonCard, SkeletonStatsCard } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatsCard key={i} />
        ))}
      </div>

      {/* Recent websites header */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="space-y-1.5">
            <div className="h-4 w-32 bg-zinc-100 rounded-full relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent before:animate-[shimmer_1.5s_infinite]" />
            <div className="h-3 w-24 bg-zinc-100 rounded-full relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent before:animate-[shimmer_1.5s_infinite]" />
          </div>
          <div className="h-3 w-14 bg-zinc-100 rounded-full relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent before:animate-[shimmer_1.5s_infinite]" />
        </div>

        {/* Website cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>

      {/* Plan callout */}
      <div className="h-32 bg-zinc-100 rounded-2xl relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent before:animate-[shimmer_1.5s_infinite]" />
    </div>
  );
}
