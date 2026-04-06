import Link from "next/link";
import { Globe } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  cta?: string;
  ctaHref?: string;
}

export function EmptyState({ title, description, cta, ctaHref }: EmptyStateProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-16 text-center">
      <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Globe size={20} className="text-zinc-300" />
      </div>
      <h3 className="text-[15px] font-semibold text-zinc-900 mb-2">{title}</h3>
      <p className="text-[13px] text-zinc-500 max-w-xs mx-auto mb-6 leading-relaxed">{description}</p>
      {cta && ctaHref && (
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 bg-zinc-900 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl hover:bg-zinc-800 transition-all"
        >
          {cta}
        </Link>
      )}
    </div>
  );
}
