"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonthLabel } from "@/lib/dates";

export default function MonthNav({ month, onPrevious, onNext }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onPrevious}
        aria-label="Mois précédent"
        className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="min-w-[9rem] text-center text-sm font-semibold capitalize text-neutral-800">
        {formatMonthLabel(month)}
      </span>
      <button
        onClick={onNext}
        aria-label="Mois suivant"
        className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
