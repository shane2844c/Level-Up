"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Archive, Gift } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RewardForm } from "@/components/rewards/RewardForm";
import { RewardCard } from "@/components/rewards/RewardCard";
import { FormModal } from "@/components/ui/FormModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import type { Reward } from "@/lib/types";

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

  const activeRewards = rewards.filter((r) => r.is_active);

  return (
    <>
      <PageHeader
        title="Rewards"
        description="Create rewards worth working toward and redeem them with spendable XP."
        action={
          <button
            onClick={() => { setEditing(undefined); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-background font-medium hover:bg-primary-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            New reward
          </button>
        }
      />

      <p className="text-sm text-foreground-secondary mb-6">
        Available balance:{" "}
        <span className="text-primary font-semibold">{currentBalance} XP</span>
      </p>

      {activeRewards.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="Create something worth working toward"
          description="Add a reward and choose how much XP it costs."
          action={
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-primary text-background font-medium hover:bg-primary-hover transition-colors"
            >
              Create reward
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeRewards.map((reward) => (
            <div key={reward.id} className="relative">
              <RewardCard
                reward={reward}
                currentBalance={currentBalance}
                onRedeemed={refresh}
                onEdit={() => { setEditing(reward); setModalOpen(true); }}
              />
              <button
                onClick={() => handleArchive(reward)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-muted hover:text-negative hover:bg-negative/10 transition-colors"
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
        onClose={() => { setModalOpen(false); setEditing(undefined); }}
        title={editing ? "Edit reward" : "New reward"}
      >
        <RewardForm
          reward={editing}
          onSuccess={refresh}
          onCancel={() => { setModalOpen(false); setEditing(undefined); }}
        />
      </FormModal>
    </>
  );
}
