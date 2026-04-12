import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-zinc-100",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
        "before:animate-[shimmer_1.5s_infinite]",
        className
      )}
      {...props}
    />
  );
}

// Preset skeleton shapes for common UI patterns
function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3 rounded-full"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white border border-zinc-100 rounded-2xl overflow-hidden", className)}>
      <Skeleton className="h-2 w-full rounded-none" />
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3.5 w-2/3 rounded-full" />
            <Skeleton className="h-2.5 w-1/3 rounded-full" />
          </div>
          <Skeleton className="h-5 w-12 rounded-full flex-shrink-0" />
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
          <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}

function SkeletonStatsCard({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white border border-zinc-100 rounded-2xl p-5 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-7 w-16 rounded-full" />
      <Skeleton className="h-2.5 w-28 rounded-full" />
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonStatsCard };
