"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  History,
  Pencil,
  Undo2,
  Trash2,
} from "lucide-react";
import { ImmersiveJarHeader } from "@/components/habit-jar/ImmersiveJarHeader";
import { HabitJarCarousel } from "@/components/habit-jar/HabitJarCarousel";
import { EmptyJarState } from "@/components/habit-jar/EmptyJarState";
import { CreateJarModal } from "@/components/habit-jar/CreateJarModal";
import { JarDetails } from "@/components/habit-jar/JarDetails";
import { useJarPhysicsRegistry } from "@/components/habit-jar/glass-jar/useJarPhysicsRegistry";
import { MobileBottomSheet } from "@/components/mobile/MobileBottomSheet";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { createClient } from "@/lib/supabase/client";
import { reverseHabitTransaction } from "@/lib/data";
import { useToast } from "@/components/ui/Toast";
import { useAddCoin, useJarRefs } from "@/hooks/useAddCoin";
import { mapCompletionTransactions } from "@/lib/jar-stats";
import type { Category, Habit, XpTransaction } from "@/lib/types";

interface MyJarsClientProps {
  habits: Habit[];
  categories: Category[];
  completions: Pick<XpTransaction, "id" | "habit_id" | "created_at">[];
  greeting: string;
}

export function MyJarsClient({ habits, categories, completions, greeting }: MyJarsClientProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();
  const [menuHabit, setMenuHabit] = useState<Habit | null>(null);
  const [detailsHabit, setDetailsHabit] = useState<Habit | null>(null);
  const [deleteHabit, setDeleteHabit] = useState<Habit | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const { setButtonRef } = useJarRefs();
  const { registerPhysics, dropCoin, removeLastCoin } = useJarPhysicsRegistry();

  const completionRows = useMemo(
    () => mapCompletionTransactions(completions),
    [completions]
  );

  const {
    addCoin,
    processingId,
    glowingId,
    getStats,
    syncCompletions,
    setCoinHandlers,
  } = useAddCoin(completionRows);

  useEffect(() => {
    syncCompletions(completionRows);
  }, [completionRows, syncCompletions]);

  useEffect(() => {
    setCoinHandlers({
      onDrop: dropCoin,
      onRollback: removeLastCoin,
    });
  }, [dropCoin, removeLastCoin, setCoinHandlers]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (activeIndex >= habits.length) {
      setActiveIndex(Math.max(0, habits.length - 1));
    }
  }, [activeIndex, habits.length]);

  const refresh = () => {
    setCreateOpen(false);
    setEditingHabit(undefined);
    router.refresh();
  };

  const handleAddCoin = async (habit: Habit) => {
    await addCoin(habit);
  };

  const handleArchive = async (habit: Habit) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("habits")
      .update({ is_active: false })
      .eq("id", habit.id);
    if (error) {
      showToast("Failed to archive jar.", "error");
    } else {
      showToast("Jar archived", "success");
      setMenuHabit(null);
      setDeleteHabit(null);
      setDetailsHabit(null);
      router.refresh();
    }
  };

  const handleRemoveLatest = async (habit: Habit) => {
    const stats = getStats(habit.id);
    if (!stats.latestTransactionId || removing) return;
    setRemoving(true);
    try {
      const supabase = createClient();
      await reverseHabitTransaction(supabase, stats.latestTransactionId);
      removeLastCoin(habit.id);
      showToast("Last coin removed.", "success");
      setMenuHabit(null);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not remove coin.", "error");
    } finally {
      setRemoving(false);
    }
  };

  const detailsStats = detailsHabit ? getStats(detailsHabit.id) : null;

  return (
    <div className="habit-jar-page -mx-1 px-1 md:mx-0 md:px-0">
      <ImmersiveJarHeader
        greeting={greeting}
        onCreateJar={() => {
          setEditingHabit(undefined);
          setCreateOpen(true);
        }}
        canCreate={categories.length > 0}
      />

      {habits.length === 0 ? (
        <EmptyJarState
          onCreateJar={() => setCreateOpen(true)}
          canCreate={categories.length > 0}
        />
      ) : (
        <HabitJarCarousel
          habits={habits}
          getStats={getStats}
          activeIndex={activeIndex}
          onIndexChange={setActiveIndex}
          processingId={processingId}
          glowingId={glowingId}
          reducedMotion={reducedMotion}
          onAddCoin={handleAddCoin}
          onOpenMenu={setMenuHabit}
          onRegisterPhysics={registerPhysics}
          setButtonRef={setButtonRef}
        />
      )}

      <CreateJarModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setEditingHabit(undefined);
        }}
        onSuccess={refresh}
        categories={categories}
        habit={editingHabit}
      />

      <JarDetails
        open={Boolean(detailsHabit)}
        onClose={() => setDetailsHabit(null)}
        habit={detailsHabit}
        stats={detailsStats}
        onAddCoin={() => detailsHabit && handleAddCoin(detailsHabit)}
        onEdit={() => {
          if (!detailsHabit) return;
          setEditingHabit(detailsHabit);
          setCreateOpen(true);
          setDetailsHabit(null);
        }}
        adding={detailsHabit ? processingId === detailsHabit.id : false}
        onRemovedCoin={() => {
          if (detailsHabit) removeLastCoin(detailsHabit.id);
          router.refresh();
        }}
      />

      <MobileBottomSheet
        open={Boolean(menuHabit)}
        onClose={() => setMenuHabit(null)}
        title={menuHabit?.name ?? "Jar options"}
      >
        <div className="px-2 pb-4 space-y-1">
          <MenuButton icon={History} label="View details" onClick={() => { if (menuHabit) { setDetailsHabit(menuHabit); setMenuHabit(null); } }} />
          <MenuButton icon={Pencil} label="Edit jar" onClick={() => { if (menuHabit) { setEditingHabit(menuHabit); setCreateOpen(true); setMenuHabit(null); } }} />
          <MenuButton icon={History} label="View history" onClick={() => { if (menuHabit) { setDetailsHabit(menuHabit); setMenuHabit(null); } }} />
          <MenuButton icon={Undo2} label="Remove latest coin" onClick={() => menuHabit && handleRemoveLatest(menuHabit)} disabled={!menuHabit || !getStats(menuHabit.id).latestTransactionId || removing} />
          <MenuButton icon={Archive} label="Archive jar" onClick={() => menuHabit && handleArchive(menuHabit)} />
          <MenuButton icon={Trash2} label="Delete jar" destructive onClick={() => { if (menuHabit) { setDeleteHabit(menuHabit); setMenuHabit(null); } }} />
        </div>
      </MobileBottomSheet>

      <ConfirmDialog
        open={Boolean(deleteHabit)}
        onClose={() => setDeleteHabit(null)}
        onConfirm={async () => {
          if (!deleteHabit) return;
          setDeleting(true);
          await handleArchive(deleteHabit);
          setDeleting(false);
        }}
        title={`Delete "${deleteHabit?.name}"?`}
        description="This will archive the jar and hide it from your collection. Your coin history is preserved."
        confirmLabel="Delete jar"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  destructive,
  disabled,
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors active:opacity-80 disabled:opacity-40 ${
        destructive
          ? "text-red-500 hover:bg-red-50"
          : "text-[var(--jar-text)] hover:bg-[var(--jar-surface-muted)]"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
