"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { JarPreview } from "@/components/habit-jar/JarPreview";
import { ACCENT_COLORS } from "@/lib/constants";
import type { Category, Habit } from "@/lib/types";

const JAR_EMOJIS = ["🫙", "💪", "📚", "🎯", "🏃", "🧘", "💧", "✍️", "🥗", "📞"];

interface CreateJarFormProps {
  habit?: Habit;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateJarForm({ habit, categories, onSuccess, onCancel }: CreateJarFormProps) {
  const [name, setName] = useState(habit?.name ?? "");
  const [identityStatement, setIdentityStatement] = useState(
    habit?.identity_statement ?? habit?.description ?? ""
  );
  const [icon, setIcon] = useState(habit?.icon ?? "🫙");
  const [accentColor, setAccentColor] = useState(
    habit?.accent_color ?? habit?.category?.accent_color ?? ACCENT_COLORS[0]
  );
  const [categoryId, setCategoryId] = useState(
    habit?.category_id ?? categories[0]?.id ?? ""
  );
  const [frequency, setFrequency] = useState(habit?.frequency ?? "daily");
  const [targetCompletions, setTargetCompletions] = useState(
    habit?.target_completions?.toString() ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Jar name is required.");
      return;
    }
    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    const target = targetCompletions.trim()
      ? parseInt(targetCompletions, 10)
      : null;
    if (target !== null && (Number.isNaN(target) || target < 1)) {
      setError("Target must be a positive number.");
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
        description: identityStatement.trim() || null,
        identity_statement: identityStatement.trim() || null,
        category_id: categoryId,
        habit_type: "good" as const,
        xp_amount: habit?.xp_amount ?? 10,
        icon: icon || null,
        accent_color: accentColor,
        frequency,
        target_completions: target,
      };

      if (habit) {
        const { error: updateError } = await supabase
          .from("habits")
          .update(payload)
          .eq("id", habit.id);
        if (updateError) throw updateError;
        showToast("Jar updated", "success");
      } else {
        const { error: insertError } = await supabase
          .from("habits")
          .insert({ ...payload, user_id: user.id });
        if (insertError) throw insertError;
        showToast("Jar created", "success");
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
      <p className="text-sm text-[var(--jar-text-secondary)]">
        Create a category first before creating a jar.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-6 lg:grid-cols-[1fr,min(240px,100%)]">
        <div className="space-y-5 order-2 lg:order-1">
      <div>
        <label htmlFor="jar-name" className="block text-sm font-medium text-[var(--jar-text-secondary)] mb-1.5">
          Jar name
        </label>
        <input
          id="jar-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Go to the gym"
          required
        />
      </div>

      <div>
        <label htmlFor="jar-identity" className="block text-sm font-medium text-[var(--jar-text-secondary)] mb-1.5">
          Identity statement (optional)
        </label>
        <textarea
          id="jar-identity"
          value={identityStatement}
          onChange={(e) => setIdentityStatement(e.target.value)}
          placeholder="I am someone who takes care of my body."
          rows={2}
        />
      </div>

      <div>
        <span className="block text-sm font-medium text-[var(--jar-text-secondary)] mb-2">
          Icon
        </span>
        <div className="flex flex-wrap gap-2">
          {JAR_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setIcon(emoji)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition-colors ${
                icon === emoji
                  ? "border-[#58C7FF] bg-[#58C7FF]/10"
                  : "border-[var(--jar-border)] hover:bg-[var(--jar-surface-muted)]"
              }`}
              aria-label={`Select ${emoji} icon`}
              aria-pressed={icon === emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium text-[var(--jar-text-secondary)] mb-2">
          Accent colour
        </span>
        <div className="flex flex-wrap gap-2">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setAccentColor(color)}
              className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${
                accentColor === color ? "border-[var(--jar-text)] scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select colour ${color}`}
              aria-pressed={accentColor === color}
            />
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="jar-category" className="block text-sm font-medium text-[var(--jar-text-secondary)] mb-1.5">
          Category
        </label>
        <select
          id="jar-category"
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
        <label htmlFor="jar-frequency" className="block text-sm font-medium text-[var(--jar-text-secondary)] mb-1.5">
          Frequency
        </label>
        <select
          id="jar-frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div>
        <label htmlFor="jar-target" className="block text-sm font-medium text-[var(--jar-text-secondary)] mb-1.5">
          Target completions (optional)
        </label>
        <input
          id="jar-target"
          type="number"
          min={1}
          value={targetCompletions}
          onChange={(e) => setTargetCompletions(e.target.value)}
          placeholder="e.g. 30"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-[var(--jar-border)] text-[var(--jar-text-secondary)] hover:text-[var(--jar-text)] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium hover:opacity-90 transition-opacity"
        >
          {loading ? "Saving..." : habit ? "Save jar" : "Create New Jar"}
        </button>
      </div>
        </div>

        <div className="order-1 lg:order-2 lg:sticky lg:top-0">
          <JarPreview name={name} icon={icon} accentColor={accentColor} />
        </div>
      </div>
    </form>
  );
}
