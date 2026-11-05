import { cn } from "@/lib/utils";
import { REQUEST_STATUS, RequestModelT, RequestType } from "@/types/types";

/**
 * Éléments visuels communs aux listes de besoins (« Tous les besoins » et
 * « Mes besoins », Figma · Besoins) : pastille de type, pastille de statut et
 * teinte de ligne.
 */

const PILL =
  "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-label font-semibold whitespace-nowrap";

/** Longueur maximale du libellé de type dans la pastille (ellipse comprise). */
const TYPE_LABEL_MAX = 24;

/** Un ton par type de besoin. */
const TYPE_TONES: Record<string, string> = {
  achat: "border-status-info-border bg-status-info-bg text-status-info-fg",
  transport:
    "border-status-review-border bg-status-review-bg text-status-review-fg",
  gas: "border-status-review-border bg-status-review-bg text-status-review-fg",
  settle:
    "border-status-warning-border bg-status-warning-bg text-status-warning-fg",
  taxes:
    "border-status-warning-border bg-status-warning-bg text-status-warning-fg",
  appro: "border-status-info-border bg-status-info-bg text-status-info-fg",
  facilitation:
    "border-status-success-border bg-status-success-bg text-status-success-fg",
  ressource_humaine:
    "border-status-info-border bg-status-info-bg text-status-info-fg",
  speciaux:
    "border-status-review-border bg-status-review-bg text-status-review-fg",
  others:
    "border-status-neutral-border bg-status-neutral-bg text-status-neutral-fg",
};

/** Statut : pastille + teinte de la ligne (les besoins annulés n'ont pas de teinte). */
const STATUS_STYLES: Record<string, { pill: string; row: string }> = {
  pending: {
    pill: "border-status-warning-border bg-status-warning-bg text-status-warning-fg",
    row: "bg-accent-yellow-bg hover:bg-accent-yellow-bg hover:brightness-[0.98]",
  },
  validated: {
    pill: "border-status-success-border bg-status-success-bg text-status-success-fg",
    row: "bg-status-success-bg hover:bg-status-success-bg hover:brightness-[0.98]",
  },
  rejected: {
    pill: "border-status-danger-border bg-status-danger-bg text-status-danger-fg",
    row: "bg-status-danger-bg hover:bg-status-danger-bg hover:brightness-[0.98]",
  },
  store: {
    pill: "border-status-info-border bg-status-info-bg text-status-info-fg",
    row: "bg-status-info-bg hover:bg-status-info-bg hover:brightness-[0.98]",
  },
  cancel: {
    pill: "border-status-neutral-border bg-status-neutral-bg text-status-neutral-fg",
    row: "",
  },
  DISCARDED: {
    pill: "border-status-neutral-border bg-status-neutral-bg text-status-neutral-fg",
    row: "",
  },
};

export const requestRowClass = (state: RequestModelT["state"]) =>
  STATUS_STYLES[state]?.row ?? "";

export const requestStatusLabel = (state: RequestModelT["state"]) =>
  state === "DISCARDED"
    ? "Annulé"
    : (REQUEST_STATUS.find((s) => s.value === state)?.name ?? state);

export function RequestStatusPill({ state }: { state: RequestModelT["state"] }) {
  return (
    <span className={cn(PILL, STATUS_STYLES[state]?.pill)}>
      {requestStatusLabel(state)}
    </span>
  );
}

export function RequestTypePill({
  type,
  requestTypes,
}: {
  type: RequestModelT["type"];
  requestTypes: Array<RequestType>;
}) {
  const label = requestTypes.find((t) => t.type === type)?.label ?? type;
  const short =
    label.length > TYPE_LABEL_MAX
      ? `${label.slice(0, TYPE_LABEL_MAX - 1).trimEnd()}…`
      : label;
  return (
    <span
      title={label}
      className={cn(PILL, "uppercase", TYPE_TONES[type] ?? TYPE_TONES.others)}
    >
      {short}
    </span>
  );
}

/** Colonne « Besoin » : référence en bordeaux, titre dessous, repère optionnel. */
export function RequestCell({
  reference,
  label,
  marker,
}: {
  reference: string;
  label: string;
  marker?: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-caption text-brand">{reference}</span>
      <span className="flex items-center gap-1.5 text-body-medium text-text-primary">
        {marker}
        {label}
      </span>
    </div>
  );
}

/** Classes de la colonne « Besoin » : large, elle porte le titre sur deux lignes. */
export const REQUEST_COLUMN_CLASS = "w-[34%] min-w-[300px]";
