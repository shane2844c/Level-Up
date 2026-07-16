"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { reverseHabitTransaction } from "@/lib/data";
import { useToast } from "@/components/ui/Toast";
import { isAlreadyRemovedError } from "@/lib/remove-activity";
import type { XpTransaction } from "@/lib/types";

export function useRemoveActivity() {
  const router = useRouter();
  const { showToast } = useToast();
  const [removing, setRemoving] = useState(false);
  const [pendingTx, setPendingTx] = useState<XpTransaction | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const openConfirm = useCallback((tx: XpTransaction) => {
    setPendingTx(tx);
    setConfirmOpen(true);
  }, []);

  const closeConfirm = useCallback(() => {
    if (removing) return;
    setConfirmOpen(false);
    setPendingTx(null);
  }, [removing]);

  const removeTransaction = useCallback(
    async (tx: XpTransaction) => {
      if (removing) return;
      setRemoving(true);
      try {
        const supabase = createClient();
        await reverseHabitTransaction(supabase, tx.id);
        showToast("Activity removed and XP corrected.", "success");
        setConfirmOpen(false);
        setPendingTx(null);
        router.refresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to remove activity.";
        if (isAlreadyRemovedError(message)) {
          showToast("This activity has already been removed.", "error");
        } else {
          showToast(message, "error");
        }
      } finally {
        setRemoving(false);
      }
    },
    [removing, router, showToast]
  );

  const confirmRemove = useCallback(async () => {
    if (!pendingTx) return;
    await removeTransaction(pendingTx);
  }, [pendingTx, removeTransaction]);

  return {
    removing,
    pendingTx,
    confirmOpen,
    openConfirm,
    closeConfirm,
    confirmRemove,
    removeTransaction,
  };
}
