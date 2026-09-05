import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { currentMonthKey, getMonthRange, isValidMonthKey, shiftMonthKey } from "@/lib/dates";
import { computeMonthlyStats } from "@/lib/calculations";

/**
 * GET /api/stats?month=YYYY-MM
 *
 * Calcule côté serveur toutes les statistiques nécessaires au dashboard :
 * total du mois, total par personne, équilibrage 50/50 (remboursements en
 * argent inclus), et répartition par catégorie. Toujours basé sur
 * l'ensemble des entrées du mois (non filtré), pour que l'équilibrage
 * reste exact.
 */
export async function GET(request) {
  const prisma = getPrisma();
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || currentMonthKey();

    if (!isValidMonthKey(month)) {
      return NextResponse.json({ error: "Paramètre 'month' invalide." }, { status: 400 });
    }

    const { start, end } = getMonthRange(month);

    const [users, entries] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.expense.findMany({
        where: { date: { gte: start, lt: end } },
        include: {
          category: { select: { id: true, name: true, icon: true } },
          user: { select: { id: true, name: true } },
        },
        orderBy: { date: "desc" },
      }),
    ]);

    const stats = computeMonthlyStats(entries, users);
    const expenseCount = entries.filter((e) => e.type !== "REIMBURSEMENT").length;

    const reimbursements = entries
      .filter((e) => e.type === "REIMBURSEMENT")
      .map((r) => ({
        id: r.id,
        amount: Number(r.amount),
        date: r.date.toISOString(),
        userId: r.userId,
        userName: r.user?.name,
        description: r.description,
      }));

    return NextResponse.json({
      data: {
        month,
        previousMonth: shiftMonthKey(month, -1),
        nextMonth: shiftMonthKey(month, 1),
        total: stats.total,
        byUser: stats.byUser.map(({ id, name, total }) => ({ id, name, total })),
        categories: stats.categories.map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          total: c.total,
          byUser: c.byUser.map(({ id, name, total }) => ({ id, name, total })),
        })),
        balance: stats.balance,
        reimbursements,
        reimbursementsTotal: stats.reimbursementsTotal,
        expenseCount,
        entryCount: entries.length,
      },
    });
  } catch (error) {
    console.error("[GET /api/stats]", error);
    return NextResponse.json(
      { error: "Impossible de calculer les statistiques." },
      { status: 500 }
    );
  }
}
