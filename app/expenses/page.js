import { Suspense } from "react";
import ExpensesClient from "@/components/expenses/ExpensesClient";
import { Spinner } from "@/components/ui/Spinner";

export const metadata = { title: "Dépenses — Dépenses du couple" };

export default function ExpensesPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ExpensesClient />
    </Suspense>
  );
}
