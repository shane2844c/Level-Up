"use client";

import { useState } from "react";
import { Gift, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { redeemReward } from "@/lib/data";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Reward } from "@/lib/types";

interface RewardCardProps {
  reward: Reward;
  currentBalance: number;
  onRedeemed?: () => void;
  onEdit?: () => void;
}

export function RewardCard({
  reward,
  currentBalance,
  onRedeemed,
  onEdit,
}: RewardCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const affordable = currentBalance >= reward.xp_cost;
  const xpNeeded = reward.xp_cost - currentBalance;

  const handleRedeem = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const supabase = createClient();
      await redeemReward(supabase, reward.id);
      showToast(`Redeemed: ${reward.name}`, "success");
      setConfirmOpen(false);
      onRedeemed?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("Insufficient XP")) {
        showToast(`You need ${xpNeeded} more XP to unlock this reward.`, "error");
      } else if (message.includes("inactive") || message.includes("not found")) {
        showToast("This reward is no longer available.", "error");
      } else {
        showToast("Something went wrong. Please try again.", "error");
      }
      setConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 shrink-0">
            <Gift className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">{reward.name}</h3>
            {reward.description && (
              <p className="text-sm text-foreground-secondary mt-1">
                {reward.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-primary">
            {reward.xp_cost} XP
          </span>
          {!affordable && (
            <span className="text-xs text-muted flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Need {xpNeeded} more
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={!affordable}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors",
              affordable
                ? "bg-primary text-background hover:bg-primary-hover"
                : "bg-background-secondary text-muted cursor-not-allowed"
            )}
          >
            Redeem
          </button>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2.5 rounded-lg text-sm border border-border text-foreground-secondary hover:text-foreground hover:bg-background-secondary transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleRedeem}
        title="Redeem reward"
        description={`Spend ${reward.xp_cost} XP to redeem "${reward.name}"? This cannot be undone.`}
        confirmLabel={`Redeem for ${reward.xp_cost} XP`}
        loading={loading}
      />
    </>
  );
}
