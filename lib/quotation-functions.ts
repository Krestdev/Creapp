import {
  CommandRequestT,
  Provider,
  Quotation,
  QuotationGroup,
  QuotationGroupStatus,
} from "@/types/types";

// Un besoin est considéré annulé quand toutes ses lignes de devis (dans tous
// les devis du groupe) ont un statut définitif négatif ("DISCARDED" ou "REJECTED").
export const isBesoinFullyDiscarded = (
  besoinId: number,
  quotations: Quotation[],
): boolean => {
  const elements = quotations
    .flatMap((q) => q.element ?? [])
    .filter((el) => el.requestModelId === besoinId);
  return (
    elements.length > 0 &&
    elements.every(
      (el) => el.status === "DISCARDED" || el.status === "REJECTED",
    )
  );
};

export const computeQuotationGroupStatus = (
  quotations: Quotation[],
  besoins: CommandRequestT["besoins"] = [],
): QuotationGroupStatus => {
  // Si tous les besoins de la demande ont été annulés, le groupe est annulé.
  if (
    besoins.length > 0 &&
    besoins.every((b) => isBesoinFullyDiscarded(b.id, quotations))
  ) {
    return "CANCELLED";
  }

  // Si aucun devis => pas traité (logique “liste”)
  if (!quotations.length) return "NOT_PROCESSED";

  const allInitial = quotations.every(
    (q) => q.status === "PENDING" || q.status === "SUBMITTED" && q.element.every(e=> e.status !== "SELECTED"),
  ) ;
  if (allInitial) return "NOT_PROCESSED";

  const allFinal = quotations.every(
    (q) => q.status === "APPROVED" || q.status === "REJECTED",
  );
  if (allFinal) return "PROCESSED";

  return "IN_PROGRESS";
};

export const groupQuotationsByCommandRequest = (
  commandRequests: CommandRequestT[],
  quotations: Quotation[],
  providers: Provider[],
): QuotationGroup[] => {
  const providerMap = new Map<number, Provider>(
    providers.map((p) => [p.id, p]),
  );

  return commandRequests
    .map((cr): QuotationGroup | null => {
      const requestQuotations = quotations.filter(
        (q) => q.commandRequestId === cr.id,
      );

      // Si tu veux afficher aussi les demandes sans devis, remplace par un group vide.
      if (!requestQuotations.length) return null;

      // Providers uniques (sans doublons)
      const providerIds = Array.from(
        new Set(requestQuotations.map((q) => q.providerId)),
      );

      const groupProviders = providerIds
        .map((id) => providerMap.get(id))
        .filter((p): p is Provider => !!p);
      const maxDate = requestQuotations.reduce((max, q) => {
        return new Date(q.createdAt).getTime() > max.getTime()
          ? new Date(q.createdAt)
          : max;
      }, new Date(cr.createdAt));

      return {
        commandRequest: cr,
        quotations: requestQuotations,
        providers: groupProviders,
        status: computeQuotationGroupStatus(requestQuotations, cr.besoins),
        createdAt: maxDate,
      };
    })
    .filter((g): g is QuotationGroup => g !== null)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};
