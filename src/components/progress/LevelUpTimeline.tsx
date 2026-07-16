import { getCategoryIcon } from "@/lib/constants";
import { getTierName } from "@/lib/levels";
import { formatDateTime } from "@/lib/utils";
import type { CategoryLevelEvent } from "@/lib/types";
import { Sparkles } from "lucide-react";

interface LevelUpTimelineProps {
  events: CategoryLevelEvent[];
  title?: string;
  emptyMessage?: string;
}

export function LevelUpTimeline({
  events,
  title = "Recent level-ups",
  emptyMessage = "Level-up events will appear here as your categories advance.",
}: LevelUpTimelineProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-semibold text-foreground mb-4">{title}</h2>

      {events.length === 0 ? (
        <p className="text-sm text-muted text-center py-6">{emptyMessage}</p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => {
            const category = event.category;
            const Icon = getCategoryIcon(category?.icon);
            const accent = category?.accent_color ?? "#58C7FF";

            return (
              <li
                key={event.id}
                className="flex items-center gap-3 py-2 border-b border-border last:border-0"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                  style={{ backgroundColor: `${accent}20` }}
                >
                  <Sparkles className="h-4 w-4" style={{ color: accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {category?.name ?? "Category"} reached Level {event.level}
                  </p>
                  <p className="text-xs text-muted">
                    {getTierName(event.level)} · {formatDateTime(event.reached_at)}
                  </p>
                </div>
                <div className="shrink-0 text-sm font-semibold text-primary">
                  Lv.{event.level}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
