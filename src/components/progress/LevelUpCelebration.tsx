"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTierName, isBadgeTierLevel } from "@/lib/levels";

interface LevelUpNotice {
  id: string;
  categoryName: string;
  level: number;
  isBadge: boolean;
}

interface LevelUpContextValue {
  celebrateLevelUps: (categoryName: string, levels: number[]) => void;
}

const LevelUpContext = createContext<LevelUpContextValue | null>(null);

export function LevelUpProvider({ children }: { children: ReactNode }) {
  const [notices, setNotices] = useState<LevelUpNotice[]>([]);

  const celebrateLevelUps = useCallback(
    (categoryName: string, levels: number[]) => {
      if (levels.length === 0) return;

      const newNotices = levels.map((level) => ({
        id: crypto.randomUUID(),
        categoryName,
        level,
        isBadge: isBadgeTierLevel(level),
      }));

      setNotices((prev) => [...prev, ...newNotices]);

      newNotices.forEach((notice) => {
        setTimeout(() => {
          setNotices((prev) => prev.filter((n) => n.id !== notice.id));
        }, notice.isBadge ? 4500 : 3000);
      });
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <LevelUpContext.Provider value={{ celebrateLevelUps }}>
      {children}
      {notices.length > 0 && (
        <div className="fixed top-[calc(1rem+env(safe-area-inset-top,0px))] md:top-6 right-4 z-50 flex flex-col gap-2 max-w-sm safe-area-pr">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={cn(
                "rounded-xl border px-4 py-3 shadow-card",
                notice.isBadge
                  ? "bg-card-elevated border-primary/40"
                  : "bg-card border-border"
              )}
              role="status"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                    notice.isBadge ? "bg-primary/15" : "bg-background-secondary"
                  )}
                >
                  <Sparkles
                    className={cn(
                      "h-4 w-4",
                      notice.isBadge ? "text-primary" : "text-foreground-secondary"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {notice.isBadge ? "New badge unlocked" : "Level up!"}
                  </p>
                  <p className="text-sm text-foreground-secondary mt-0.5">
                    {notice.categoryName} reached Level {notice.level}
                  </p>
                  {notice.isBadge && (
                    <p className="text-xs text-primary mt-1">
                      {getTierName(notice.level)} badge earned
                    </p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(notice.id)}
                  className="text-muted hover:text-foreground text-xs"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </LevelUpContext.Provider>
  );
}

export function useLevelUpCelebration() {
  const context = useContext(LevelUpContext);
  if (!context) {
    throw new Error("useLevelUpCelebration must be used within LevelUpProvider");
  }
  return context;
}
