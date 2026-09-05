"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useMonthParam } from "@/lib/useMonthParam";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  fetchExpenses,
  fetchUsers,
  fetchCategories,
  deleteExpense,
} from "@/lib/api-client";
import MonthNav from "@/components/dashboard/MonthNav";
import ExpenseFilters from "@/components/expenses/ExpenseFilters";
import ExpenseList from "@/components/expenses/ExpenseList";
import ExpenseFormModal from "@/components/expenses/ExpenseFormModal";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { SkeletonBlock } from "@/components/ui/Spinner";
import { EmptyState, ErrorBanner } from "@/components/ui/States";
import { formatCurrency } from "@/lib/money";
import { formatMonthLabel } from "@/lib/dates";

export default function ExpensesClient() {
  const { month, goToPreviousMonth, goToNextMonth } = useMonthParam();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const userId = searchParams.get("userId") || "";
  const categoryId = searchParams.get("categoryId") || "";

  const [expenses, setExpenses] = useState([]);
  const [meta, setMeta] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function updateFilters(patch) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const load = useCallback(async () => {
    setError("");
    try {
      const [expensesRes, u, c] = await Promise.all([
        fetchExpenses({ month, userId, categoryId }),
        users.length ? Promise.resolve(users) : fetchUsers(),
        categories.length ? Promise.resolve(categories) : fetchCategories(),
      ]);
      setExpenses(expensesRes.data);
      setMeta(expensesRes.meta);
      setUsers(u);
      setCategories(c);
    } catch (err) {
      setError(err.message || "Impossible de charger les dépenses.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, userId, categoryId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial au montage / changement de filtres
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  async function handleDelete() {
    if (!deletingExpense) return;
    setDeleting(true);
    try {
      await deleteExpense(deletingExpense.id);
      setDeletingExpense(null);
      await load();
    } catch (err) {
      setError(err.message || "Impossible de supprimer la dépense.");
      setDeletingExpense(null);
    } finally {
      setDeleting(false);
    }
  }

  const hasFilters = Boolean(userId || categoryId);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dépenses</h1>
          <p className="text-sm text-neutral-500 capitalize">{formatMonthLabel(month)}</p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <MonthNav month={month} onPrevious={goToPreviousMonth} onNext={goToNextMonth} />
          <Button
            onClick={() => {
              setEditingExpense(null);
              setFormOpen(true);
            }}
            className="hidden sm:inline-flex"
          >
            <Plus size={16} />
            Ajouter
          </Button>
        </div>
      </div>

      <ExpenseFilters
        users={users}
        categories={categories}
        userId={userId}
        categoryId={categoryId}
        onChange={updateFilters}
      />

      {meta && (
        <p className="text-sm text-neutral-500">
          {meta.count} dépense{meta.count > 1 ? "s" : ""}
          {hasFilters ? " (filtrées)" : ""} — total{" "}
          <span className="font-semibold text-neutral-800">
            {formatCurrency(meta.filteredTotal)}
          </span>
        </p>
      )}

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <div className="flex flex-col gap-3">
          <SkeletonBlock className="h-16" />
          <SkeletonBlock className="h-16" />
          <SkeletonBlock className="h-16" />
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState
          title={hasFilters ? "Aucune dépense pour ce filtre." : `Aucune dépense en ${formatMonthLabel(month)}.`}
          description="Commencez à enregistrer vos dépenses pour suivre votre budget."
          action={
            <Button
              onClick={() => {
                setEditingExpense(null);
                setFormOpen(true);
              }}
              className="mt-1"
            >
              <Plus size={16} />
              Ajouter une dépense
            </Button>
          }
        />
      ) : (
        <ExpenseList
          expenses={expenses}
          users={users}
          onEdit={(expense) => {
            setEditingExpense(expense);
            setFormOpen(true);
          }}
          onDelete={setDeletingExpense}
        />
      )}

      {/* Bouton flottant mobile */}
      <button
        onClick={() => {
          setEditingExpense(null);
          setFormOpen(true);
        }}
        aria-label="Ajouter une dépense"
        className="sm:hidden fixed bottom-20 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      <ExpenseFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={load}
        users={users}
        categories={categories}
        expense={editingExpense}
      />

      <ConfirmDialog
        open={Boolean(deletingExpense)}
        title="Supprimer cette dépense ?"
        message="Cette action est irréversible."
        confirmLabel="Supprimer"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingExpense(null)}
      />
    </div>
  );
}
