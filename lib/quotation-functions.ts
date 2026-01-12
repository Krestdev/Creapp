import {
  CommandRequestT,
  Provider,
  Quotation,
  QuotationGroup,
  QuotationGroupStatus,
} from "@/types/types";

export const computeQuotationGroupStatus = (
  quotations: Quotation[]
): QuotationGroupStatus => {
  // Si aucun devis => pas traité (logique “liste”)
  if (!quotations.length) return "NOT_PROCESSED";

  const allInitial = quotations.every(
    (q) => q.status === "PENDING" || q.status === "SUBMITTED"
  );
  if (allInitial) return "NOT_PROCESSED";

  const allFinal = quotations.every(
    (q) => q.status === "APPROVED" || q.status === "REJECTED"
  );
  if (allFinal) return "PROCESSED";

  return "IN_PROGRESS";
};

export const groupQuotationsByCommandRequest = (
  commandRequests: CommandRequestT[],
  quotations: Quotation[],
  providers: Provider[]
): QuotationGroup[] => {
  const providerMap = new Map<number, Provider>(
    providers.map((p) => [p.id, p])
  );

  return commandRequests
    .map((cr): QuotationGroup | null => {
      const requestQuotations = quotations.filter(
        (q) => q.commandRequestId === cr.id
      );

      // Si tu veux afficher aussi les demandes sans devis, remplace par un group vide.
      if (!requestQuotations.length) return null;

      // Providers uniques (sans doublons)
      const providerIds = Array.from(
        new Set(requestQuotations.map((q) => q.providerId))
      );

      const groupProviders = providerIds
        .map((id) => providerMap.get(id))
        .filter((p): p is Provider => !!p);

      return {
        commandRequest: cr,
        quotations: requestQuotations,
        providers: groupProviders,
        status: computeQuotationGroupStatus(requestQuotations),
        createdAt: cr.createdAt,
      };
    })
    .filter((g): g is QuotationGroup => g !== null);
};
