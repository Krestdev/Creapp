import type { Quotation, QuotationElement, RequestModelT } from "@/types/types";

/** Écart (en %) au-delà duquel une offre est signalée (chip « Écarts > 10 % »). */
export const GAP_THRESHOLD = 10;

/** Offre d'un fournisseur pour une ligne de besoin. */
export type Offer = {
  quote: Quotation;
  elements: QuotationElement[];
  /** Total HT de la ligne : somme de prix unitaire × quantité. */
  total: number;
};

export const lineTotal = (el: QuotationElement) =>
  (el.priceProposed ?? 0) * (el.quantity ?? 0);

/** Offre d'un devis pour un besoin, ou `null` si le devis ne le couvre pas. */
export function buildOffer(quote: Quotation, besoinId: number): Offer | null {
  const elements = (quote.element ?? []).filter(
    (el) => el.requestModelId === besoinId,
  );
  if (elements.length === 0) return null;
  return {
    quote,
    elements,
    total: elements.reduce((sum, el) => sum + lineTotal(el), 0),
  };
}

/** Écart d'un total au moins cher, en % arrondi (0 si le moins cher est nul). */
export function gapPercent(total: number, cheapest: number) {
  if (cheapest <= 0) return 0;
  return Math.round(((total - cheapest) / cheapest) * 100);
}

/** Initiales d'un nom de fournisseur (2 lettres max). */
export function initials(name?: string) {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const letters =
    words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[1][0];
  return letters.toUpperCase();
}

export type ComparisonRow = {
  besoin: RequestModelT;
  index: number;
  offers: Map<number, Offer>;
  cheapest: number | null;
  /** Écart entre l'offre la plus chère et la moins chère, en %. */
  spread: number;
};

export function buildRows(
  besoins: RequestModelT[],
  quotations: Quotation[],
): ComparisonRow[] {
  return besoins.map((besoin, index) => {
    const offers = new Map<number, Offer>();
    for (const quote of quotations) {
      const offer = buildOffer(quote, besoin.id);
      if (offer) offers.set(quote.id, offer);
    }
    const totals = [...offers.values()].map((o) => o.total);
    const cheapest = totals.length ? Math.min(...totals) : null;
    const max = totals.length ? Math.max(...totals) : 0;
    return {
      besoin,
      index,
      offers,
      cheapest,
      spread: cheapest === null ? 0 : gapPercent(max, cheapest),
    };
  });
}

export type RetainedSummary = {
  /** Montant et nombre de lignes retenues, par devis. */
  perQuote: Map<number, { total: number; lines: number }>;
  total: number;
  lines: number;
  /** Nombre de devis ayant au moins une ligne retenue. */
  retainedQuotes: number;
};

/** Ce qui est retenu (un fournisseur par besoin) et ce que cela engage. */
export function summarizeRetained(
  rows: ComparisonRow[],
  quotations: Quotation[],
  selected: Record<number, number>,
): RetainedSummary {
  const perQuote = new Map<number, { total: number; lines: number }>();
  let total = 0;
  let lines = 0;
  for (const row of rows) {
    const providerId = selected[row.besoin.id];
    if (providerId === undefined) continue;
    const quote = quotations.find((q) => q.providerId === providerId);
    const offer = quote && row.offers.get(quote.id);
    if (!quote || !offer) continue;
    const current = perQuote.get(quote.id) ?? { total: 0, lines: 0 };
    perQuote.set(quote.id, {
      total: current.total + offer.total,
      lines: current.lines + 1,
    });
    total += offer.total;
    lines += 1;
  }
  return { perQuote, total, lines, retainedQuotes: perQuote.size };
}
