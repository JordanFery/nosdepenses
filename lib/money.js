/**
 * Utilitaires monétaires.
 *
 * Toutes les opérations arithmétiques sur les montants sont effectuées en
 * "cents" (entiers) afin d'éviter les erreurs d'arrondi liées aux nombres
 * flottants (0.1 + 0.2 !== 0.3). On ne repasse en dollars qu'au moment de
 * l'affichage ou de la sérialisation JSON.
 */

/**
 * Convertit une valeur (Decimal Prisma, string ou number) en cents (entier).
 */
export function toCents(value) {
  if (value === null || value === undefined) return 0;

  // Prisma.Decimal expose toFixed(); on l'utilise pour éviter les erreurs
  // de conversion binaire des flottants.
  const asString =
    typeof value === "object" && typeof value.toFixed === "function"
      ? value.toFixed(2)
      : String(value);

  const normalized = asString.replace(",", ".").trim();
  const parsed = Number.parseFloat(normalized);

  if (Number.isNaN(parsed)) return 0;

  // Math.round évite les erreurs de type 12.30 * 100 = 1229.999999999998
  return Math.round(parsed * 100);
}

/** Convertit des cents (entier) en dollars (number à 2 décimales). */
export function centsToAmount(cents) {
  return Math.round(cents) / 100;
}

/** Formate un montant en cents en chaîne monétaire ("1 234,56 $"). */
export function formatCentsAsCurrency(cents) {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(centsToAmount(cents));
}

/** Formate directement un nombre (dollars) en chaîne monétaire. */
export function formatCurrency(amount) {
  return formatCentsAsCurrency(Math.round(Number(amount || 0) * 100));
}
