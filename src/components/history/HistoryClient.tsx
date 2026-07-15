"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TransactionList } from "@/components/history/TransactionList";
import { EmptyState } from "@/components/ui/EmptyState";
import { History } from "lucide-react";
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

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== "all" && tx.transaction_type !== typeFilter) return false;
      if (categoryFilter !== "all" && tx.category_id !== categoryFilter) return false;
      if (startDate && new Date(tx.created_at) < new Date(startDate)) return false;
      if (endDate && new Date(tx.created_at) > new Date(`${endDate}T23:59:59`)) return false;
      return true;
    });
  }, [transactions, typeFilter, categoryFilter, startDate, endDate]);

  return (
    <>
      <PageHeader
        title="History"
        description="A complete record of every XP transaction."
      />

      <div className="flex flex-wrap gap-3 mb-6">
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
            <option key={cat.id} value={cat.id}>{cat.name}</option>
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
        <div className="rounded-2xl border border-border bg-card p-5">
          <TransactionList transactions={filtered} />
        </div>
      )}
    </>
  );
}
