import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
}

export function StatsCard({ label, value, icon: Icon, change }: StatsCardProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-card transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{label}</span>
        <div className="w-7 h-7 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-center">
          <Icon size={13} className="text-zinc-500" />
        </div>
      </div>
      <div className="text-[26px] font-bold text-zinc-900 tracking-tight leading-none mb-1">
        {value}
      </div>
      {change && (
        <div className="text-[11px] text-zinc-400 mt-1.5">{change}</div>
      )}
    </div>
  );
}
