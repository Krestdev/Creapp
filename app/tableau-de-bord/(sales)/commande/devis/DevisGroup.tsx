"use client";

import {
  ViewDrawer,
  ViewField,
  ViewFile,
  ViewGrid,
} from "@/components/ds/view-drawer";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { cn, getQuotationAmount } from "@/lib/utils";
import { QuotationGroup, QuotationGroupStatus } from "@/types/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface DetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devis: QuotationGroup | null;
}

const STATUS_PILL: Record<QuotationGroupStatus, { label: string; pill: string }> =
  {
    NOT_PROCESSED: {
      label: "Non traité",
      pill: "border-status-warning-border bg-status-warning-bg text-status-warning-fg",
    },
    IN_PROGRESS: {
      label: "En cours",
      pill: "border-status-info-border bg-status-info-bg text-status-info-fg",
    },
    PROCESSED: {
      label: "Traité",
      pill: "border-status-success-border bg-status-success-bg text-status-success-fg",
    },
    CANCELLED: {
      label: "Annulé",
      pill: "border-status-neutral-border bg-status-neutral-bg text-status-neutral-fg",
    },
  };

/** Libellé et pastille du statut d'une demande de cotation (liste et tiroir). */
export const getGroupStatusLabel = (status: QuotationGroupStatus) =>
  STATUS_PILL[status] ?? { label: "Inconnu", pill: STATUS_PILL.CANCELLED.pill };

/** Colonnes de la table des éléments (Figma · Approbation devis - voir). */
const QTY_COL = "w-24 text-right";

const formatDate = (value?: string | Date, withTime = false) => {
  if (!value) return "Non spécifié";
  try {
    return format(
      new Date(value),
      withTime ? "dd MMMM yyyy 'à' HH:mm" : "dd MMMM yyyy",
      { locale: fr },
    );
  } catch {
    return "Date invalide";
  }
};

export function DevisGroup({ open, onOpenChange, devis }: DetailModalProps) {
  const router = useRouter();
  if (!devis) return null;

  const { commandRequest, providers, quotations } = devis;
  const status = getGroupStatusLabel(devis.status);
  const closed = devis.status === "PROCESSED" || devis.status === "CANCELLED";
  const besoins = commandRequest.besoins ?? [];

  // Montant proposé par chaque fournisseur (devis annulés ou rejetés exclus).
  const providerTotals = providers.map((provider) => {
    const total = quotations
      .filter(
        (q) =>
          q.providerId === provider.id &&
          q.status !== "CANCELLED" &&
          q.status !== "REJECTED",
      )
      .reduce((sum, q) => sum + getQuotationAmount(q, providers), 0);
    return { provider, total: Math.round(total) };
  });

  const proofs = quotations.flatMap((q) =>
    typeof q.proof === "string"
      ? q.proof
          .split(";")
          .filter((x) => !!x)
          .map((proof) => ({ proof, id: q.id }))
      : [],
  );

  return (
    <ViewDrawer
      open={open}
      onOpenChange={onOpenChange}
      eyebrow="Devis à comparer"
      title={commandRequest.title || "Sans titre"}
      description="Consultez les informations associées aux devis"
      primaryAction={
        !closed && (
          <Button
            onClick={() => router.push(`./valider/${commandRequest.id}`)}
          >
            {"Comparer"}
          </Button>
        )
      }
    >
      <ViewGrid>
        <ViewField label="Référence">
          <p className="text-body-medium text-text-link">
            {commandRequest.reference}
          </p>
        </ViewField>
        <ViewField label="Statut">
          <span
            className={cn(
              "inline-flex w-fit items-center rounded-full border px-2 py-1 text-label font-semibold whitespace-nowrap",
              status.pill,
            )}
          >
            {status.label}
          </span>
        </ViewField>
        <ViewField label="Date limite">
          <p className="font-semibold">{formatDate(commandRequest.dueDate)}</p>
        </ViewField>
        <ViewField label="Créé le">
          <p className="font-semibold">
            {formatDate(commandRequest.createdAt, true)}
          </p>
        </ViewField>
        <ViewField label="Modifié le">
          <p className="font-semibold">
            {formatDate(
              commandRequest.updatedAt ?? commandRequest.createdAt,
              true,
            )}
          </p>
        </ViewField>
      </ViewGrid>

      {/* Éléments */}
      <ViewField label="Éléments" wide>
        <div className="overflow-hidden rounded-[10px] border border-border-default">
          <div className="flex items-center gap-2 bg-surface-muted px-3 py-2 text-overline text-text-tertiary uppercase">
            <span className="min-w-0 flex-1">{"Besoins"}</span>
            <span className="min-w-0 flex-1">{"Description"}</span>
            <span className={QTY_COL}>{"Quantité"}</span>
          </div>
          {besoins.length === 0 && (
            <p className="border-t border-border-default px-3 py-4 text-body text-text-secondary">
              {"Aucun élément"}
            </p>
          )}
          {besoins.map((besoin) => (
            <div
              key={besoin.id}
              className="flex items-center gap-2 border-t border-border-default px-3 py-[11px]"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <p className="truncate text-caption text-text-secondary">
                  {besoin.ref}
                </p>
                <p className="text-body-medium text-text-primary">
                  {besoin.label}
                </p>
              </div>
              <p className="min-w-0 flex-1 text-body text-text-primary">
                {besoin.description || "—"}
              </p>
              <p className={cn("text-body text-text-primary", QTY_COL)}>
                {`${besoin.quantity} ${besoin.unit ?? ""}`.trim()}
              </p>
            </div>
          ))}
        </div>
      </ViewField>

      {/* Fournisseurs */}
      <ViewField label="Fournisseurs" wide>
        {providerTotals.length === 0 && (
          <p className="italic">{"Aucun fournisseur"}</p>
        )}
        {providerTotals.map(({ provider, total }) => (
          <div key={provider.id} className="flex items-start gap-1.5 py-1">
            <span className="text-body-medium whitespace-nowrap text-text-primary">
              {provider.name}
            </span>
            {total > 0 && (
              <span className="min-w-0 flex-1 text-body text-brand">
                {`${formatNumber(total)} FCFA`}
              </span>
            )}
          </div>
        ))}
      </ViewField>

      {/* Pièces jointes */}
      <ViewField label="Pièces jointes" wide>
        {proofs.length > 0 ? (
          <div className="flex flex-col gap-2">
            {proofs.map(({ proof, id }, index) => {
              const name = proof.split("/").pop() ?? proof;
              const ext = name.includes(".")
                ? name.split(".").pop()?.toUpperCase()
                : undefined;
              return (
                <ViewFile
                  key={`${id}-${index}`}
                  name={name}
                  meta={ext}
                  href={`${process.env.NEXT_PUBLIC_API}/${proof}`}
                />
              );
            })}
          </div>
        ) : (
          <p className="italic">{"Aucune pièce jointe"}</p>
        )}
      </ViewField>
    </ViewDrawer>
  );
}
