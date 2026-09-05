import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const USERS = [
  { name: "Jordan", email: "jordan@example.com" },
  { name: "Samya", email: "samya@example.com" },
];

const CATEGORIES = [
  { name: "Courses", icon: "ShoppingCart" },
  { name: "Restaurant", icon: "UtensilsCrossed" },
  { name: "Logement", icon: "Home" },
  { name: "Transport", icon: "Car" },
  { name: "Loisirs", icon: "Ticket" },
  { name: "Abonnements", icon: "RefreshCcw" },
  { name: "Santé", icon: "HeartPulse" },
  { name: "Shopping", icon: "ShoppingBag" },
  { name: "Autre", icon: "Tag" },
];

// Quelques dépenses de démonstration pour le mois courant, afin que le
// dashboard ne soit pas vide au premier lancement. Clairement identifiables
// comme données de test via leurs descriptions.
function buildDemoExpenses({ jordanId, samyaId, categoryIdByName }) {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth(); // 0-indexed
  const d = (day) => new Date(Date.UTC(y, m, day));

  return [
    {
      amount: "52.40",
      description: "[Démo] Courses Costco",
      date: d(2),
      userId: jordanId,
      categoryId: categoryIdByName.get("Courses"),
    },
    {
      amount: "24.80",
      description: "[Démo] Restaurant XYZ",
      date: d(3),
      userId: samyaId,
      categoryId: categoryIdByName.get("Restaurant"),
    },
    {
      amount: "11.25",
      description: "[Démo] STM",
      date: d(4),
      userId: jordanId,
      categoryId: categoryIdByName.get("Transport"),
    },
    {
      amount: "1200.00",
      description: "[Démo] Loyer",
      date: d(1),
      userId: samyaId,
      categoryId: categoryIdByName.get("Logement"),
    },
    {
      amount: "45.99",
      description: "[Démo] Abonnement streaming + internet",
      date: d(5),
      userId: jordanId,
      categoryId: categoryIdByName.get("Abonnements"),
    },
    {
      amount: "80.00",
      description: "[Démo] Cinéma",
      date: d(6),
      userId: samyaId,
      categoryId: categoryIdByName.get("Loisirs"),
    },
    {
      amount: "30.00",
      description: "[Démo] Remis en cash",
      date: d(7),
      userId: jordanId,
      categoryId: null,
      type: "REIMBURSEMENT",
    },
  ];
}

async function main() {
  console.log("🌱 Seed — utilisateurs...");
  const users = {};
  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name },
      create: u,
    });
    users[u.name] = user;
    console.log(`  ✔ ${user.name} (${user.id})`);
  }

  console.log("🌱 Seed — catégories...");
  const categoryIdByName = new Map();
  for (const c of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { name: c.name },
      update: { icon: c.icon },
      create: c,
    });
    categoryIdByName.set(category.name, category.id);
    console.log(`  ✔ ${category.name}`);
  }

  console.log("🌱 Seed — dépenses de démonstration...");
  const existingDemoCount = await prisma.expense.count({
    where: { description: { startsWith: "[Démo]" } },
  });

  if (existingDemoCount > 0) {
    console.log("  ↷ Des dépenses de démonstration existent déjà, on ne les recrée pas.");
  } else {
    const demoExpenses = buildDemoExpenses({
      jordanId: users["Jordan"].id,
      samyaId: users["Samya"].id,
      categoryIdByName,
    });
    await prisma.expense.createMany({ data: demoExpenses });
    console.log(`  ✔ ${demoExpenses.length} dépenses de démonstration créées.`);
  }

  console.log("✅ Seed terminé avec succès.");
}

main()
  .catch((error) => {
    console.error("❌ Erreur durant le seed :", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
