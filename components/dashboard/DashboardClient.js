"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { useMonthParam } from "@/lib/useMonthParam";
import { fetchStats, fetchUsers, fetchCategories } from "@/lib/api-client";
import MonthNav from "@/components/dashboard/MonthNav";
import SummaryCards from "@/components/dashboard/SummaryCards";
import BalanceCard from "@/components/dashboard/BalanceCard";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import CategoryComparisonTable from "@/components/dashboard/CategoryComparisonTable";
import ExpenseFormModal from "@/components/expenses/ExpenseFormModal";
import Button from "@/components/ui/Button";
import { SkeletonBlock } from "@/components/ui/Spinner";
import { EmptyState, ErrorBanner } from "@/components/ui/States";
import { formatMonthLabel } from "@/lib/dates";

export default function DashboardClient() {
  const { month, goToPreviousMonth, goToNextMonth } = useMonthParam();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const loadStats = useCallback(async () => {
    setError("");
    try {
      const data = await fetchStats(month);
      setStats(data);
    } catch (err) {
      setError(err.message || "Impossible de charger le tableau de bord.");
    }
  }, [month]);

  useEffect(() => {
    let cancelled = false;
    async function loadReferenceData() {
      try {
        const [u, c] = await Promise.all([fetchUsers(), fetchCategories()]);
        if (!cancelled) {
          setUsers(u);
          setCategories(c);
        }
      } catch {
        // géré silencieusement — le formulaire signalera l'absence de données
      }
    }
    loadReferenceData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial au montage / changement de mois
    setLoading(true);
    loadStats().finally(() => setLoading(false));
  }, [loadStats]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dépenses</h1>
          <p className="text-sm text-neutral-500 capitalize">{formatMonthLabel(month)}</p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <MonthNav month={month} onPrevious={goToPreviousMonth} onNext={goToNextMonth} />
          <Button onClick={() => setFormOpen(true)} className="hidden sm:inline-flex">
            <Plus size={16} />
            Ajouter une dépense
          </Button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={loadStats} />}

      {loading && !stats ? (
        <div className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
          </div>
          <SkeletonBlock className="h-40" />
          <SkeletonBlock className="h-64" />
        </div>
      ) : stats && stats.entryCount === 0 ? (
        <EmptyState
          title={`Aucune dépense en ${formatMonthLabel(month)}.`}
          description="Commencez à enregistrer vos dépenses pour suivre votre budget."
          action={
            <Button onClick={() => setFormOpen(true)} className="mt-1">
              <Plus size={16} />
              Ajouter une dépense
            </Button>
          }
        />
      ) : stats ? (
        <>
          <SummaryCards total={stats.total} byUser={stats.byUser} />
          <BalanceCard balance={stats.balance} byUser={stats.byUser} reimbursements={stats.reimbursements} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CategoryBreakdown categories={stats.categories} total={stats.total} />
            <CategoryComparisonTable categories={stats.categories} byUser={stats.byUser} />
          </div>
        </>
      ) : null}

      {/* Bouton flottant mobile */}
      <button
        onClick={() => setFormOpen(true)}
        aria-label="Ajouter une dépense"
        className="sm:hidden fixed bottom-20 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      <ExpenseFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={loadStats}
        users={users}
        categories={categories}
      />
    </div>
  );
}
