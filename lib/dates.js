/**
 * Utilitaires de dates.
 *
 * Les dépenses sont stockées avec un champ `date` de type SQL DATE (sans
 * heure). Prisma renvoie alors un objet JS `Date` positionné à minuit UTC.
 * Pour éviter tout décalage lié au fuseau horaire local du serveur ou du
 * navigateur, on manipule systématiquement les dates via leurs composantes
 * UTC (getUTCFullYear, getUTCMonth, getUTCDate) plutôt que les équivalents
 * locaux (getFullYear, getMonth, getDate).
 */

const pad2 = (n) => String(n).padStart(2, "0");

/** Retourne la clé de mois "YYYY-MM" du mois courant (UTC). */
export function currentMonthKey() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${pad2(now.getUTCMonth() + 1)}`;
}

/** Retourne la clé de mois "YYYY-MM" à partir d'une Date (UTC). */
export function monthKeyFromDate(date) {
  const d = new Date(date);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}`;
}

/** Vérifie qu'une chaîne est une clé de mois valide "YYYY-MM". */
export function isValidMonthKey(monthKey) {
  return typeof monthKey === "string" && /^\d{4}-\d{2}$/.test(monthKey);
}

/**
 * Retourne les bornes [start, end) d'un mois donné, en UTC.
 * `end` est exclusif (premier jour du mois suivant).
 */
export function getMonthRange(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(month === 12 ? year + 1 : year, month === 12 ? 0 : month, 1, 0, 0, 0));
  return { start, end };
}

/** Décale une clé de mois "YYYY-MM" de `delta` mois (positif ou négatif). */
export function shiftMonthKey(monthKey, delta) {
  const [year, month] = monthKey.split("-").map(Number);
  const total = year * 12 + (month - 1) + delta;
  const newYear = Math.floor(total / 12);
  const newMonth = (total % 12) + 1;
  return `${newYear}-${pad2(newMonth)}`;
}

const MONTHS_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

/** Formate une clé de mois "YYYY-MM" en "septembre 2026". */
export function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return `${MONTHS_FR[month - 1]} ${year}`;
}

/** Formate une Date en "04 septembre" (pour les regroupements de liste). */
export function formatDayMonth(date) {
  const d = new Date(date);
  return `${pad2(d.getUTCDate())} ${MONTHS_FR[d.getUTCMonth()]}`;
}

/** Formate une Date en "04/09/2026". */
export function formatDateShort(date) {
  const d = new Date(date);
  return `${pad2(d.getUTCDate())}/${pad2(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}

/** Convertit une Date en valeur pour <input type="date"> : "2026-09-04". */
export function toDateInputValue(date) {
  const d = new Date(date);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

/**
 * Parse une chaîne "YYYY-MM-DD" (issue d'un <input type="date">) en Date
 * UTC à minuit, prête à être envoyée à Prisma pour un champ @db.Date.
 */
export function parseDateInputValue(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  // Vérifie que la date est réellement valide (ex: 2026-02-30 est invalide).
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

/** Aujourd'hui, en valeur pour <input type="date"> (UTC). */
export function todayInputValue() {
  return toDateInputValue(new Date());
}
