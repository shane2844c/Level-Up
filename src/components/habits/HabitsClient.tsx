"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Archive, Pencil, Repeat } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { HabitForm } from "@/components/habits/HabitForm";
import { HabitCard } from "@/components/habits/HabitCard";
import { FormModal } from "@/components/ui/FormModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import type { Category, Habit } from "@/lib/types";

interface HabitsClientProps {
  habits: Habit[];
  categories: Category[];
}

export function HabitsClient({ habits, categories }: HabitsClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | undefined>();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "good" | "bad">("all");
  const router = useRouter();
  const { showToast } = useToast();

  const refresh = () => {
    setModalOpen(false);
    setEditing(undefined);
    router.refresh();
  };

  const filteredHabits = useMemo(() => {
    return habits.filter((h) => {
      if (categoryFilter !== "all" && h.category_id !== categoryFilter) return false;
      if (typeFilter !== "all" && h.habit_type !== typeFilter) return false;
      return true;
    });
  }, [habits, categoryFilter, typeFilter]);

  const handleArchive = async (habit: Habit) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("habits")
      .update({ is_active: false })
      .eq("id", habit.id);
    if (error) {
      showToast("Failed to archive habit.", "error");
    } else {
      showToast("Habit archived", "success");
      router.refresh();
    }
  };

  return (
    <>
      <PageHeader
        title="Habits"
        description="Create good and bad habits with custom XP values."
        action={
          <button
            onClick={() => { setEditing(undefined); setModalOpen(true); }}
            disabled={categories.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-background font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            New habit
          </button>
        }
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-auto"
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "all" | "good" | "bad")}
          className="w-auto"
          aria-label="Filter by type"
        >
          <option value="all">All types</option>
          <option value="good">Good habits</option>
          <option value="bad">Bad habits</option>
        </select>
      </div>

      {filteredHabits.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No habits yet"
          description="Add a good habit to start earning XP."
          action={
            categories.length > 0 ? (
              <button
                onClick={() => setModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-primary text-background font-medium hover:bg-primary-hover transition-colors"
              >
                Create habit
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredHabits.map((habit) => (
            <div key={habit.id} className="flex items-center gap-2">
              <div className="flex-1">
                <HabitCard habit={habit} onLogged={refresh} />
              </div>
              <button
                onClick={() => { setEditing(habit); setModalOpen(true); }}
                className="p-2.5 rounded-lg border border-border text-muted hover:text-foreground transition-colors shrink-0"
                aria-label="Edit habit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleArchive(habit)}
                className="p-2.5 rounded-lg border border-border text-muted hover:text-negative transition-colors shrink-0"
                aria-label="Archive habit"
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
        title={editing ? "Edit habit" : "New habit"}
      >
        <HabitForm
          habit={editing}
          categories={categories}
          onSuccess={refresh}
          onCancel={() => { setModalOpen(false); setEditing(undefined); }}
        />
      </FormModal>
    </>
  );
}
