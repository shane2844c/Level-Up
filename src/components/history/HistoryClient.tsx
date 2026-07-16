"use client";

import { useState, useMemo } from "react";
import { Filter, History } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TransactionList } from "@/components/history/TransactionList";
import { MobileTransactionFeed } from "@/components/mobile/MobileTransactionFeed";
import { MobileFilterSheet } from "@/components/mobile/MobileFilterSheet";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Category, XpTransaction } from "@/lib/types";

interface HistoryClientProps {
  transactions: XpTransaction[];
  categories: Category[];
}

export function HistoryClient({ transactions, categories }: HistoryClientProps) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== "all" && tx.transaction_type !== typeFilter) return false;
      if (categoryFilter !== "all" && tx.category_id !== categoryFilter) return false;
      if (startDate && new Date(tx.created_at) < new Date(startDate)) return false;
      if (endDate && new Date(tx.created_at) > new Date(`${endDate}T23:59:59`)) return false;
      return true;
    });
  }, [transactions, typeFilter, categoryFilter, startDate, endDate]);

  const activeFilterCount = [
    typeFilter !== "all",
    categoryFilter !== "all",
    startDate,
    endDate,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setTypeFilter("all");
    setCategoryFilter("all");
    setStartDate("");
    setEndDate("");
  };

  return (
    <>
      <PageHeader
        title="History"
        description="A complete record of every XP transaction."
        action={
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="md:hidden inline-flex min-h-[44px] items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors active:opacity-80"
          >
            <Filter className="h-4 w-4" />
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
        }
      />

      <div className="hidden md:flex flex-wrap gap-3 mb-6">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-auto"
          aria-label="Filter by type"
        >
          <option value="all">All transactions</option>
          <option value="good_habit">Good habits</option>
          <option value="bad_habit">Bad habits</option>
          <option value="reward_redemption">Rewards</option>
        </select>

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

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-auto"
          aria-label="Start date"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-auto"
          aria-label="End date"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="No transactions found"
          description="Your XP history will appear here after you log your first habit."
        />
      ) : (
        <>
          <div className="md:hidden">
            <MobileTransactionFeed transactions={filtered} />
          </div>
          <div className="hidden md:block rounded-2xl border border-border bg-card p-5">
            <TransactionList transactions={filtered} />
          </div>
        </>
      )}

      <MobileFilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onClear={clearFilters}
      >
        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-2">
            Transaction type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full"
          >
            <option value="all">All transactions</option>
            <option value="good_habit">Good habits</option>
            <option value="bad_habit">Bad habits</option>
            <option value="reward_redemption">Rewards</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-2">
            Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full"
          >
            <option value="all">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-2">
              From
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-2">
              To
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </MobileFilterSheet>
    </>
  );
}
