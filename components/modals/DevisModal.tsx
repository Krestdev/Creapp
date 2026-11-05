"use client";
import { UserAvatar } from "@/components/ds/user-avatar";
import {
  ViewDrawer,
  ViewField,
  ViewFile,
  ViewGrid,
} from "@/components/ds/view-drawer";
import { formatNumber } from "@/lib/format";
import { cn, getQuotationAmount, XAF } from "@/lib/utils";
import { Provider, Quotation, User } from "@/types/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Quotation;
  title: string | undefined;
  users: Array<User>;
  providers: Array<Provider>;
}

/** Colonnes de la table des éléments (Figma · Devis (voir)). */
const COLS = {
  qty: "w-8 text-right",
  price: "w-[84px] text-right",
  reduction: "w-12 text-right",
  tva: "w-[60px] text-right",
  total: "w-24 text-right",
};

const rate = (value: number) => `${String(value).replace(".", ",")} %`;

export function DevisModal({
  open,
  onOpenChange,
  data,
  title,
  users,
  providers,
}: DetailModalProps) {
  const totalAmount = getQuotationAmount(data, providers);
  const provider = providers.find((p) => p.id === data.providerId);
  const author = users.find((u) => u.id === data.userId);
  const authorName = author
    ? `${author.firstName} ${author.lastName}`
    : "Non spécifié";

  const formatDate = (value?: string | Date, withTime = true) => {
    if (!value) return "Non spécifié";
    try {
      return format(
        new Date(value),
        withTime ? "dd MMMM yyyy à HH:mm" : "dd MMMM yyyy",
        { locale: fr },
      );
    } catch {
      return "Date invalide";
    }
  };

  // IS/IR : 2,2 % pour un fournisseur au réel, 5,5 % sinon.
  const isIrRate = provider ? (provider.regem === "Réel" ? 2.2 : 5.5) : 0;

  const lines = (data.element ?? []).map((el) => {
    const base = el.priceProposed * el.quantity;
    const reduction = (base * (el.reduction ?? 0)) / 100;
    const ht = base - reduction;
    return {
      el,
      base,
      reduction,
      ht,
      tva: (ht * (el.tva ?? 0)) / 100,
      isIr: el.hasIs ? (ht * isIrRate) / 100 : 0,
    };
  });
  const totals = lines.reduce(
    (acc, l) => ({
      reduction: acc.reduction + l.reduction,
      ht: acc.ht + l.ht,
      tva: acc.tva + l.tva,
      isIr: acc.isIr + l.isIr,
    }),
    { reduction: 0, ht: 0, tva: 0, isIr: 0 },
  );
  const ttc = totals.ht + totals.tva;
  const net = ttc - totals.isIr;
  const needs = new Set(lines.map((l) => l.el.requestModelId)).size;

  const proofs =
    data.proof && typeof data.proof === "string"
      ? data.proof.split(";").filter((x) => !!x)
      : [];

  return (
    <ViewDrawer
      open={open}
      onOpenChange={onOpenChange}
      eyebrow="Devis"
      title={title || "Sans titre"}
      description="Consultez les informations associées au devis"
      footerInfo={`${needs} besoin${needs > 1 ? "s" : ""} · ${lines.length} élément${lines.length > 1 ? "s" : ""}`}
    >
      <ViewGrid>
        <ViewField label="Référence">
          <p className="text-body-medium text-text-link">{data.ref ?? "N/A"}</p>
        </ViewField>
        <ViewField label="Montant total">
          <p className="font-semibold">{XAF.format(totalAmount)}</p>
        </ViewField>
        <ViewField label="Fournisseur">
          <p className="font-semibold">{provider?.name ?? "Non spécifié"}</p>
        </ViewField>
        <ViewField label="Date limite de validité">
          <p className="font-semibold">{formatDate(data.dueDate, false)}</p>
        </ViewField>
        <ViewField label="Créé le">
          <p className="font-semibold">{formatDate(data.createdAt)}</p>
        </ViewField>
        <ViewField label="Modifié le">
          <p className="font-semibold">{formatDate(data.updatedAt)}</p>
        </ViewField>
        <ViewField label="Initié par">
          <div className="flex items-center gap-1.5">
            <UserAvatar name={authorName} size="sm" />
            <p className="font-semibold">{authorName}</p>
          </div>
        </ViewField>
      </ViewGrid>

      {/* Éléments */}
      <div className="overflow-hidden rounded-[10px] border border-border-default">
        <div className="flex items-center gap-2 bg-surface-muted px-3 py-2 text-overline text-text-tertiary uppercase">
          <span className="min-w-0 flex-1">{"Élément"}</span>
          <span className={COLS.qty}>{"Qté"}</span>
          <span className={COLS.price}>{"PU HT"}</span>
          <span className={COLS.reduction}>{"Réduc."}</span>
          <span className={COLS.tva}>{"TVA"}</span>
          <span className={COLS.total}>{"Total HT"}</span>
        </div>
        {lines.length === 0 && (
          <p className="border-t border-border-default px-3 py-4 text-body text-text-secondary">
            {"Aucun élément"}
          </p>
        )}
        {lines.map(({ el, ht }, index) => (
          <div
            key={el.id ?? index}
            className={cn(
              "flex items-center gap-2 border-t border-border-default px-3 py-[11px]",
              el.status === "SELECTED" && "bg-status-success-bg",
              (el.status === "REJECTED" || el.status === "DISCARDED") &&
                "bg-status-danger-bg",
            )}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
              <p className="truncate text-caption text-text-secondary">
                {data.commandRequest?.besoins?.find((b) => b.id === el.requestModelId)
                  ?.ref ?? "—"}
              </p>
              <p className="text-body-medium text-text-primary">
                {el.title ?? el.request?.label ?? "N/A"}
              </p>
            </div>
            <span className={cn("text-body", COLS.qty)}>{el.quantity}</span>
            <span className={cn("text-body", COLS.price)}>
              {formatNumber(el.priceProposed ?? 0)}
            </span>
            <span className={cn("text-body", COLS.reduction)}>
              {el.reduction ? rate(el.reduction) : "—"}
            </span>
            <span className={cn("text-body", COLS.tva)}>
              {rate(el.tva ?? 0)}
            </span>
            <span className={cn("text-body", COLS.total)}>
              {formatNumber(ht)}
            </span>
          </div>
        ))}
      </div>

      {/* Totaux */}
      <div className="flex flex-col items-end gap-3 text-body">
        {totals.reduction > 0 && (
          <TotalRow label="Total réductions" value={`− ${formatNumber(totals.reduction)} XAF`} />
        )}
        <TotalRow label="Total HT" value={`${formatNumber(totals.ht)} XAF`} />
        <TotalRow label="TVA" value={`${formatNumber(totals.tva)} XAF`} />
        <TotalRow label="Total TTC" value={`${formatNumber(ttc)} XAF`} />
        {totals.isIr > 0 && (
          <TotalRow
            label={`IS/IR retenu à la source (${rate(isIrRate)})`}
            value={`− ${formatNumber(totals.isIr)} XAF`}
          />
        )}
        <div className="flex w-full max-w-[380px] gap-4 rounded-lg bg-surface-muted px-3 py-2 text-body-strong text-text-primary">
          <span className="min-w-0 flex-1">{"Net à payer au fournisseur"}</span>
          <span className="whitespace-nowrap">{`${formatNumber(net)} XAF`}</span>
        </div>
      </div>

      {/* Pièce jointe */}
      <ViewField label="Pièce jointe" wide>
        {proofs.length > 0 ? (
          <div className="flex flex-col gap-2">
            {proofs.map((proof, index) => {
              const name = proof.split("/").pop() ?? proof;
              const ext = name.includes(".")
                ? name.split(".").pop()?.toUpperCase()
                : undefined;
              return (
                <ViewFile
                  key={index}
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

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full max-w-[380px] gap-4 px-3">
      <span className="min-w-0 flex-1 text-text-secondary">{label}</span>
      <span className="whitespace-nowrap text-body-medium text-text-primary">
        {value}
      </span>
    </div>
  );
}
