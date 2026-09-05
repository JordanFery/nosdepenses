import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { validateCategoryPayload } from "@/lib/validation";

export async function PUT(request, { params }) {
  const prisma = getPrisma();
  const { id } = await params;
  try {
    const body = await request.json();
    const { valid, errors, data } = validateCategoryPayload(body);

    if (!valid) {
      return NextResponse.json({ error: "Données invalides.", errors }, { status: 422 });
    }

    const category = await prisma.category.update({ where: { id }, data });
    return NextResponse.json({ data: category });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Catégorie introuvable." }, { status: 404 });
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Cette catégorie existe déjà.", errors: { name: "Cette catégorie existe déjà." } },
        { status: 409 }
      );
    }
    console.error("[PUT /api/categories/:id]", error);
    return NextResponse.json({ error: "Impossible de modifier la catégorie." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const prisma = getPrisma();
  const { id } = await params;
  try {
    const expenseCount = await prisma.expense.count({ where: { categoryId: id } });
    if (expenseCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cette catégorie est utilisée par des dépenses existantes et ne peut pas être supprimée.",
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Catégorie introuvable." }, { status: 404 });
    }
    console.error("[DELETE /api/categories/:id]", error);
    return NextResponse.json({ error: "Impossible de supprimer la catégorie." }, { status: 500 });
  }
}
