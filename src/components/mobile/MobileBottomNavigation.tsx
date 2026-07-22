"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Sun,
  Route,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/jars", label: "Jars", icon: LayoutGrid },
  { href: "/today", label: "Today", icon: Sun },
  { href: "/journey", label: "Journey", icon: Route },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--jar-border)] bg-white/95 backdrop-blur-md shadow-[0_-4px_24px_rgba(15,23,42,0.06)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-stretch justify-around px-1 pt-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-[52px] min-w-[56px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 transition-colors active:opacity-70",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50",
                active ? "text-indigo-600" : "text-[var(--jar-text-muted)]"
              )}
              aria-current={active ? "page" : undefined}
              aria-label={label}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} aria-hidden="true" />
              <span className="text-[10px] font-semibold leading-none">{label}</span>
              {active && (
                <span className="h-1 w-1 rounded-full bg-indigo-500 mt-0.5" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
