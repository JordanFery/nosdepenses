import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { validateExpensePayload } from "@/lib/validation";
import { currentMonthKey, getMonthRange, isValidMonthKey } from "@/lib/dates";
import { toCents, centsToAmount } from "@/lib/money";

const expenseInclude = {
  user: { select: { id: true, name: true } },
  category: { select: { id: true, name: true, icon: true } },
};

/**
 * GET /api/expenses?month=YYYY-MM&userId=...&categoryId=...
 *
 * Retourne les dépenses du mois demandé (mois courant par défaut),
 * éventuellement filtrées par personne et/ou catégorie. Les filtres se
 * combinent (ex: Samya + Restaurant).
 */
export async function GET(request) {
  const prisma = getPrisma();
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || currentMonthKey();
    const userId = searchParams.get("userId") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;

    if (!isValidMonthKey(month)) {
      return NextResponse.json({ error: "Paramètre 'month' invalide." }, { status: 400 });
    }

    const { start, end } = getMonthRange(month);

    const where = {
      date: { gte: start, lt: end },
      ...(userId ? { userId } : {}),
      ...(categoryId ? { categoryId } : {}),
    };

    const expenses = await prisma.expense.findMany({
      where,
      include: expenseInclude,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });

    const filteredTotalCents = expenses
      .filter((e) => e.type !== "REIMBURSEMENT")
      .reduce((sum, e) => sum + toCents(e.amount), 0);
    const reimbursementTotalCents = expenses
      .filter((e) => e.type === "REIMBURSEMENT")
      .reduce((sum, e) => sum + toCents(e.amount), 0);

    return NextResponse.json({
      data: expenses.map(serializeExpense),
      meta: {
        month,
        count: expenses.length,
        // Total des dépenses uniquement (les remboursements ne sont pas
        // des dépenses communes, ils ne doivent pas gonfler ce total).
        filteredTotal: centsToAmount(filteredTotalCents),
        reimbursementTotal: centsToAmount(reimbursementTotalCents),
      },
    });
  } catch (error) {
    console.error("[GET /api/expenses]", error);
    return NextResponse.json({ error: "Impossible de récupérer les dépenses." }, { status: 500 });
  }
}

/** POST /api/expenses — crée une nouvelle dépense. */
export async function POST(request) {
  const prisma = getPrisma();
  try {
    const body = await request.json();
    const { valid, errors, data } = validateExpensePayload(body);

    if (!valid) {
      return NextResponse.json({ error: "Données invalides.", errors }, { status: 422 });
    }

    const [user, category] = await Promise.all([
      prisma.user.findUnique({ where: { id: data.userId } }),
      data.categoryId
        ? prisma.category.findUnique({ where: { id: data.categoryId } })
        : Promise.resolve(null),
    ]);

    if (!user) {
      return NextResponse.json(
        { error: "Personne introuvable.", errors: { userId: "Personne introuvable." } },
        { status: 422 }
      );
    }
    if (data.categoryId && !category) {
      return NextResponse.json(
        { error: "Catégorie introuvable.", errors: { categoryId: "Catégorie introuvable." } },
        { status: 422 }
      );
    }

    const expense = await prisma.expense.create({
      data,
      include: expenseInclude,
    });

    return NextResponse.json({ data: serializeExpense(expense) }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/expenses]", error);
    return NextResponse.json({ error: "Impossible de créer la dépense." }, { status: 500 });
  }
}

/** Convertit une dépense Prisma (Decimal, Date) en JSON sérialisable. */
export function serializeExpense(expense) {
  return {
    id: expense.id,
    amount: centsToAmount(toCents(expense.amount)),
    description: expense.description,
    date: expense.date.toISOString(),
    type: expense.type,
    userId: expense.userId,
    categoryId: expense.categoryId,
    user: expense.user,
    category: expense.category,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  };
}
