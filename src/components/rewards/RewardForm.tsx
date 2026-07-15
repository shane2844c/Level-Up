"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import type { Reward } from "@/lib/types";

interface RewardFormProps {
  reward?: Reward;
  onSuccess: () => void;
  onCancel: () => void;
}

export function RewardForm({ reward, onSuccess, onCancel }: RewardFormProps) {
  const [name, setName] = useState(reward?.name ?? "");
  const [description, setDescription] = useState(reward?.description ?? "");
  const [xpCost, setXpCost] = useState(reward?.xp_cost?.toString() ?? "50");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Reward name is required.");
      return;
    }
    const cost = parseInt(xpCost, 10);
    if (isNaN(cost) || cost <= 0 || !Number.isInteger(cost)) {
      setError("XP cost must be a whole number greater than zero.");
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
        xp_cost: cost,
      };

      if (reward) {
        const { error: updateError } = await supabase
          .from("rewards")
          .update(payload)
          .eq("id", reward.id);
        if (updateError) throw updateError;
        showToast("Reward updated", "success");
      } else {
        const { error: insertError } = await supabase
          .from("rewards")
          .insert({ ...payload, user_id: user.id });
        if (insertError) throw insertError;
        showToast("Reward created", "success");
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
        <label htmlFor="reward-name" className="block text-sm font-medium text-foreground-secondary mb-1.5">
          Name
        </label>
        <input
          id="reward-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Watch one anime episode"
          required
        />
      </div>

      <div>
        <label htmlFor="reward-desc" className="block text-sm font-medium text-foreground-secondary mb-1.5">
          Description (optional)
        </label>
        <textarea
          id="reward-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <label htmlFor="reward-cost" className="block text-sm font-medium text-foreground-secondary mb-1.5">
          XP cost
        </label>
        <input
          id="reward-cost"
          type="number"
          min={1}
          step={1}
          value={xpCost}
          onChange={(e) => setXpCost(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-sm text-negative">{error}</p>}

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-border text-foreground-secondary hover:text-foreground transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-primary text-background font-medium hover:bg-primary-hover transition-colors">
          {loading ? "Saving..." : reward ? "Save changes" : "Create reward"}
        </button>
      </div>
    </form>
  );
}
