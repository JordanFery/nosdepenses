import test from "node:test";
import assert from "node:assert/strict";
import { computeBalance, computeMonthlyStats } from "../lib/calculations.js";
import { toCents } from "../lib/money.js";

function user(id, name, total) {
  return { id, name, totalCents: toCents(total) };
}

test("Cas 1 — Jordan = 100, Samya = 100 => équilibré", () => {
  const result = computeBalance(user("j", "Jordan", 100), user("s", "Samya", 100));
  assert.equal(result.status, "balanced");
  assert.equal(result.amountCents, 0);
});

test("Cas 2 — Jordan = 120, Samya = 80 => Samya doit 20 $ à Jordan", () => {
  const result = computeBalance(user("j", "Jordan", 120), user("s", "Samya", 80));
  assert.equal(result.status, "debt");
  assert.equal(result.amountCents, 2000);
  assert.equal(result.debtor.name, "Samya");
  assert.equal(result.creditor.name, "Jordan");
});

test("Cas 3 — Jordan = 80, Samya = 120 => Jordan doit 20 $ à Samya", () => {
  const result = computeBalance(user("j", "Jordan", 80), user("s", "Samya", 120));
  assert.equal(result.status, "debt");
  assert.equal(result.amountCents, 2000);
  assert.equal(result.debtor.name, "Jordan");
  assert.equal(result.creditor.name, "Samya");
});

test("Cas 4 — Jordan = 1000, Samya = 500 => Samya doit 250 $ à Jordan", () => {
  const result = computeBalance(user("j", "Jordan", 1000), user("s", "Samya", 500));
  assert.equal(result.status, "debt");
  assert.equal(result.amountCents, 25000);
  assert.equal(result.debtor.name, "Samya");
  assert.equal(result.creditor.name, "Jordan");
});

test("Cas 5 — Jordan = 0, Samya = 100 => Jordan doit 50 $ à Samya", () => {
  const result = computeBalance(user("j", "Jordan", 0), user("s", "Samya", 100));
  assert.equal(result.status, "debt");
  assert.equal(result.amountCents, 5000);
  assert.equal(result.debtor.name, "Jordan");
  assert.equal(result.creditor.name, "Samya");
});

test("Précision décimale — 100,01 $ ne devient jamais 100.00999...", () => {
  const result = computeBalance(user("j", "Jordan", 200.02), user("s", "Samya", 0));
  assert.equal(result.amountCents, 10001); // 100,01 $ exactement
});

test("Remboursement — l'exemple du cahier des charges (Costco 100$, remboursement 50$)", () => {
  // Samya dépense 100$ (dépense commune) -> Jordan lui doit 50$.
  const jordan = user("j", "Jordan", 0);
  const samya = user("s", "Samya", 100);

  const before = computeBalance(jordan, samya);
  assert.equal(before.status, "debt");
  assert.equal(before.debtor.name, "Jordan");
  assert.equal(before.amountCents, 5000);

  // Jordan rembourse 50$ en cash à Samya -> la balance doit tomber à 0,
  // et NON à 25$ (le remboursement ne se répartit pas 50/50).
  const reimbursements = [{ userId: "j", amount: "50.00" }];
  const after = computeBalance(jordan, samya, reimbursements);
  assert.equal(after.status, "balanced");
  assert.equal(after.amountCents, 0);
});

test("Remboursement partiel — ne solde pas complètement la dette", () => {
  const jordan = user("j", "Jordan", 0);
  const samya = user("s", "Samya", 100);
  const reimbursements = [{ userId: "j", amount: "20.00" }];
  const result = computeBalance(jordan, samya, reimbursements);
  assert.equal(result.status, "debt");
  assert.equal(result.debtor.name, "Jordan");
  assert.equal(result.amountCents, 3000); // 50$ - 20$ = 30$
});

test("Remboursement excédentaire — inverse le sens de la dette", () => {
  const jordan = user("j", "Jordan", 0);
  const samya = user("s", "Samya", 100);
  const reimbursements = [{ userId: "j", amount: "80.00" }];
  const result = computeBalance(jordan, samya, reimbursements);
  assert.equal(result.status, "debt");
  // Jordan devait 50$, a donné 80$ -> Samya lui doit maintenant 30$.
  assert.equal(result.debtor.name, "Samya");
  assert.equal(result.creditor.name, "Jordan");
  assert.equal(result.amountCents, 3000);
});

test("computeMonthlyStats — exclut les remboursements des totaux et catégories", () => {
  const users = [
    { id: "j", name: "Jordan" },
    { id: "s", name: "Samya" },
  ];
  const entries = [
    {
      amount: "100.00",
      userId: "s",
      categoryId: "c1",
      category: { name: "Courses" },
      type: "EXPENSE",
    },
    {
      amount: "50.00",
      userId: "j",
      categoryId: null,
      category: null,
      type: "REIMBURSEMENT",
    },
  ];

  const stats = computeMonthlyStats(entries, users);

  // Le remboursement ne compte pas dans le total "dépensé" du mois.
  assert.equal(stats.total, 100);
  assert.equal(stats.byUser.find((u) => u.id === "j").total, 0);
  assert.equal(stats.byUser.find((u) => u.id === "s").total, 100);
  assert.equal(stats.categories.length, 1);
  assert.equal(stats.reimbursementsTotal, 50);
  assert.equal(stats.reimbursementCount, 1);

  // Mais il s'applique bien à l'équilibrage final.
  assert.equal(stats.balance.status, "balanced");
});

test("computeMonthlyStats — totaux, catégories et équilibrage cohérents", () => {
  const users = [
    { id: "j", name: "Jordan" },
    { id: "s", name: "Samya" },
  ];
  const expenses = [
    { amount: "52.40", userId: "j", categoryId: "c1", category: { name: "Courses" } },
    { amount: "24.80", userId: "s", categoryId: "c2", category: { name: "Restaurant" } },
    { amount: "11.25", userId: "j", categoryId: "c3", category: { name: "Transport" } },
  ];

  const stats = computeMonthlyStats(expenses, users);

  assert.equal(stats.total, 88.45);
  assert.equal(stats.byUser.find((u) => u.id === "j").total, 63.65);
  assert.equal(stats.byUser.find((u) => u.id === "s").total, 24.8);
  assert.equal(stats.categories.length, 3);
  // Triées par montant décroissant
  assert.equal(stats.categories[0].name, "Courses");
  // Le total des catégories doit correspondre au total des dépenses
  const categoriesTotal = stats.categories.reduce((sum, c) => sum + c.totalCents, 0);
  assert.equal(categoriesTotal, stats.totalCents);
});
