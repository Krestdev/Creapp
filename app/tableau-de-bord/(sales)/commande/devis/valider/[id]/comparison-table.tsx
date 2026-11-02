"use client";

import { SelectField } from "@/components/ds/form-field";
import { StatusBadge } from "@/components/ds/status-badge";
import { Button } from "@/components/ui/button";
import { formatMoney, formatNumber } from "@/lib/format";
import { isBesoinFullyDiscarded } from "@/lib/quotation-functions";
import { cn, getUserName } from "@/lib/utils";
import type { Provider, Quotation, RequestModelT, User } from "@/types/types";
import { Info } from "lucide-react";
import React from "react";
import {
  buildRows,
  GAP_THRESHOLD,
  gapPercent,
  initials,
  summarizeRetained,
  type ComparisonRow,
  type Offer,
} from "./comparison";

type DisplayFilter = "all" | "undecided" | "retained";

const displayOptions = [
  { value: "all", label: "Toutes les lignes" },
  { value: "undecided", label: "Lignes à décider" },
  { value: "retained", label: "Lignes retenues" },
];

/** Pastille d'écart : « Moins cher », ou « +x % » (alerte au-delà du seuil). */
function GapBadge({ offer, row }: { offer: Offer; row: ComparisonRow }) {
  if (row.cheapest === null || row.offers.size < 2) return null;
  const isCheapest = offer.total === row.cheapest;
  if (isCheapest) {
    return (
      <span className="shrink-0 rounded-[10px] bg-status-success-bg px-2 py-0.5 text-caption whitespace-nowrap text-status-success-fg">
        {"Moins cher"}
      </span>
    );
  }
  const gap = gapPercent(offer.total, row.cheapest);
  return (
    <span
      className={cn(
        "shrink-0 rounded-[10px] px-2 py-0.5 text-caption whitespace-nowrap",
        gap > GAP_THRESHOLD
          ? "bg-status-warning-bg text-status-warning-fg"
          : "bg-status-neutral-bg text-status-neutral-fg",
      )}
    >
      {`+${gap} %`}
    </span>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full border px-3 py-1.5 text-label whitespace-nowrap transition-colors outline-none focus-visible:shadow-focus-ring",
        active
          ? "border-brand bg-brand-subtle text-brand"
          : "border-border-default bg-surface text-text-secondary hover:bg-hover",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Comparatif des devis par ligne de besoin (Figma · « Comparer les devis ») :
 * une ligne par besoin, une colonne par fournisseur. On retient, pour chaque
 * ligne, l'offre d'un seul fournisseur. Les lignes verrouillées (déjà en bon de
 * commande) ou annulées sont figées.
 */
export function ComparisonTable({
  besoins,
  quotations,
  providerMap,
  users,
  selected,
  lockedBesoinIds,
  usedQuotationIds,
  cancellingBesoinId,
  onToggle,
  onView,
  onCancel,
}: {
  besoins: RequestModelT[];
  quotations: Quotation[];
  providerMap: Map<number, Provider>;
  users: User[];
  selected: Record<number, number>;
  lockedBesoinIds: Set<number>;
  usedQuotationIds: Set<number>;
  /** Besoin dont l'annulation est en cours. */
  cancellingBesoinId?: number | null;
  onToggle: (besoinId: number, providerId: number) => void;
  onView: (besoin: RequestModelT) => void;
  onCancel: (besoin: RequestModelT) => void;
}) {
  const [besoinFilter, setBesoinFilter] = React.useState("all");
  const [displayFilter, setDisplayFilter] =
    React.useState<DisplayFilter>("all");
  const [onlyCheapest, setOnlyCheapest] = React.useState(false);
  const [onlyGaps, setOnlyGaps] = React.useState(false);

  const rows = React.useMemo(
    () => buildRows(besoins, quotations),
    [besoins, quotations],
  );
  const retained = React.useMemo(
    () => summarizeRetained(rows, quotations, selected),
    [rows, quotations, selected],
  );

  const isDiscarded = (row: ComparisonRow) =>
    isBesoinFullyDiscarded(row.besoin.id, quotations);
  const isLocked = (row: ComparisonRow) => lockedBesoinIds.has(row.besoin.id);

  const visibleRows = rows.filter((row) => {
    if (besoinFilter !== "all" && String(row.besoin.id) !== besoinFilter)
      return false;
    if (displayFilter === "retained" && selected[row.besoin.id] === undefined)
      return false;
    if (
      displayFilter === "undecided" &&
      (selected[row.besoin.id] !== undefined ||
        isLocked(row) ||
        isDiscarded(row))
    )
      return false;
    if (onlyGaps && row.spread <= GAP_THRESHOLD) return false;
    return true;
  });

  const activeFilters = [
    besoinFilter !== "all" &&
      `Besoin : ${besoins.find((b) => String(b.id) === besoinFilter)?.label ?? ""}`,
    displayFilter !== "all" &&
      displayOptions.find((o) => o.value === displayFilter)?.label,
    onlyCheapest && "Uniquement le moins cher",
    onlyGaps && `Écarts > ${GAP_THRESHOLD} %`,
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-3">
        <SelectField
          label="Besoin"
          className="w-full sm:w-50"
          value={besoinFilter}
          onValueChange={(value) => setBesoinFilter(value ?? "all")}
          options={[
            { value: "all", label: `Tous les besoins (${besoins.length})` },
            ...besoins.map((b) => ({ value: String(b.id), label: b.label })),
          ]}
        />
        <SelectField
          label="Afficher"
          className="w-full sm:w-45"
          value={displayFilter}
          onValueChange={(value) =>
            setDisplayFilter((value as DisplayFilter) ?? "all")
          }
          options={displayOptions}
        />
        <div className="flex flex-wrap items-center gap-2 sm:pb-1.5">
          <FilterChip
            active={onlyCheapest}
            onClick={() => setOnlyCheapest((v) => !v)}
          >
            {"Uniquement le moins cher"}
          </FilterChip>
          <FilterChip active={onlyGaps} onClick={() => setOnlyGaps((v) => !v)}>
            {`Écarts > ${GAP_THRESHOLD} %`}
          </FilterChip>
        </div>
      </div>

      <p className="flex items-center gap-2 text-caption text-text-tertiary">
        <Info aria-hidden className="size-[18px] shrink-0" />
        {`Filtre actif : ${activeFilters.length ? activeFilters.join(" · ") : "aucun"}. Astuce : filtrez sur un besoin pour ne voir que ses articles.`}
      </p>

      <div className="overflow-x-auto rounded-xl border border-border-default bg-surface">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            {"Comparaison des devis par ligne de besoin"}
          </caption>
          <thead>
            <tr className="bg-surface-muted align-top">
              <th
                scope="col"
                className="w-48 min-w-48 md:sticky md:left-0 md:z-10 md:w-85 md:min-w-60 bg-surface-muted px-4 py-3.5 text-left align-top"
              >
                <span className="block text-label text-text-primary">
                  {"Ligne de besoin du devis"}
                </span>
                <span className="mt-1 block text-caption font-normal text-text-tertiary">
                  {"Chaque ligne telle qu’elle figure dans les devis"}
                </span>
              </th>
              {quotations.map((quote) => {
                const provider = providerMap.get(quote.providerId);
                const covered = rows.filter((r) => r.offers.has(quote.id));
                const total = covered.reduce(
                  (sum, r) => sum + (r.offers.get(quote.id)?.total ?? 0),
                  0,
                );
                return (
                  <th
                    key={quote.id}
                    scope="col"
                    className="min-w-65 border-l border-border-default px-4 py-3.5 align-top font-normal"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border-default bg-surface text-caption text-text-secondary"
                      >
                        {initials(provider?.name)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-body-medium text-text-primary">
                        {provider?.name ?? "Fournisseur inconnu"}
                      </span>
                      {usedQuotationIds.has(quote.id) && (
                        <StatusBadge tone="neutral" size="sm">
                          {"BC émis"}
                        </StatusBadge>
                      )}
                    </span>
                    <span className="mt-1 block text-caption text-text-tertiary">
                      {`${quote.ref} · Enregistré par ${getUserName(users, quote.userId) ?? "N/A"}`}
                    </span>
                    <span className="mt-1 block text-caption text-text-secondary">
                      {`${formatMoney(total)} · ${covered.length}/${besoins.length} lignes`}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 && (
              <tr className="border-t border-border-default">
                <td
                  colSpan={quotations.length + 1}
                  className="px-4 py-10 text-center text-body text-text-tertiary"
                >
                  {"Aucune ligne ne correspond aux filtres."}
                </td>
              </tr>
            )}
            {visibleRows.map((row) => {
              const locked = isLocked(row);
              const discarded = isDiscarded(row);
              const frozen = locked || discarded;
              const noOffer = row.offers.size === 0;
              return (
                <tr
                  key={row.besoin.id}
                  className="border-t border-border-default align-top"
                >
                  <th
                    scope="row"
                    className="w-48 min-w-48 md:sticky md:left-0 md:z-10 md:w-85 md:min-w-60 bg-surface px-4 py-3.5 text-left align-top font-normal"
                  >
                    <div className="flex flex-col gap-3">
                      <p className="text-body-medium text-text-primary [overflow-wrap:anywhere]">
                        {row.besoin.label}
                      </p>
                      {(discarded || locked) && (
                        <div>
                          <StatusBadge
                            tone={discarded ? "neutral" : "warning"}
                            size="sm"
                          >
                            {discarded ? "Annulé" : "Verrouillé"}
                          </StatusBadge>
                        </div>
                      )}
                      {noOffer && !discarded && (
                        <p className="text-caption text-text-tertiary">
                          {"Aucun devis ne remplit ce besoin."}
                        </p>
                      )}
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onView(row.besoin)}
                        >
                          {"Voir"}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={
                            frozen || cancellingBesoinId === row.besoin.id
                          }
                          onClick={() => onCancel(row.besoin)}
                        >
                          {"Annuler"}
                        </Button>
                      </div>
                    </div>
                  </th>
                  {quotations.map((quote) => {
                    const offer = row.offers.get(quote.id);
                    if (!offer) {
                      return (
                        <td
                          key={quote.id}
                          className="border-l border-border-default px-4 py-3.5 align-top"
                        >
                          <p className="text-body text-text-tertiary">
                            {"Non proposé"}
                          </p>
                          <p className="text-caption text-text-tertiary">
                            {"Ligne absente du devis"}
                          </p>
                        </td>
                      );
                    }
                    const isSelected =
                      selected[row.besoin.id] === quote.providerId;
                    const disabled =
                      frozen || usedQuotationIds.has(quote.id);
                    const hiddenByFilter =
                      onlyCheapest &&
                      !isSelected &&
                      row.cheapest !== null &&
                      offer.total !== row.cheapest;
                    if (hiddenByFilter) {
                      return (
                        <td
                          key={quote.id}
                          className="border-l border-border-default px-4 py-3.5 align-top"
                        >
                          <p className="text-body text-text-tertiary">{"—"}</p>
                          <p className="text-caption text-text-tertiary">
                            {"Offre plus élevée"}
                          </p>
                        </td>
                      );
                    }
                    return (
                      <td
                        key={quote.id}
                        onClick={() => {
                          if (!disabled) onToggle(row.besoin.id, quote.providerId);
                        }}
                        className={cn(
                          "relative px-4 py-3.5 align-top",
                          !isSelected && "border-l border-border-default",
                          isSelected && "bg-brand-subtle",
                          !disabled && "cursor-pointer hover:bg-hover",
                          !disabled && isSelected && "hover:bg-brand-subtle",
                          disabled && !isSelected && "bg-surface-muted/50",
                        )}
                      >
                        {isSelected && (
                          <span
                            aria-hidden
                            className={cn(
                              "pointer-events-none absolute inset-0 border-[1.5px]",
                              disabled ? "border-border-strong" : "border-brand",
                            )}
                          />
                        )}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <p className="min-w-0 flex-1 text-title text-text-primary">
                              {formatNumber(offer.total)}
                            </p>
                            <GapBadge offer={offer} row={row} />
                          </div>
                          {offer.elements.map((el) => (
                            <div key={el.id} className="flex flex-col">
                              <p className="text-caption text-text-secondary [overflow-wrap:anywhere]">
                                {el.title}
                              </p>
                              <p className="text-caption text-text-tertiary">
                                {`${formatNumber(el.priceProposed ?? 0)} × ${el.quantity}`}
                              </p>
                            </div>
                          ))}
                          <button
                            type="button"
                            aria-pressed={isSelected}
                            disabled={disabled}
                            onClick={(event) => {
                              event.stopPropagation();
                              onToggle(row.besoin.id, quote.providerId);
                            }}
                            className={cn(
                              "mt-1.5 flex w-fit items-center gap-1.5 rounded-sm text-caption outline-none focus-visible:shadow-focus-ring disabled:cursor-not-allowed",
                              isSelected
                                ? disabled
                                  ? "text-text-secondary"
                                  : "text-brand"
                                : disabled
                                  ? "text-text-disabled"
                                  : "text-text-link",
                            )}
                          >
                            <span
                              aria-hidden
                              className={cn(
                                "size-4 shrink-0 rounded-full border-solid bg-surface",
                                isSelected
                                  ? disabled
                                    ? "border-5 border-neutral-400"
                                    : "border-5 border-brand"
                                  : "border-[1.5px] border-border-strong",
                              )}
                            />
                            {isSelected ? "Retenue" : "Retenir"}
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr className="border-t border-border-default bg-surface-muted align-top">
              <th
                scope="row"
                className="w-48 min-w-48 md:sticky md:left-0 md:z-10 md:w-85 md:min-w-60 bg-surface-muted px-4 py-3.5 text-left align-top"
              >
                <span className="text-label text-text-primary">
                  {"Retenu chez ce fournisseur"}
                </span>
              </th>
              {quotations.map((quote) => {
                const summary = retained.perQuote.get(quote.id);
                return (
                  <td
                    key={quote.id}
                    className="border-l border-border-default px-4 py-3.5 align-top"
                  >
                    <p
                      className={cn(
                        "text-body-medium",
                        summary ? "text-text-primary" : "text-text-tertiary",
                      )}
                    >
                      {summary ? formatMoney(summary.total) : "—"}
                    </p>
                    <p className="text-caption text-text-tertiary">
                      {summary
                        ? `${summary.lines} ligne${summary.lines > 1 ? "s" : ""} retenue${summary.lines > 1 ? "s" : ""}`
                        : "Aucune ligne retenue"}
                    </p>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
