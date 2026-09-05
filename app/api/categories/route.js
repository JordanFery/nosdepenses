import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { validateCategoryPayload } from "@/lib/validation";

export async function GET() {
  const prisma = getPrisma();
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("[GET /api/categories]", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les catégories." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const prisma = getPrisma();
  try {
    const body = await request.json();
    const { valid, errors, data } = validateCategoryPayload(body);

    if (!valid) {
      return NextResponse.json({ error: "Données invalides.", errors }, { status: 422 });
    }

    const existing = await prisma.category.findUnique({ where: { name: data.name } });
    if (existing) {
      return NextResponse.json(
        { error: "Cette catégorie existe déjà.", errors: { name: "Cette catégorie existe déjà." } },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({ data });
    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/categories]", error);
    return NextResponse.json(
      { error: "Impossible de créer la catégorie." },
      { status: 500 }
    );
  }
}
