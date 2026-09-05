"use client";

import { CategoryIcon } from "@/lib/icons";
import { formatCurrency } from "@/lib/money";
import { formatDayMonth } from "@/lib/dates";
import { Pencil, Trash2 } from "lucide-react";

/** Regroupe une liste de dépenses (déjà triée par date desc) par jour. */
function groupByDay(expenses) {
  const groups = [];
  let currentKey = null;
  let currentGroup = null;

  for (const expense of expenses) {
    const key = expense.date.slice(0, 10); // "2026-09-04"
    if (key !== currentKey) {
      currentKey = key;
      currentGroup = { key, date: expense.date, items: [] };
      groups.push(currentGroup);
    }
    currentGroup.items.push(expense);
  }

  return groups;
}

export default function ExpenseList({ expenses, users, onEdit, onDelete }) {
  const groups = groupByDay(expenses);

  function otherUserName(expense) {
    const other = users?.find((u) => u.id !== expense.userId);
    return other?.name || "l'autre";
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.key}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            {formatDayMonth(group.date)}
          </p>
          <div className="flex flex-col divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white overflow-hidden">
            {group.items.map((expense) => {
              const isReimbursement = expense.type === "REIMBURSEMENT";
              return (
                <div key={expense.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      isReimbursement ? "bg-blue-50 text-blue-600" : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    <CategoryIcon name={isReimbursement ? "HandCoins" : expense.category?.icon} size={16} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      {isReimbursement
                        ? expense.description || "Remboursement"
                        : expense.description || expense.category?.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {isReimbursement
                        ? `Remboursement · ${expense.user?.name} → ${otherUserName(expense)}`
                        : `${expense.category?.name} · ${expense.user?.name}`}
                    </p>
                  </div>

                  <p
                    className={`shrink-0 font-semibold ${
                      isReimbursement ? "text-blue-700" : "text-neutral-900"
                    }`}
                  >
                    {formatCurrency(expense.amount)}
                  </p>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      onClick={() => onEdit(expense)}
                      aria-label="Modifier"
                      className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(expense)}
                      aria-label="Supprimer"
                      className="rounded-full p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
