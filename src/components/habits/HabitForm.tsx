"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import {
  MIN_HABIT_XP,
  MAX_HABIT_XP,
  validateHabitXp,
} from "@/lib/levels";
import type { Category, Habit, HabitType } from "@/lib/types";

interface HabitFormProps {
  habit?: Habit;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function HabitForm({ habit, categories, onSuccess, onCancel }: HabitFormProps) {
  const [name, setName] = useState(habit?.name ?? "");
  const [description, setDescription] = useState(habit?.description ?? "");
  const [categoryId, setCategoryId] = useState(
    habit?.category_id ?? categories[0]?.id ?? ""
  );
  const [habitType, setHabitType] = useState<HabitType>(habit?.habit_type ?? "good");
  const [xpAmount, setXpAmount] = useState(habit?.xp_amount?.toString() ?? "20");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Habit name is required.");
      return;
    }
    if (!categoryId) {
      setError("Please select a category.");
      return;
    }
    const xp = parseInt(xpAmount, 10);
    const xpError = validateHabitXp(xp);
    if (xpError) {
      setError(xpError);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        category_id: categoryId,
        habit_type: habitType,
        xp_amount: xp,
      };

      if (habit) {
        const { error: updateError } = await supabase
          .from("habits")
          .update(payload)
          .eq("id", habit.id);
        if (updateError) throw updateError;
        showToast("Habit updated", "success");
      } else {
        const { error: insertError } = await supabase
          .from("habits")
          .insert({ ...payload, user_id: user.id });
        if (insertError) throw insertError;
        showToast("Habit created", "success");
      }
      onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (categories.length === 0) {
    return (
      <p className="text-sm text-foreground-secondary">
        Create a category first before adding habits.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="habit-name" className="block text-sm font-medium text-foreground-secondary mb-1.5">
          Name
        </label>
        <input
          id="habit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Morning run"
          required
        />
      </div>

      <div>
        <label htmlFor="habit-desc" className="block text-sm font-medium text-foreground-secondary mb-1.5">
          Description (optional)
        </label>
        <textarea
          id="habit-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <label htmlFor="habit-category" className="block text-sm font-medium text-foreground-secondary mb-1.5">
          Category
        </label>
        <select
          id="habit-category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="block text-sm font-medium text-foreground-secondary mb-2">
          Habit type
        </span>
        <div className="flex gap-3">
          {(["good", "bad"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setHabitType(type)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                habitType === type
                  ? type === "good"
                    ? "border-positive bg-positive/15 text-positive"
                    : "border-negative bg-negative/15 text-negative"
                  : "border-border text-foreground-secondary"
              }`}
            >
              {type === "good" ? "Good habit" : "Bad habit"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="habit-xp" className="block text-sm font-medium text-foreground-secondary mb-1.5">
          XP amount
        </label>
        <input
          id="habit-xp"
          type="number"
          min={MIN_HABIT_XP}
          max={MAX_HABIT_XP}
          step={1}
          value={xpAmount}
          onChange={(e) => setXpAmount(e.target.value)}
          required
        />
        <p className="text-xs text-muted mt-1">
          Choose XP based on effort. Most habits should be worth 15–30 XP.
        </p>
        <p className="text-xs text-muted mt-0.5">
          Small: 5–10 · Standard: 15–25 · Challenging: 30–40 · Major: 45–50
          {habitType === "bad" && " · Deducted from spendable XP when logged."}
        </p>
      </div>

      {error && <p className="text-sm text-negative">{error}</p>}

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-border text-foreground-secondary hover:text-foreground transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-primary text-background font-medium hover:bg-primary-hover transition-colors">
          {loading ? "Saving..." : habit ? "Save changes" : "Create habit"}
        </button>
      </div>
    </form>
  );
}
