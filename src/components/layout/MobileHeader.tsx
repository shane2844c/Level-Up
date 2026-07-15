"use client";

import { Zap } from "lucide-react";

export function MobileHeader() {
  return (
    <header className="md:hidden flex items-center gap-2 px-4 py-4 border-b border-border bg-background-secondary">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
        <Zap className="h-4 w-4 text-primary" />
      </div>
      <span className="text-lg font-bold text-foreground">Level-Up</span>
    </header>
  );
}
