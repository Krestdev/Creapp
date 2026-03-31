import type {
  BonsCommande,
  PaymentRequest,
  Reception,
  RequestModelT,
} from "@/types/types";
import type { StepItem } from "@/components/stepper";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StepStatus = "done" | "active" | "error";

export interface StepDef extends StepItem {
  /** Surcharge de l'état : "error" affiche une croix rouge */
  status?: StepStatus;
}

export interface RequestStepperData {
  steps: StepDef[];
  /** Index (0-based) de l'étape active — passé directement au Stepper */
  currentStep: number;
}

// ─── Constantes de statuts ───────────────────────────────────────────────────

const TICKET_ADVANCED_STATUSES = new Set([
  "validated",
  "paid",
  "simple_signed",
  "signed",
  "unsigned",
]);

const TICKET_TRESORERIE_STATUSES = new Set([
  "simple_signed",
  "signed",
  "unsigned",
  "paid",
]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Ticket de paiement lié à ce besoin (le plus récent si plusieurs) */
function findLinkedTicket(
  requestId: number,
  tickets: PaymentRequest[],
): PaymentRequest | undefined {
  return tickets
    .filter((t) => t.requestId === requestId)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )[0];
}

/** Bon de commande lié à ce besoin via ses devis/éléments */
function findLinkedBC(
  requestId: number,
  bonCommandes: BonsCommande[],
): BonsCommande | undefined {
  return bonCommandes.find((bc) =>
    bc.devi?.element?.some((el) => el.requestModelId === requestId),
  );
}

/** Réception liée à un bon de commande */
function findLinkedReception(
  commandId: number,
  receptions: Reception[],
): Reception | undefined {
  return receptions.find((r) => r.CommandId === commandId);
}

// ─── Circuits ─────────────────────────────────────────────────────────────────

/**
 * Circuit A — Facilitation / Ressources Humaines
 * Étapes : Validation → DG → Trésorerie → Payé
 */
function circuitFacilitationRH(
  request: RequestModelT,
  ticket: PaymentRequest | undefined,
): RequestStepperData {
  const isTerminated =
    request.state === "rejected" || request.state === "cancel";

  // ── Étape 1 : Validation ──────────────────────────────────────────────────
  const step1Done = request.state === "validated" || request.state === "store";
  const step1Error = isTerminated;

  // ── Étape 2 : DG ─────────────────────────────────────────────────────────
  const step2Done =
    step1Done &&
    !!ticket &&
    TICKET_ADVANCED_STATUSES.has(ticket.status) &&
    ticket.status !== "rejected";
  const step2Error = step1Done && !!ticket && ticket.status === "rejected";

  // ── Étape 3 : Trésorerie ─────────────────────────────────────────────────
  const step3Done =
    step2Done && !!ticket && TICKET_TRESORERIE_STATUSES.has(ticket.status);

  // ── Étape 4 : Payé ────────────────────────────────────────────────────────
  const step4Done = step3Done && ticket?.status === "paid";

  // ── Dérivation de currentStep ─────────────────────────────────────────────
  let currentStep = 0;
  if (step4Done)
    currentStep = 4; // tout terminé → après la dernière étape
  else if (step3Done) currentStep = 3;
  else if (step2Done) currentStep = 2;
  else if (step1Done) currentStep = 1;

  const steps: StepDef[] = [
    {
      label: "Validation",
      tooltip: "Approbation hiérarchique du besoin",
      status: step1Error ? "error" : step1Done ? "done" : undefined,
    },
    {
      label: "DG",
      tooltip: "Validation par la Direction Générale",
      status: step2Error ? "error" : step2Done ? "done" : undefined,
    },
    {
      label: "Trésorerie",
      tooltip: "Prise en charge par la trésorerie",
      status: step3Done ? "done" : undefined,
    },
    {
      label: "Payé",
      tooltip: "Paiement effectué",
      status: step4Done ? "done" : undefined,
    },
  ];

  return { steps, currentStep: Math.min(currentStep, steps.length - 1) };
}

/**
 * Circuit B — Others / Gas / Transport / Spéciaux
 * Étapes : Validation → Trésorerie → Payé
 */
