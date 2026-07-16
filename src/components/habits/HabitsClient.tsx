"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Archive, Pencil, Repeat, MoreHorizontal, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { HabitForm } from "@/components/habits/HabitForm";
import { HabitCard } from "@/components/habits/HabitCard";
import { FormModal } from "@/components/ui/FormModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { MobileBottomSheet } from "@/components/mobile/MobileBottomSheet";
import { MobileFilterChips } from "@/components/mobile/MobileFilterChips";
import { MobileSegmentedControl } from "@/components/mobile/MobileSegmentedControl";
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
  const [search, setSearch] = useState("");
  const [actionHabit, setActionHabit] = useState<Habit | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  const refresh = () => {
    setModalOpen(false);
    setEditing(undefined);
    router.refresh();
  };

  const categoryChips = useMemo(
    () => [
      { value: "all", label: "All categories" },
      ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
    ],
    [categories]
  );

  const filteredHabits = useMemo(() => {
    return habits.filter((h) => {
      if (categoryFilter !== "all" && h.category_id !== categoryFilter) return false;
      if (typeFilter !== "all" && h.habit_type !== typeFilter) return false;
      if (search.trim() && !h.name.toLowerCase().includes(search.trim().toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [habits, categoryFilter, typeFilter, search]);

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
      setActionHabit(null);
      router.refresh();
    }
  };

  const addButton = (
    <button
      type="button"
      onClick={() => {
        setEditing(undefined);
        setModalOpen(true);
      }}
      disabled={categories.length === 0}
      className="flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-primary text-background text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 active:opacity-80 w-full sm:w-auto"
    >
      <Plus className="h-4 w-4" />
      Add habit
    </button>
  );

  return (
    <>
      <PageHeader
        title="Habits"
        description="Create, edit and log habits with custom XP values."
        action={addButton}
      />

      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search habits"
            aria-label="Search habits"
            className="w-full pl-10"
          />
        </div>

        <MobileSegmentedControl
          options={[
            { value: "all", label: "All" },
            { value: "good", label: "Good" },
            { value: "bad", label: "Bad" },
          ]}
          value={typeFilter}
          onChange={setTypeFilter}
        />

        {categories.length > 0 && (
          <MobileFilterChips
            options={categoryChips}
            value={categoryFilter}
            onChange={setCategoryFilter}
            ariaLabel="Filter by category"
          />
        )}

        <div className="hidden md:flex flex-wrap gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-auto"
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
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
      </div>

      {filteredHabits.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No habits yet"
          description="Add your first habit to start earning XP."
          action={
            categories.length > 0 ? (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-primary text-background font-medium hover:bg-primary-hover transition-colors"
              >
                Create habit
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredHabits.map((habit) => (
            <div key={habit.id}>
              <div className="md:hidden relative">
                <HabitCard habit={habit} onLogged={refresh} mobile />
                <button
                  type="button"
                  onClick={() => setActionHabit(habit)}
                  className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-xl text-muted hover:text-foreground hover:bg-background-secondary transition-colors active:opacity-70"
                  aria-label={`Actions for ${habit.name}`}
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <div className="flex-1">
                  <HabitCard habit={habit} onLogged={refresh} />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(habit);
                    setModalOpen(true);
                  }}
                  className="min-h-[44px] min-w-[44px] p-2.5 rounded-lg border border-border text-muted hover:text-foreground transition-colors shrink-0"
                  aria-label="Edit habit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleArchive(habit)}
                  className="min-h-[44px] min-w-[44px] p-2.5 rounded-lg border border-border text-muted hover:text-negative transition-colors shrink-0"
                  aria-label="Archive habit"
                >
                  <Archive className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MobileBottomSheet
        open={Boolean(actionHabit)}
        onClose={() => setActionHabit(null)}
        title={actionHabit?.name ?? "Habit actions"}
      >
        <div className="px-2 pb-4 space-y-1">
          <button
            type="button"
            onClick={() => {
              if (!actionHabit) return;
              setEditing(actionHabit);
              setModalOpen(true);
              setActionHabit(null);
            }}
            className="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-card active:opacity-80"
          >
            <Pencil className="h-4 w-4" />
            Edit habit
          </button>
          <button
            type="button"
            onClick={() => actionHabit && handleArchive(actionHabit)}
            className="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-negative hover:bg-negative/10 active:opacity-80"
          >
            <Archive className="h-4 w-4" />
            Archive habit
          </button>
        </div>
      </MobileBottomSheet>

      <FormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(undefined);
        }}
        title={editing ? "Edit habit" : "New habit"}
      >
        <HabitForm
          habit={editing}
          categories={categories}
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
