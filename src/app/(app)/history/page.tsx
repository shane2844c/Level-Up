import { createClient } from "@/lib/supabase/server";
import { getTransactions, getCategories } from "@/lib/data";
import { HistoryClient } from "@/components/history/HistoryClient";

export default async function HistoryPage() {
  const supabase = await createClient();

  const [transactions, categories] = await Promise.all([
    getTransactions(supabase),
    getCategories(supabase, true),
  ]);

  return (
    <HistoryClient transactions={transactions} categories={categories} />
  );
}
