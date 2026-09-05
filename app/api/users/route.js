import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const prisma = getPrisma();
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    return NextResponse.json({ data: users });
  } catch (error) {
    console.error("[GET /api/users]", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les utilisateurs." },
      { status: 500 }
    );
  }
}
