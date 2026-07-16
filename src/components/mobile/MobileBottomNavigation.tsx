"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
  Ellipsis,
  Gift,
  House,
} from "lucide-react";
import { MobileMoreSheet } from "@/components/mobile/MobileMoreSheet";
import { cn } from "@/lib/utils";

const primaryNav = [
  { href: "/dashboard", label: "Dashboard", icon: House },
  { href: "/habits", label: "Habits", icon: CheckCircle2 },
  { href: "/progress", label: "Progress", icon: ChartNoAxesColumnIncreasing },
  { href: "/rewards", label: "Rewards", icon: Gift },
] as const;

const moreRoutes = ["/categories", "/history", "/settings"];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNavigation() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = moreRoutes.some((route) => isActive(pathname, route));

  return (
    <>
      <nav
        aria-label="Primary navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card-elevated/95 backdrop-blur-sm"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-stretch justify-around px-1 pt-1">
          {primaryNav.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-h-[48px] min-w-[64px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 transition-colors active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  active ? "text-primary" : "text-muted"
                )}
                aria-current={active ? "page" : undefined}
                aria-label={label}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="text-[11px] font-medium leading-none">{label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex min-h-[48px] min-w-[64px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 transition-colors active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              moreActive || moreOpen ? "text-primary" : "text-muted"
            )}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
            aria-label="More"
          >
            <Ellipsis className="h-5 w-5" aria-hidden="true" />
            <span className="text-[11px] font-medium leading-none">More</span>
          </button>
        </div>
      </nav>

      <MobileMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
