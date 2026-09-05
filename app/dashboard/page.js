import { Suspense } from "react";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { Spinner } from "@/components/ui/Spinner";

export const metadata = { title: "Dashboard — Dépenses du couple" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <DashboardClient />
    </Suspense>
  );
}
