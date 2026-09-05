"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { currentMonthKey, isValidMonthKey, shiftMonthKey } from "@/lib/dates";

/**
 * Gère le mois sélectionné via le paramètre d'URL `?month=YYYY-MM`, afin
 * qu'il reste synchronisé entre le Dashboard et la page Dépenses, et qu'il
 * survive à un rechargement de page.
 */
export function useMonthParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const month = useMemo(() => {
    const raw = searchParams.get("month");
    return isValidMonthKey(raw) ? raw : currentMonthKey();
  }, [searchParams]);

  const setMonth = useCallback(
    (newMonth) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("month", newMonth);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const goToPreviousMonth = useCallback(() => setMonth(shiftMonthKey(month, -1)), [month, setMonth]);
  const goToNextMonth = useCallback(() => setMonth(shiftMonthKey(month, 1)), [month, setMonth]);

  return { month, setMonth, goToPreviousMonth, goToNextMonth };
}
