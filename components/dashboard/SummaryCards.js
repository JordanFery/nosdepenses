import Card from "@/components/ui/Card";
import { formatCurrency } from "@/lib/money";

const ACCENTS = ["border-t-blue-500", "border-t-pink-500", "border-t-emerald-500", "border-t-amber-500"];

export default function SummaryCards({ total, byUser }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="p-5 border-t-4 border-t-neutral-900 sm:col-span-1">
        <p className="text-sm font-medium text-neutral-500">Total du mois</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-neutral-900">
          {formatCurrency(total)}
        </p>
      </Card>

      {byUser.map((u, i) => (
        <Card key={u.id} className={`p-5 border-t-4 ${ACCENTS[i % ACCENTS.length]}`}>
          <p className="text-sm font-medium text-neutral-500">{u.name}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-neutral-900">
            {formatCurrency(u.total)}
          </p>
        </Card>
      ))}
    </div>
  );
}
