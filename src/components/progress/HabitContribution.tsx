"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { HabitContribution } from "@/lib/types";
import { Repeat } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

interface HabitContributionProps {
  byXp: HabitContribution[];
  byCompletions: HabitContribution[];
}

export function HabitContributionSection({
  byXp,
  byCompletions,
}: HabitContributionProps) {
  const [tab, setTab] = useState<"xp" | "completions">("xp");
  const items = tab === "xp" ? byXp : byCompletions;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Habit contribution
      </h2>

      <div className="flex gap-2 mb-5">
        {(
          [
            { id: "xp" as const, label: "Most XP earned" },
            { id: "completions" as const, label: "Most completed" },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              tab === id
                ? "bg-primary/15 text-primary"
                : "text-muted hover:text-foreground-secondary"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No habit data yet"
          description="Complete good habits to see which ones drive your category XP."
          className="py-8 border-0 bg-transparent"
        />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item, i) => (
            <li key={item.habitId} className="flex items-center gap-4 py-3 first:pt-0">
              <span className="text-xs text-muted w-5 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.habitName}
                </p>
                <p className="text-xs text-muted">{item.categoryName}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium text-positive">
                  +{item.totalXp} XP
                </p>
                <p className="text-xs text-muted">
                  {item.completions} completion{item.completions !== 1 ? "s" : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
