"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Archive, Gift } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RewardForm } from "@/components/rewards/RewardForm";
import { RewardCard } from "@/components/rewards/RewardCard";
import { FormModal } from "@/components/ui/FormModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { MobileXpBalanceCard } from "@/components/mobile/MobileXpBalanceCard";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { getNegativeBalanceMessage } from "@/lib/remove-activity";
import type { Reward, XpSummary } from "@/lib/types";

interface RewardsClientProps {
  rewards: Reward[];
  currentBalance: number;
}

export function RewardsClient({ rewards, currentBalance }: RewardsClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Reward | undefined>();
  const router = useRouter();
  const { showToast } = useToast();

  const refresh = () => {
    setModalOpen(false);
    setEditing(undefined);
    router.refresh();
  };

  const handleArchive = async (reward: Reward) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("rewards")
      .update({ is_active: false })
      .eq("id", reward.id);
    if (error) {
      showToast("Failed to archive reward.", "error");
    } else {
      showToast("Reward archived", "success");
      router.refresh();
    }
  };

  const activeRewards = useMemo(
    () =>
      rewards
        .filter((r) => r.is_active)
        .sort((a, b) => {
          const aAffordable = currentBalance >= a.xp_cost;
          const bAffordable = currentBalance >= b.xp_cost;
          if (aAffordable !== bAffordable) return aAffordable ? -1 : 1;
          return a.xp_cost - b.xp_cost;
        }),
    [rewards, currentBalance]
  );

  const xpSummary: XpSummary = {
    currentBalance,
    totalEarned: 0,
    totalLost: 0,
    totalSpent: 0,
  };
  const negativeMessage = getNegativeBalanceMessage(currentBalance);

  const addButton = (
    <button
      type="button"
      onClick={() => {
        setEditing(undefined);
        setModalOpen(true);
      }}
      className="flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-primary text-background text-sm font-medium hover:bg-primary-hover transition-colors active:opacity-80 w-full sm:w-auto"
    >
      <Plus className="h-4 w-4" />
      Add reward
    </button>
  );

  return (
    <>
      <PageHeader
        title="Rewards"
        description="Create rewards worth working toward and redeem them with spendable XP."
        action={addButton}
      />

      <div className="md:hidden mb-6">
        <MobileXpBalanceCard summary={xpSummary} />
      </div>
      <div className="hidden md:block mb-6">
        <p className="text-sm text-foreground-secondary">
          Available balance:{" "}
          <span className="text-primary font-semibold">{currentBalance} XP</span>
        </p>
        {negativeMessage && (
          <p className="text-sm text-negative mt-2 leading-relaxed">{negativeMessage}</p>
        )}
      </div>

      {activeRewards.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="No rewards yet"
          description="Create something worth working toward."
          action={
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-primary text-background font-medium hover:bg-primary-hover transition-colors"
            >
              Create reward
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {activeRewards.map((reward) => (
            <div key={reward.id} className="relative">
              <RewardCard
                reward={reward}
                currentBalance={currentBalance}
                onRedeemed={refresh}
                onEdit={() => {
                  setEditing(reward);
                  setModalOpen(true);
                }}
              />
              <button
                type="button"
                onClick={() => handleArchive(reward)}
                className="absolute top-3 right-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-muted hover:text-negative hover:bg-negative/10 transition-colors active:opacity-80"
                aria-label="Archive reward"
              >
                <Archive className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <FormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(undefined);
        }}
        title={editing ? "Edit reward" : "New reward"}
      >
        <RewardForm
          reward={editing}
          onSuccess={refresh}
          onCancel={() => {
            setModalOpen(false);
            setEditing(undefined);
          }}
        />
      </FormModal>
    </>
  );
}
