"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Globe,
  Plus,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Websites", href: "/dashboard/websites", icon: Globe },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-[240px] bg-white border-r border-zinc-100 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-100">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-zinc-900 rounded-lg flex items-center justify-center transition-transform group-hover:scale-95">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2C5.5 2 4 3 4 5v2c0 1.7 1.3 3 3 3s3-1.3 3-3V5c0-2-1.5-3-3-3z" fill="white" />
              <path d="M2 7c0 2.8 2.2 5 5 5s5-2.2 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="7" y1="12" x2="7" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-semibold text-[14px] text-zinc-900 tracking-tight">VocalWeb</span>
        </Link>
      </div>

      {/* New website CTA */}
      <div className="px-4 py-4">
        <Link
          href="/dashboard/create"
          className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white text-[13px] font-semibold py-2.5 rounded-xl hover:bg-zinc-800 transition-all"
        >
          <Plus size={14} />
          New website
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 relative group",
                isActive
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-zinc-100 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <item.icon
                size={15}
                className={cn(
                  "relative z-10 transition-colors",
                  isActive ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-600"
                )}
              />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-zinc-100 p-4 space-y-1">
        <a
          href="mailto:support@vocalweb.ai"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 transition-all"
        >
          <HelpCircle size={15} className="text-zinc-400" />
          Help & support
        </a>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-7 h-7 bg-zinc-900 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0">
            {user?.firstName?.[0]?.toUpperCase() || user?.fullName?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-zinc-900 truncate">
              {user?.fullName || user?.firstName || "User"}
            </div>
            <div className="text-[10px] text-zinc-400 truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </div>
          </div>
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="text-zinc-400 hover:text-zinc-700 transition-colors"
            title="Sign out"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
