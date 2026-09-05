import Card from "@/components/ui/Card";
import { CategoryIcon } from "@/lib/icons";
import { formatCurrency } from "@/lib/money";
import { PieChart } from "lucide-react";

export default function CategoryBreakdown({ categories, total }) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <PieChart size={18} className="text-neutral-500" />
        <h3 className="font-semibold text-neutral-900">Dépenses par catégorie</h3>
      </div>

      <ul className="flex flex-col gap-3">
        {categories.map((cat) => {
          const percent = total > 0 ? Math.round((cat.total / total) * 100) : 0;
          return (
            <li key={cat.id}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center gap-2 font-medium text-neutral-700">
                  <CategoryIcon name={cat.icon} size={15} className="text-neutral-400" />
                  {cat.name}
                </span>
                <span className="font-semibold text-neutral-900">{formatCurrency(cat.total)}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-neutral-800"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-dashed border-neutral-200 pt-3 text-sm font-semibold text-neutral-900">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </Card>
  );
}
