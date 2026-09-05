import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { validateExpensePayload } from "@/lib/validation";
import { serializeExpense } from "../route";

const expenseInclude = {
  user: { select: { id: true, name: true } },
  category: { select: { id: true, name: true, icon: true } },
};

export async function GET(_request, { params }) {
  const prisma = getPrisma();
  const { id } = await params;
  try {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: expenseInclude,
    });

    if (!expense) {
      return NextResponse.json({ error: "Dépense introuvable." }, { status: 404 });
    }

    return NextResponse.json({ data: serializeExpense(expense) });
  } catch (error) {
    console.error("[GET /api/expenses/:id]", error);
    return NextResponse.json({ error: "Impossible de récupérer la dépense." }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const prisma = getPrisma();
  const { id } = await params;
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

    const expense = await prisma.expense.update({
      where: { id },
      data,
      include: expenseInclude,
    });

    return NextResponse.json({ data: serializeExpense(expense) });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Dépense introuvable." }, { status: 404 });
    }
    console.error("[PUT /api/expenses/:id]", error);
    return NextResponse.json({ error: "Impossible de modifier la dépense." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const prisma = getPrisma();
  const { id } = await params;
  try {
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Dépense introuvable." }, { status: 404 });
    }
    console.error("[DELETE /api/expenses/:id]", error);
    return NextResponse.json({ error: "Impossible de supprimer la dépense." }, { status: 500 });
  }
}