function circuitSimple(
  request: RequestModelT,
  ticket: PaymentRequest | undefined,
): RequestStepperData {
  const isTerminated =
    request.state === "rejected" || request.state === "cancel";

  const step1Done = request.state === "validated" || request.state === "store";
  const step1Error = isTerminated;

  const step2Done =
    step1Done && !!ticket && TICKET_TRESORERIE_STATUSES.has(ticket.status);

  const step3Done = step2Done && ticket?.status === "paid";

  let currentStep = 0;
  if (step3Done) currentStep = 3;
  else if (step2Done) currentStep = 2;
  else if (step1Done) currentStep = 1;

  const steps: StepDef[] = [
    {
      label: "Validation",
      tooltip: "Approbation hiérarchique du besoin",
      status: step1Error ? "error" : step1Done ? "done" : undefined,
    },
    {
      label: "Trésorerie",
      tooltip: "Prise en charge par la trésorerie",
      status: step2Done ? "done" : undefined,
    },
    {
      label: "Payé",
      tooltip: "Paiement effectué",
      status: step3Done ? "done" : undefined,
    },
  ];

  return { steps, currentStep: Math.min(currentStep, steps.length - 1) };
}

/**
 * Circuit C — Achat
 * Étapes : Validation → Bon de commande → Livraison
 */
function circuitAchat(
  request: RequestModelT,
  bonCommande: BonsCommande | undefined,
  reception: Reception | undefined,
): RequestStepperData {
  const isTerminated =
    request.state === "rejected" || request.state === "cancel";

  const step1Done = request.state === "validated" || request.state === "store";
  const step1Error = isTerminated;

  // BC créé et approuvé
  const step2Done =
    step1Done && !!bonCommande && bonCommande.status === "APPROVED";

  // Livraison complète
  const step3Done = step2Done && reception?.Status === "COMPLETED";

  let currentStep = 0;
  if (step3Done) currentStep = 3;
  else if (step2Done) currentStep = 2;
  else if (step1Done) currentStep = 1;

  const steps: StepDef[] = [
    {
      label: "Validation",
      tooltip: "Approbation hiérarchique du besoin",
      status: step1Error ? "error" : step1Done ? "done" : undefined,
    },
    {
      label: "Bon de commande",
      tooltip: "Bon de commande approuvé fournisseur",
      status: step2Done ? "done" : undefined,
    },
    {
      label: "Livraison",
      tooltip: "Réception complète des articles",
      status: step3Done ? "done" : undefined,
    },
  ];

  return { steps, currentStep: Math.min(currentStep, steps.length - 1) };
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export interface UseRequestStepperOptions {
  request: RequestModelT;
  tickets?: PaymentRequest[];
  bonCommandes?: BonsCommande[];
  receptions?: Reception[];
}

/**
 * Dérive les étapes et l'étape courante depuis un besoin
 * et les données associées (tickets, bons de commande, réceptions).
 *
 * @example
 * const { steps, currentStep } = useRequestStepper({
 *   request,
 *   tickets,
 *   bonCommandes,
 *   receptions,
 * });
 *
 * <RequestStepper request={request} tickets={tickets} bonCommandes={bonCommandes} receptions={receptions} />
 */
export function useRequestStepper({
  request,
  tickets = [],
  bonCommandes = [],
  receptions = [],
}: UseRequestStepperOptions): RequestStepperData {
  const ticket = findLinkedTicket(request.id, tickets);

  switch (request.type) {
    case "facilitation":
    case "ressource_humaine":
      return circuitFacilitationRH(request, ticket);

    case "others":
    case "gas":
    case "transport":
    case "speciaux":
      return circuitSimple(request, ticket);

    case "achat": {
      const bc = findLinkedBC(request.id, bonCommandes);
      const reception = bc ? findLinkedReception(bc.id, receptions) : undefined;
      return circuitAchat(request, bc, reception);
    }

    // Types sans circuit défini (appro, CURRENT…) → circuit simple par défaut
    default:
      return circuitSimple(request, ticket);
  }
}
