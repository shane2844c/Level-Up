"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_ICONS, ACCENT_COLORS } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

interface CategoryFormProps {
  category?: Category;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "target");
  const [accentColor, setAccentColor] = useState(
    category?.accent_color ?? ACCENT_COLORS[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        icon,
        accent_color: accentColor,
      };

      if (category) {
        const { error: updateError } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", category.id);
        if (updateError) throw updateError;
        showToast("Category updated", "success");
      } else {
        const { error: insertError } = await supabase
          .from("categories")
          .insert({ ...payload, user_id: user.id });
        if (insertError) throw insertError;
        showToast("Category created", "success");
      }
      onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="cat-name" className="block text-sm font-medium text-foreground-secondary mb-1.5">
          Name
        </label>
        <input
          id="cat-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Health"
          required
        />
      </div>

      <div>
        <label htmlFor="cat-desc" className="block text-sm font-medium text-foreground-secondary mb-1.5">
          Description (optional)
        </label>
        <textarea
          id="cat-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="What does this category represent?"
        />
      </div>

      <div>
        <span className="block text-sm font-medium text-foreground-secondary mb-2">
          Icon
        </span>
        <div className="grid grid-cols-5 gap-2">
          {CATEGORY_ICONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setIcon(id)}
              title={label}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
                icon === id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium text-foreground-secondary mb-2">
          Accent colour
        </span>
        <div className="flex gap-2 flex-wrap">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setAccentColor(color)}
              className={cn(
                "h-8 w-8 rounded-full border-2 transition-transform",
                accentColor === color
                  ? "border-foreground scale-110"
                  : "border-transparent"
              )}
              style={{ backgroundColor: color }}
              aria-label={`Colour ${color}`}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-negative">{error}</p>}

      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-border text-foreground-secondary hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-primary text-background font-medium hover:bg-primary-hover transition-colors"
        >
          {loading ? "Saving..." : category ? "Save changes" : "Create category"}
        </button>
      </div>
    </form>
  );
}
