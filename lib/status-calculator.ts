import type {
  BonsCommande,
  PaymentRequest,
  RequestModelT,
  CommandRequestT,
  Quotation,
} from "@/types/types";

export type GlobalStatus =
  | "En validation"
  | "Validés"
  | "Rejetés"
  | "Déstockés"
  | "En cotation"
  | "En att. dévis"
  | "En att. BC"
  | "En BC"
  | "En att. paiement"
  | "Payé"
  | "Paiement annulé"

export const GLOBAL_STATUS_ORDER: GlobalStatus[] = [
  "En validation",
  "Validés",
  "Rejetés",
  "Déstockés",
  "En cotation",
  "En att. dévis",
  "En att. BC",
  "En BC",
  "En att. paiement",
  "Payé",
  "Paiement annulé",
];

export function findLinkedTicket(
  requestId: number,
  tickets: PaymentRequest[],
): PaymentRequest | undefined {
  if (!tickets) return undefined;
  const linked = tickets.filter((t) => t.requestId === requestId);
  if (linked.length === 0) return undefined;
  const activeLinked = linked.filter(
    (t) => t.status !== "rejected" && t.status !== "cancelled"
  );
  const pool = activeLinked.length > 0 ? activeLinked : linked;
  return pool.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];
}

export function findLinkedBC(
  requestId: number,
  bonCommandes: BonsCommande[],
): BonsCommande | undefined {
  if (!bonCommandes) return undefined;
  const linked = bonCommandes.filter((bc) =>
    bc.devi?.element?.some((el: any) => el.requestModelId === requestId),
  );
  if (linked.length === 0) return undefined;
  const activeLinked = linked.filter(
    (bc) => bc.status !== "REJECTED" && (bc.status as string) !== "CANCELLED"
  );
  const pool = activeLinked.length > 0 ? activeLinked : linked;
  return pool.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];
}

export function findLinkedQuotation(
  requestId: number,
  quotations: any[],
): any | undefined {
  if (!quotations) return undefined;
  const linked = quotations.filter((q) =>
    q.element?.some((el: any) => el.requestModelId === requestId)
  );
  return linked.length > 0 ? linked[0] : undefined;
}

export function findLinkedCommandRequest(
  requestId: number,
  commandRequests: CommandRequestT[],
): CommandRequestT | undefined {
  if (!commandRequests) return undefined;
  const linked = commandRequests.filter((cr) =>
    cr.besoins?.some((req: any) => req.id === requestId)
  );
  return linked.length > 0 ? linked[0] : undefined;
}

export function getGlobalStatus(
  request: RequestModelT,
  ticket?: PaymentRequest,
  bc?: BonsCommande,
  quotation?: Quotation,
  commandRequest?: CommandRequestT,
): GlobalStatus | undefined {
  // Statuts finaux
  if (request.state === "rejected") return "Rejetés";
  if (request.state === "store") return "Déstockés";

  // Vérifier l'état du ticket s'il existe (pour les types NON achat en général)
  if (ticket && request.type !== "achat") {
    if (ticket.status === "paid") return "Payé";
    if (ticket.status === "cancelled") return "Paiement annulé";
    if (ticket.status === "accepted") return "En att. paiement";
    if (ticket.status === "rejected") return "Rejetés";

    // Si le ticket existe mais son état est intermédiaire
    return "En att. paiement";
  }

  // Pas encore validé
  if (request.state === "pending") {
    return "En validation";
  }

  // Validé
  if (request.state === "validated") {
    if (request.type === "achat") {
      if (bc) {
        if (bc.status === "PAID") return "Payé";
        if (bc.status === "APPROVED") {
          return "En BC";
        }
        return "En att. BC";
      } else if (quotation) {
        // On a un devis mais pas encore de BC
        return "En att. BC";
      } else if (commandRequest) {
        // On a une demande de cotation mais pas encore de devis
        return "En att. dévis";
      } else {
        // Validé mais pas encore de demande de cotation
        return "Validés";
      }
    } else {
      // Facilitation, Transport, RH, etc.
      return "Validés";
    }
  }
}
