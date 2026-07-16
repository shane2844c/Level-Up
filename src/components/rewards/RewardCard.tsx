"use client";

import { useState } from "react";
import { Gift, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { redeemReward } from "@/lib/data";
import { useToast } from "@/components/ui/Toast";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
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
  const online = useOnlineStatus();
  const affordable = currentBalance >= reward.xp_cost;
  const xpNeeded = reward.xp_cost - currentBalance;
  const remainingBalance = currentBalance - reward.xp_cost;

  const handleRedeem = async () => {
    if (loading) return;
    if (!online) {
      showToast("You're offline. Connect to the internet to redeem rewards.", "error");
      return;
    }
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
      <div
        className={cn(
          "rounded-2xl border bg-card p-5 flex flex-col gap-4",
          affordable ? "border-border" : "border-border/80 opacity-95"
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
              affordable ? "bg-primary/15" : "bg-background-secondary"
            )}
          >
            {affordable ? (
              <Gift className="h-5 w-5 text-primary" />
            ) : (
              <Lock className="h-5 w-5 text-muted" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground">{reward.name}</h3>
            {reward.description && (
              <p className="text-sm text-foreground-secondary mt-1">
                {reward.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-lg font-semibold text-primary">
            {reward.xp_cost.toLocaleString()} XP
          </span>
          <span
            className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-full",
              affordable
                ? "bg-positive/15 text-positive"
                : "bg-background-secondary text-muted"
            )}
          >
            {affordable ? "Affordable" : "Locked"}
          </span>
        </div>

        {!affordable && (
          <p className="text-sm text-foreground-secondary">
            {xpNeeded.toLocaleString()} XP still needed
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => affordable && setConfirmOpen(true)}
            disabled={!affordable}
            className={cn(
              "flex-1 min-h-[48px] rounded-xl text-sm font-medium transition-colors active:opacity-80",
              affordable
                ? "bg-primary text-background hover:bg-primary-hover"
                : "bg-background-secondary text-muted cursor-not-allowed"
            )}
          >
            Redeem
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="min-h-[48px] px-4 rounded-xl text-sm border border-border text-foreground-secondary hover:text-foreground hover:bg-background-secondary transition-colors active:opacity-80"
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
        description={`Confirm redemption of "${reward.name}". This cannot be undone.`}
        confirmLabel="Confirm redemption"
        loading={loading}
        details={[
          { label: "Reward", value: reward.name },
          { label: "XP cost", value: `${reward.xp_cost} XP` },
          { label: "Current balance", value: `${currentBalance} XP` },
          { label: "Remaining balance", value: `${remainingBalance} XP` },
        ]}
      />
    </>
  );
}
