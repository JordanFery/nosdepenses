import { parseDateInputValue } from "./dates.js";

const VALID_TYPES = ["EXPENSE", "REIMBURSEMENT"];

/**
 * Valide le payload d'une dépense ou d'un remboursement (création ou
 * modification). Ne fait JAMAIS confiance aux données envoyées par le
 * client : tout est revalidé ici, côté serveur.
 *
 * @returns {{ valid: boolean, errors: Record<string,string>, data?: object }}
 */
export function validateExpensePayload(body) {
  const errors = {};
  const data = {};

  // --- Type (EXPENSE par défaut, ou REIMBURSEMENT) ---
  const type = VALID_TYPES.includes(body?.type) ? body.type : "EXPENSE";
  data.type = type;
  const isReimbursement = type === "REIMBURSEMENT";

  // --- Montant ---
  const rawAmount = body?.amount;
  const amount =
    typeof rawAmount === "string" ? Number.parseFloat(rawAmount.replace(",", ".")) : Number(rawAmount);

  if (rawAmount === undefined || rawAmount === null || rawAmount === "") {
    errors.amount = "Le montant est obligatoire.";
  } else if (Number.isNaN(amount)) {
    errors.amount = "Le montant doit être un nombre valide.";
  } else if (amount <= 0) {
    errors.amount = "Le montant doit être supérieur à 0.";
  } else if (amount > 1_000_000) {
    errors.amount = "Le montant semble incorrect.";
  } else {
    data.amount = Math.round(amount * 100) / 100;
  }

  // --- Description (optionnelle) ---
  if (body?.description !== undefined && body?.description !== null) {
    const description = String(body.description).trim();
    if (description.length > 280) {
      errors.description = "La description est trop longue (280 caractères maximum).";
    } else {
      data.description = description.length > 0 ? description : null;
    }
  } else {
    data.description = null;
  }

  // --- Catégorie ---
  // Obligatoire pour une dépense commune ; toujours nulle pour un
  // remboursement (ce n'est pas une dépense catégorisée).
  if (isReimbursement) {
    data.categoryId = null;
  } else if (!body?.categoryId || typeof body.categoryId !== "string") {
    errors.categoryId = "La catégorie est obligatoire.";
  } else {
    data.categoryId = body.categoryId;
  }

  // --- Personne ---
  // Pour une dépense : la personne qui a payé.
  // Pour un remboursement : la personne qui a donné l'argent (l'autre
  // personne du foyer est déduite automatiquement côté calcul).
  if (!body?.userId || typeof body.userId !== "string") {
    errors.userId = isReimbursement
      ? "La personne qui a remis l'argent est obligatoire."
      : "La personne ayant payé est obligatoire.";
  } else {
    data.userId = body.userId;
  }

  // --- Date ---
  if (!body?.date) {
    errors.date = "La date est obligatoire.";
  } else {
    const parsed = parseDateInputValue(body.date);
    if (!parsed) {
      errors.date = "La date est invalide.";
    } else {
      data.date = parsed;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors, data };
}

/** Valide le payload d'une catégorie. */
export function validateCategoryPayload(body) {
  const errors = {};
  const data = {};

  const name = String(body?.name || "").trim();
  if (!name) {
    errors.name = "Le nom de la catégorie est obligatoire.";
  } else if (name.length > 40) {
    errors.name = "Le nom est trop long (40 caractères maximum).";
  } else {
    data.name = name;
  }

  data.icon = body?.icon && typeof body.icon === "string" ? body.icon : "Tag";

  return { valid: Object.keys(errors).length === 0, errors, data };
}

/** Valide qu'une clé de mois "YYYY-MM" fournie en query param est correcte. */
export function isValidMonthParam(monthKey) {
  return typeof monthKey === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(monthKey);
}
