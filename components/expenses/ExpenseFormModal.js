"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { CategoryIcon } from "@/lib/icons";
import { todayInputValue, toDateInputValue } from "@/lib/dates";
import { createExpense, updateExpense } from "@/lib/api-client";
import { HandCoins, Receipt } from "lucide-react";

const emptyForm = {
  type: "EXPENSE",
  amount: "",
  description: "",
  categoryId: "",
  userId: "",
  date: todayInputValue(),
};

/**
 * Modal de création/modification d'une dépense OU d'un remboursement.
 *
 * Un remboursement est de l'argent donné directement d'une personne à
 * l'autre (ex : du cash remis en main propre). Contrairement à une dépense
 * commune, il ne se répartit pas 50/50 : il s'impute intégralement sur la
 * balance, réduisant (ou inversant) ce que la personne doit à l'autre.
 *
 * @param {boolean} open
 * @param {() => void} onClose
 * @param {() => void} onSaved - appelé après une sauvegarde réussie
 * @param {object[]} users
 * @param {object[]} categories
 * @param {object|null} expense - si fourni, la modal est en mode édition
 */
export default function ExpenseFormModal({ open, onClose, onSaved, users, categories, expense }) {
  const isEditing = Boolean(expense);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const isReimbursement = form.type === "REIMBURSEMENT";

  useEffect(() => {
    if (!open) return;

    if (expense) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- réinitialise le formulaire à l'ouverture
      setForm({
        type: expense.type || "EXPENSE",
        amount: String(expense.amount),
        description: expense.description || "",
        categoryId: expense.categoryId || "",
        userId: expense.userId,
        date: toDateInputValue(expense.date),
      });
    } else {
      setForm({
        ...emptyForm,
        categoryId: categories?.[0]?.id || "",
        userId: users?.[0]?.id || "",
      });
    }
    setErrors({});
    setSubmitError("");
  }, [open, expense, categories, users]);

  function setType(type) {
    setForm((f) => ({ ...f, type }));
    setErrors((e) => ({ ...e, categoryId: undefined }));
  }

  function validateClientSide() {
    const nextErrors = {};
    const amount = Number.parseFloat(String(form.amount).replace(",", "."));

    if (!form.amount) nextErrors.amount = "Le montant est obligatoire.";
    else if (Number.isNaN(amount) || amount <= 0)
      nextErrors.amount = "Le montant doit être supérieur à 0.";

    if (!isReimbursement && !form.categoryId) {
      nextErrors.categoryId = "La catégorie est obligatoire.";
    }
    if (!form.userId) nextErrors.userId = "La personne est obligatoire.";
    if (!form.date) nextErrors.date = "La date est obligatoire.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    if (!validateClientSide()) return;

    setSaving(true);
    try {
      const payload = {
        type: form.type,
        amount: form.amount,
        description: form.description,
        categoryId: isReimbursement ? null : form.categoryId,
        userId: form.userId,
        date: form.date,
      };

      if (isEditing) {
        await updateExpense(expense.id, payload);
      } else {
        await createExpense(payload);
      }

      onSaved?.();
      onClose?.();
    } catch (error) {
      if (error.errors && Object.keys(error.errors).length > 0) {
        setErrors(error.errors);
      } else {
        setSubmitError(error.message || "Impossible d'enregistrer.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Modifier" : "Ajouter"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            {isEditing ? "Enregistrer" : "Ajouter"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {submitError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>
        )}

        {/* Type : dépense commune ou remboursement en argent */}
        <div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("EXPENSE")}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                !isReimbursement
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
              }`}
            >
              <Receipt size={16} />
              Dépense
            </button>
            <button
              type="button"
              onClick={() => setType("REIMBURSEMENT")}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                isReimbursement
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
              }`}
            >
              <HandCoins size={16} />
              Remboursement
            </button>
          </div>
          {isReimbursement && (
            <p className="mt-2 text-xs text-neutral-500">
              De l&apos;argent donné directement à l&apos;autre personne (ex : du cash remis en
              main propre). Ce montant réduit directement ce qui est dû — il n&apos;est pas
              réparti 50/50 comme une dépense commune.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Montant</label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              autoFocus
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className={`w-full rounded-xl border px-3 py-2.5 pr-8 text-base focus:outline-none focus:ring-2 focus:ring-neutral-900/10 ${
                errors.amount ? "border-red-400" : "border-neutral-300"
              }`}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              $
            </span>
          </div>
          {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Description <span className="text-neutral-400 font-normal">(optionnelle)</span>
          </label>
          <input
            type="text"
            placeholder={isReimbursement ? "Ex : Remis en cash" : "Ex : Courses Costco"}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          />
        </div>

        {!isReimbursement && (
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Catégorie</label>
            <div className="grid grid-cols-3 gap-2">
              {categories?.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setForm((f) => ({ ...f, categoryId: cat.id }))}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors ${
                    form.categoryId === cat.id
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  <CategoryIcon name={cat.icon} size={16} />
                  <span className="truncate w-full text-center">{cat.name}</span>
                </button>
              ))}
            </div>
            {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId}</p>}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            {isReimbursement ? "Remis par" : "Payé par"}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {users?.map((u) => (
              <button
                type="button"
                key={u.id}
                onClick={() => setForm((f) => ({ ...f, userId: u.id }))}
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                  form.userId === u.id
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                }`}
              >
                {u.name}
              </button>
            ))}
          </div>
          {errors.userId && <p className="mt-1 text-xs text-red-600">{errors.userId}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className={`w-full rounded-xl border px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-neutral-900/10 ${
              errors.date ? "border-red-400" : "border-neutral-300"
            }`}
          />
          {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
        </div>
      </form>
    </Modal>
  );
}
