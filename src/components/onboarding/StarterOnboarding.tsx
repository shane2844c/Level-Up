"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { seedStarterData } from "@/lib/actions";
import { useToast } from "@/components/ui/Toast";

export function StarterOnboarding() {
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();

  const handleSeed = async () => {
    setLoading(true);
    const result = await seedStarterData();
    setLoading(false);
    if (result.error) {
      showToast(result.error, "error");
    } else {
      showToast("Starter examples added!", "success");
      startTransition(() => router.refresh());
    }
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground">New here?</p>
          <p className="text-sm text-foreground-secondary mt-0.5">
            Optionally load starter categories, habits and rewards to explore the app.
          </p>
        </div>
      </div>
      <button
        onClick={handleSeed}
        disabled={loading}
        className="shrink-0 px-4 py-2 rounded-lg bg-primary/15 text-primary font-medium hover:bg-primary/25 transition-colors"
      >
        {loading ? "Adding..." : "Use starter examples"}
      </button>
    </div>
  );
}
