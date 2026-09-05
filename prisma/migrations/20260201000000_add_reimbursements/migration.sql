-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('EXPENSE', 'REIMBURSEMENT');

-- DropForeignKey (l'ancienne contrainte interdisait categoryId NULL / ON DELETE RESTRICT)
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_categoryId_fkey";

-- AlterTable
ALTER TABLE "expenses"
  ADD COLUMN "type" "ExpenseType" NOT NULL DEFAULT 'EXPENSE',
  ALTER COLUMN "categoryId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "expenses_type_idx" ON "expenses"("type");

-- AddForeignKey (categoryId optionnel, mis à NULL si la catégorie est supprimée)
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
