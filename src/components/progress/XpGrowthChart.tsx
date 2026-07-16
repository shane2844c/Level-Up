"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { Category, ChartDataPoint } from "@/lib/types";

type DateRange = "7d" | "30d" | "90d" | "all";

interface XpGrowthChartProps {
  data: ChartDataPoint[];
  categories: Category[];
}

function getRangeStart(range: DateRange): Date | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days + 1);
  return d;
}

function getGrouping(range: DateRange): "day" | "week" {
  return range === "90d" || range === "all" ? "week" : "day";
}

function aggregatePoints(
  points: ChartDataPoint[],
  grouping: "day" | "week"
): { date: string; xp: number }[] {
  const map = new Map<string, number>();
  for (const p of points) {
    let key = p.date;
    if (grouping === "week") {
      const d = new Date(p.date);
      const day = d.getDay();
      const diff = day === 0 ? 6 : day - 1;
      d.setDate(d.getDate() - diff);
      key = d.toISOString().slice(0, 10);
    }
    map.set(key, (map.get(key) ?? 0) + p.xp);
  }
  return Array.from(map.entries())
    .map(([date, xp]) => ({ date, xp }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function XpGrowthChart({ data, categories }: XpGrowthChartProps) {
  const [range, setRange] = useState<DateRange>("30d");
  const [categoryId, setCategoryId] = useState<string>("all");

  const chartPoints = useMemo(() => {
    const rangeStart = getRangeStart(range);
    const filtered = data.filter((p) => {
      if (categoryId !== "all" && p.categoryId !== categoryId) return false;
      if (rangeStart && new Date(p.date) < rangeStart) return false;
      return true;
    });
    return aggregatePoints(filtered, getGrouping(range));
  }, [data, range, categoryId]);

  const maxXp = Math.max(...chartPoints.map((p) => p.xp), 1);
  const width = 100;
  const height = 48;
  const padding = 2;

  const points = chartPoints.map((p, i) => {
    const x =
      chartPoints.length <= 1
        ? width / 2
        : padding + (i / (chartPoints.length - 1)) * (width - padding * 2);
    const y = height - padding - (p.xp / maxXp) * (height - padding * 2);
    return { x, y, ...p };
  });

  const linePath =
    points.length > 0
      ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
      : "";

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
      : "";

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-lg font-semibold text-foreground">XP growth</h2>
        <div className="flex flex-wrap gap-2">
          {(["7d", "30d", "90d", "all"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium transition-colors active:opacity-80",
                range === r
                  ? "bg-primary/15 text-primary"
                  : "text-muted hover:text-foreground-secondary"
              )}
            >
              {r === "all" ? "All time" : r.replace("d", " days")}
            </button>
          ))}
        </div>
      </div>

      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="w-full sm:w-auto mb-6"
        aria-label="Filter chart by category"
      >
        <option value="all">All categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      {chartPoints.length === 0 ? (
        <p className="text-sm text-muted text-center py-12">
          No category XP recorded for this period.
        </p>
      ) : (
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-40"
            preserveAspectRatio="none"
            role="img"
            aria-label="Category XP growth chart"
          >
            <defs>
              <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#58C7FF" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#58C7FF" stopOpacity="0" />
              </linearGradient>
            </defs>
            {areaPath && <path d={areaPath} fill="url(#xpGradient)" />}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#58C7FF"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {points.map((p) => (
              <circle
                key={p.date}
                cx={p.x}
                cy={p.y}
                r="0.8"
                fill="#58C7FF"
              />
            ))}
          </svg>
          <div className="flex justify-between text-xs text-muted mt-2">
            <span>{chartPoints[0]?.date}</span>
            <span className="text-primary font-medium">
              Peak: +{maxXp} XP
            </span>
            <span>{chartPoints[chartPoints.length - 1]?.date}</span>
          </div>
        </div>
      )}
    </div>
  );
}
