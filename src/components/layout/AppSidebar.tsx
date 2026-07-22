"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Sun,
  Route,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions";

const navItems = [
  { href: "/jars", label: "My Jars", icon: LayoutGrid },
  { href: "/today", label: "Today", icon: Sun },
  { href: "/journey", label: "Journey", icon: Route },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-[17rem] md:flex-col md:fixed md:inset-y-0 border-r border-[var(--jar-border)] bg-white/90 backdrop-blur-md z-30">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white shadow-lg shadow-indigo-500/20">
          <LayoutGrid className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <span className="text-lg font-bold text-[var(--jar-text)]">Habit Jars</span>
          <p className="text-[11px] text-[var(--jar-text-muted)]">Build your identity</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all",
                active
                  ? "bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-indigo-600 shadow-sm border border-indigo-100"
                  : "text-[var(--jar-text-secondary)] hover:text-[var(--jar-text)] hover:bg-[var(--jar-surface-muted)]"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={cn("h-5 w-5", active && "text-indigo-500")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--jar-border)]">
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--jar-text-secondary)] hover:bg-[var(--jar-surface-muted)] hover:text-[var(--jar-text)] transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
