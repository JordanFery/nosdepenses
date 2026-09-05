import Card from "@/components/ui/Card";
import { formatCurrency } from "@/lib/money";
import { formatDayMonth } from "@/lib/dates";
import { Scale, PartyPopper, HandCoins } from "lucide-react";

export default function BalanceCard({ balance, byUser, reimbursements = [] }) {
  const isBalanced = balance.status === "balanced";

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Scale size={18} className="text-neutral-500" />
        <h3 className="font-semibold text-neutral-900">Équilibrage</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {byUser.map((u) => (
          <div key={u.id} className="rounded-xl bg-neutral-50 px-4 py-3">
            <p className="text-xs font-medium text-neutral-500">{u.name} a payé</p>
            <p className="mt-0.5 text-lg font-semibold text-neutral-900">{formatCurrency(u.total)}</p>
          </div>
        ))}
      </div>

      {reimbursements.length > 0 && (
        <div className="mb-4 flex flex-col gap-1.5 rounded-xl bg-blue-50 px-4 py-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-blue-700">
            <HandCoins size={14} />
            Remboursements ce mois-ci
          </p>
          {reimbursements.map((r) => (
            <p key={r.id} className="text-sm text-blue-900">
              {formatDayMonth(r.date)} · <span className="font-medium">{r.userName}</span> a remis{" "}
              <span className="font-semibold">{formatCurrency(r.amount)}</span>
              {r.description ? ` — ${r.description}` : ""}
            </p>
          ))}
        </div>
      )}

      <div className="border-t border-dashed border-neutral-200 pt-4">
        {isBalanced ? (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
            <PartyPopper size={18} />
            <span className="font-medium">Dépenses équilibrées</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-3.5 text-center">
            <span className="font-semibold text-amber-900">{balance.debtor?.name}</span>
            <span className="text-amber-700 text-sm">doit</span>
            <span className="font-bold text-amber-900">{formatCurrency(balance.amount)}</span>
            <span className="text-amber-700 text-sm">à</span>
            <span className="font-semibold text-amber-900">{balance.creditor?.name}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
