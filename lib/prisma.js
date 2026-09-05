import { PrismaClient } from "@prisma/client";

// Évite de créer une nouvelle instance de PrismaClient à chaque
// rechargement à chaud en développement (Next.js App Router).
//
// Important : l'instanciation est différée (lazy) jusqu'au premier appel
// de getPrisma(), plutôt que faite au chargement du module. Cela évite
// que `next build` échoue lors de l'étape de "collecte des données de
// page", qui importe (mais n'exécute pas) les Route Handlers.
const globalForPrisma = globalThis;

export function getPrisma() {
  if (!globalForPrisma.__prisma) {
    globalForPrisma.__prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return globalForPrisma.__prisma;
}
