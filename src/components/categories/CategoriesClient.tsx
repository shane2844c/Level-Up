"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Archive, Pencil } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { FormModal } from "@/components/ui/FormModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getLevelProgress } from "@/lib/levels";
import { TierBadge } from "@/components/progress/TierBadge";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import type { Category, CategorySummary, Habit } from "@/lib/types";
import { FolderOpen } from "lucide-react";

interface CategoriesClientProps {
  summaries: CategorySummary[];
  allCategories: Category[];
  habits: Habit[];
}

export function CategoriesClient({
  summaries,
  allCategories,
  habits,
}: CategoriesClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>();
  const router = useRouter();
  const { showToast } = useToast();

  const refresh = () => {
    setModalOpen(false);
    setEditing(undefined);
    router.refresh();
  };

  const handleArchive = async (category: Category) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .update({ is_active: false })
      .eq("id", category.id);
    if (error) {
      showToast("Failed to archive category.", "error");
    } else {
      showToast("Category archived", "success");
      router.refresh();
    }
  };

  const openCreate = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setModalOpen(true);
  };

  const activeSummaries = summaries.filter((s) => s.category.is_active);
  const archivedCategories = allCategories.filter((c) => !c.is_active);

  return (
    <>
      <PageHeader
        title="Categories"
        description="Organise your habits into life areas and track permanent progression."
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-background font-medium hover:bg-primary-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            New category
          </button>
        }
      />

      {activeSummaries.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Create your first category"
          description="Organise your habits into areas such as Health, Work or Mindfulness."
          action={
            <button
              onClick={openCreate}
              className="px-4 py-2 rounded-lg bg-primary text-background font-medium hover:bg-primary-hover transition-colors"
            >
              Create category
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {activeSummaries.map((summary) => {
            const { category, totalCategoryXp, habitCount } = summary;
            const progress = getLevelProgress(totalCategoryXp);
            const accent = category.accent_color ?? "#58C7FF";
            const categoryHabits = habits.filter(
              (h) => h.category_id === category.id && h.is_active
            );

            return (
              <div
                key={category.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <TierBadge
                      tier={progress.tier}
                      iconId={category.icon}
                      accentColor={accent}
                      size="md"
                    />
                    <div>
                      <h3 className="font-semibold text-foreground">{category.name}</h3>
                      <p className="text-sm text-foreground-secondary">
                        Level {progress.level} · {progress.tier}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(category)}
                      className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-background-secondary transition-colors"
                      aria-label="Edit category"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleArchive(category)}
                      className="p-2 rounded-lg text-muted hover:text-negative hover:bg-negative/10 transition-colors"
                      aria-label="Archive category"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {category.description && (
                  <p className="text-sm text-foreground-secondary mb-4">
                    {category.description}
                  </p>
                )}

                <div className="mb-4">
                  {progress.isMaxLevel ? (
                    <>
                      <p className="text-sm text-foreground-secondary mb-2">
                        Level 10 · Master · {totalCategoryXp.toLocaleString()} permanent XP
                      </p>
                      <ProgressBar value={100} color={accent} />
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-foreground-secondary">
                          {progress.xpInLevel} / {progress.xpRequiredInLevel} XP
                        </span>
                        <span className="text-muted text-xs">
                          {progress.xpRemaining} XP to Level {progress.level + 1}
                        </span>
                      </div>
                      <ProgressBar
                        value={progress.xpInLevel}
                        max={progress.xpRequiredInLevel}
                        color={accent}
                      />
                      <p className="text-xs text-muted mt-2">
                        {totalCategoryXp.toLocaleString()} permanent XP
                      </p>
                    </>
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted mb-2">
                    {habitCount} active habit{habitCount !== 1 ? "s" : ""}
                  </p>
                  {categoryHabits.length > 0 && (
                    <ul className="space-y-1">
                      {categoryHabits.map((h) => (
                        <li key={h.id} className="text-sm text-foreground-secondary truncate">
                          {h.name}{" "}
                          <span className={h.habit_type === "good" ? "text-positive" : "text-negative"}>
                            ({h.habit_type === "good" ? "+" : "-"}{h.xp_amount} XP)
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {archivedCategories.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-medium text-muted mb-4">Archived</h2>
          <div className="space-y-2">
            {archivedCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-xl border border-border/50 bg-background-secondary/50 px-4 py-3 opacity-60"
              >
                <span className="text-sm text-foreground-secondary">{cat.name}</span>
                <span className="text-xs text-muted">Archived</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(undefined); }}
        title={editing ? "Edit category" : "New category"}
      >
        <CategoryForm
          category={editing}
          onSuccess={refresh}
          onCancel={() => { setModalOpen(false); setEditing(undefined); }}
        />
      </FormModal>
    </>
  );
}
