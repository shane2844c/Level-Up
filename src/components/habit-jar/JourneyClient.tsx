"use client";

import { useMemo } from "react";
import { formatRelativeTime } from "@/lib/utils";
import { buildJourneyEvents, type JourneyEvent } from "@/lib/jar-stats";
import type { Habit, XpTransaction } from "@/lib/types";
import { mapCompletionTransactions } from "@/lib/jar-stats";
import { Sparkles, Trophy, Flame, Coins } from "lucide-react";

interface JourneyClientProps {
  habits: Habit[];
  completions: Pick<XpTransaction, "id" | "habit_id" | "created_at">[];
}

export function JourneyClient({ habits, completions }: JourneyClientProps) {
  const events = useMemo(() => {
    const rows = mapCompletionTransactions(completions);
    return buildJourneyEvents(habits, rows);
  }, [habits, completions]);

  return (
    <>
      <header className="mb-8 rounded-[2rem] bg-gradient-to-br from-[#fef3c7] via-[#fce7f3] to-[#e0e7ff] p-6 md:p-8 border border-white/70 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--jar-text)]">Your Journey</h1>
        <p className="mt-2 text-[var(--jar-text-secondary)] max-w-lg">
          Every coin is evidence of the person you&apos;re becoming. These are the moments that matter.
        </p>
      </header>

      {events.length === 0 ? (
        <p className="text-center text-[var(--jar-text-muted)] py-16">
          Your journey begins with your first coin. Head to My Jars to get started.
        </p>
      ) : (
        <JourneyTimeline events={events} />
      )}
    </>
  );
}

function JourneyTimeline({ events }: { events: JourneyEvent[] }) {
  return (
    <ol className="relative space-y-4 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-indigo-200 before:to-pink-200">
      {events.map((event) => (
        <li key={event.id} className="relative pl-12">
          <span
            className="absolute left-2 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md border border-white"
            style={{ color: event.accentColor ?? "#6366f1" }}
          >
            {event.type === "milestone" ? (
              <Trophy className="h-3.5 w-3.5" />
            ) : event.type === "streak" ? (
              <Flame className="h-3.5 w-3.5" />
            ) : (
              <Coins className="h-3.5 w-3.5" />
            )}
          </span>
          <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-[var(--jar-text)]">{event.title}</p>
                {event.subtitle && (
                  <p className="text-sm text-[var(--jar-text-secondary)] mt-1 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    {event.subtitle}
                  </p>
                )}
              </div>
              <time className="text-xs text-[var(--jar-text-muted)] shrink-0">
                {formatRelativeTime(event.createdAt)}
              </time>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
