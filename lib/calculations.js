import { toCents, centsToAmount } from "./money.js";

/**
 * Calcule l'équilibrage 50/50 entre les deux membres du couple.
 *
 * Principe :
 *   1) Les dépenses communes (type EXPENSE) se répartissent 50/50 :
 *        net = (totalB - totalA) / 2
 *      Si net > 0, A doit "net" à B ; si net < 0, B doit "-net" à A.
 *   2) Les remboursements (type REIMBURSEMENT) sont de l'argent donné
 *      directement d'une personne à l'autre pour régler une partie de la
 *      dette. Ils s'appliquent au montant net EN ENTIER (pas divisés par
 *      deux), car ce n'est pas une dépense commune : c'est un paiement
 *      qui règle directement la balance.
 *        - un remboursement payé par A réduit ce que A doit à B (net -= montant)
 *        - un remboursement payé par B réduit ce que B doit à A,
 *          ce qui revient à augmenter net (net += montant)
 *
 * @param {{ id: string, name: string, totalCents: number }} userA
 * @param {{ id: string, name: string, totalCents: number }} userB
 * @param {{ userId: string, amount: number|string }[]} reimbursements
 */
export function computeBalance(userA, userB, reimbursements = []) {
  let netCents = Math.round((userB.totalCents - userA.totalCents) / 2);

  for (const r of reimbursements) {
    const cents = toCents(r.amount);
    if (r.userId === userA.id) {
      netCents -= cents;
    } else if (r.userId === userB.id) {
      netCents += cents;
    }
  }

  if (netCents === 0) {
    return {
      status: "balanced",
      amountCents: 0,
      debtor: null,
      creditor: null,
    };
  }

  if (netCents > 0) {
    // A doit netCents à B
    return {
      status: "debt",
      amountCents: netCents,
      debtor: { id: userA.id, name: userA.name },
      creditor: { id: userB.id, name: userB.name },
    };
  }

  // B doit |netCents| à A
  return {
    status: "debt",
    amountCents: -netCents,
    debtor: { id: userB.id, name: userB.name },
    creditor: { id: userA.id, name: userA.name },
  };
}

/**
 * Calcule l'ensemble des statistiques d'un mois à partir de la liste brute
 * des dépenses (incluant leurs relations `user` et `category`) et de la
 * liste des utilisateurs du foyer.
 *
 * Les dépenses de type REIMBURSEMENT sont exclues des totaux "dépensés" et
 * des catégories (ce ne sont pas des dépenses communes), mais sont prises
 * en compte dans le calcul final de l'équilibrage.
 *
 * Toute l'arithmétique est effectuée en cents (entiers) via lib/money.js
 * afin de garantir une précision parfaite à deux décimales.
 */
export function computeMonthlyStats(allEntries, users) {
  const expenses = allEntries.filter((e) => e.type !== "REIMBURSEMENT");
  const reimbursements = allEntries.filter((e) => e.type === "REIMBURSEMENT");

  const totalsByUserId = new Map(users.map((u) => [u.id, 0]));
  const categoryMap = new Map(); // categoryId -> { id, name, icon, totalCents, byUser: Map }

  let totalCents = 0;

  for (const expense of expenses) {
    const cents = toCents(expense.amount);
    totalCents += cents;

    totalsByUserId.set(
      expense.userId,
      (totalsByUserId.get(expense.userId) || 0) + cents
    );

    const catId = expense.categoryId;
    if (!catId) continue; // sécurité : ne devrait pas arriver pour une EXPENSE

    if (!categoryMap.has(catId)) {
      categoryMap.set(catId, {
        id: catId,
        name: expense.category?.name || "Autre",
        icon: expense.category?.icon || "Tag",
        totalCents: 0,
        byUser: new Map(users.map((u) => [u.id, 0])),
      });
    }
    const cat = categoryMap.get(catId);
    cat.totalCents += cents;
    cat.byUser.set(expense.userId, (cat.byUser.get(expense.userId) || 0) + cents);
  }

  const byUser = users.map((u) => ({
    id: u.id,
    name: u.name,
    totalCents: totalsByUserId.get(u.id) || 0,
    total: centsToAmount(totalsByUserId.get(u.id) || 0),
  }));

  const categories = Array.from(categoryMap.values())
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      totalCents: cat.totalCents,
      total: centsToAmount(cat.totalCents),
      byUser: users.map((u) => ({
        id: u.id,
        name: u.name,
        totalCents: cat.byUser.get(u.id) || 0,
        total: centsToAmount(cat.byUser.get(u.id) || 0),
      })),
    }))
    .sort((a, b) => b.totalCents - a.totalCents);

  const reimbursementsTotalCents = reimbursements.reduce(
    (sum, r) => sum + toCents(r.amount),
    0
  );

  let balance = { status: "balanced", amountCents: 0, debtor: null, creditor: null };
  if (byUser.length === 2) {
    balance = computeBalance(byUser[0], byUser[1], reimbursements);
  }

  return {
    totalCents,
    total: centsToAmount(totalCents),
    byUser,
    categories,
    reimbursementsTotalCents,
    reimbursementsTotal: centsToAmount(reimbursementsTotalCents),
    reimbursementCount: reimbursements.length,
    balance: {
      ...balance,
      amount: centsToAmount(balance.amountCents),
    },
  };
}
