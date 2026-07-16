import { cn } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/constants";
import type { TierName } from "@/lib/levels";
import type { LucideIcon } from "lucide-react";

interface TierBadgeProps {
  tier: TierName;
  iconId?: string | null;
  accentColor?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const TIER_STYLES: Record<
  TierName,
  { frame: string; iconBg: string; glow?: string }
> = {
  Beginner: {
    frame: "bg-[#2a2d31] border-border",
    iconBg: "bg-background-secondary",
  },
  Developing: {
    frame: "bg-amber-950/40 border-amber-700/35",
    iconBg: "bg-amber-900/25",
  },
  Disciplined: {
    frame: "bg-slate-500/10 border-slate-400/30",
    iconBg: "bg-slate-400/10",
  },
  Advanced: {
    frame: "bg-yellow-600/12 border-yellow-500/35",
    iconBg: "bg-yellow-500/10",
  },
  Elite: {
    frame: "bg-slate-300/8 border-primary/45 shadow-glow",
    iconBg: "bg-primary/12",
    glow: "shadow-glow",
  },
  Master: {
    frame: "bg-primary/10 border-primary/55 shadow-glow",
    iconBg: "bg-primary/15",
    glow: "shadow-glow",
  },
};

const SIZES = {
  sm: { outer: "h-9 w-9 rounded-lg", inner: "h-6 w-6 rounded-md", icon: "h-3.5 w-3.5" },
  md: { outer: "h-11 w-11 rounded-xl", inner: "h-8 w-8 rounded-lg", icon: "h-4 w-4" },
  lg: { outer: "h-14 w-14 rounded-2xl", inner: "h-10 w-10 rounded-xl", icon: "h-5 w-5" },
};

export function TierBadge({
  tier,
  iconId,
  accentColor,
  size = "md",
  className,
}: TierBadgeProps) {
  const styles = TIER_STYLES[tier];
  const dims = SIZES[size];
  const Icon: LucideIcon = getCategoryIcon(iconId);
  const color = accentColor ?? "#58C7FF";

  return (
    <div
      className={cn(
        "flex items-center justify-center border shrink-0 transition-colors",
        dims.outer,
        styles.frame,
        styles.glow,
        className
      )}
      title={`${tier} badge`}
    >
      <div
        className={cn(
          "flex items-center justify-center",
          dims.inner,
          styles.iconBg
        )}
      >
        <Icon className={dims.icon} style={{ color }} />
      </div>
    </div>
  );
}
