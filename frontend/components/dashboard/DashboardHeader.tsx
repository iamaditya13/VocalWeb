"use client";

import { Bell } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export function DashboardHeader() {
  const { user } = useUser();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <header className="h-16 bg-white border-b border-zinc-100 flex items-center justify-between px-8 sticky top-0 z-30">
      <div>
        <h2 className="text-[14px] font-semibold text-zinc-900">
          {greeting}, {user?.firstName || user?.fullName?.split(" ")[0] || "there"}
        </h2>
        <p className="text-[11px] text-zinc-400 mt-0.5">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-all relative">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-zinc-900 rounded-full" />
        </button>
      </div>
    </header>
  );
}
