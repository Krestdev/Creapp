"use client";

import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { Check } from "lucide-react";

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;

/**
 * Barre de décision (Figma · Decision bar) : montant engagé par la répartition
 * retenue et action principale. Reste visible en bas de page.
 */
export function DecisionBar({
  total,
  lines,
  retainedQuotes,
  notRetainedQuotes,
  disabled,
  isPending,
  onSubmit,
}: {
  total: number;
  lines: number;
  retainedQuotes: number;
  notRetainedQuotes: number;
  disabled?: boolean;
  isPending?: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="sticky bottom-4 z-20 flex flex-wrap items-center gap-3 rounded-xl border-2 border-brand bg-surface px-5 py-3.5">
      <div className="flex min-w-full flex-col gap-0.5 sm:min-w-0 sm:flex-1">
        <p className="text-title text-text-primary">
          {`Montant engagé : ${formatMoney(total)}`}
        </p>
        <p className="text-caption text-text-tertiary">
          {lines === 0
            ? "Aucune ligne retenue"
            : `${plural(retainedQuotes, "devis retenu")} (${plural(lines, "ligne")})${
                notRetainedQuotes > 0
                  ? ` · ${plural(notRetainedQuotes, "fournisseur")} non retenu${notRetainedQuotes > 1 ? "s" : ""}`
                  : ""
              }`}
        </p>
      </div>
      <Button
        type="button"
        className="w-full sm:w-auto"
        onClick={onSubmit}
        disabled={disabled || isPending}
        isLoading={isPending}
      >
        <Check />
        {"Approuver la répartition"}
      </Button>
    </div>
  );
}
