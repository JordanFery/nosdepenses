import Card from "@/components/ui/Card";
import { CategoryIcon } from "@/lib/icons";
import { formatCurrency } from "@/lib/money";
import { Users } from "lucide-react";

export default function CategoryComparisonTable({ categories, byUser }) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <Card className="p-5 overflow-x-auto">
      <div className="flex items-center gap-2 mb-4">
        <Users size={18} className="text-neutral-500" />
        <h3 className="font-semibold text-neutral-900">Qui a payé quoi</h3>
      </div>

      <table className="w-full min-w-[420px] text-sm">
        <thead>
          <tr className="text-left text-neutral-400">
            <th className="pb-2 font-medium">Catégorie</th>
            {byUser.map((u) => (
              <th key={u.id} className="pb-2 font-medium text-right">
                {u.name}
              </th>
            ))}
            <th className="pb-2 font-medium text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td className="py-2.5 flex items-center gap-2 font-medium text-neutral-700">
                <CategoryIcon name={cat.icon} size={14} className="text-neutral-400" />
                {cat.name}
              </td>
              {cat.byUser.map((u) => (
                <td key={u.id} className="py-2.5 text-right text-neutral-600">
                  {formatCurrency(u.total)}
                </td>
              ))}
              <td className="py-2.5 text-right font-semibold text-neutral-900">
                {formatCurrency(cat.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
