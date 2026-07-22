"use client";

import { VisualJar } from "@/components/habit-jar/VisualJar";

interface JarPreviewProps {
  name: string;
  icon: string;
  accentColor: string;
  totalCoins?: number;
}

export function JarPreview({ name, icon, accentColor, totalCoins = 3 }: JarPreviewProps) {
  return (
    <div className="rounded-2xl border border-[var(--jar-border)] bg-gradient-to-br from-white to-[var(--jar-surface-muted)] p-6 text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--jar-text-muted)] mb-4">
        Live preview
      </p>
      <span className="text-3xl" aria-hidden="true">
        {icon}
      </span>
      <p className="mt-2 font-semibold text-[var(--jar-text)] truncate">
        {name || "Your jar name"}
      </p>
      <div className="mt-4 flex justify-center">
        <VisualJar
          totalCoins={totalCoins}
          accentColor={accentColor}
          size="sm"
        />
      </div>
    </div>
  );
}
