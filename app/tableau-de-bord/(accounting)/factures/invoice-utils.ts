import { formatNumber } from "@/lib/format";
import { Invoice, PAY_STATUS } from "@/types/types";

/** Paiements qui ne comptent plus (rejetés, annulés, fantômes). */
const INACTIVE_PAYMENT = ["rejected", "cancelled", "ghost"];

export type InvoiceQuickFilter =
  | "noPayment"
  | "dueSoon"
  | "inProgress"
  | "partial";

export const QUICK_FILTER_LABELS: Record<InvoiceQuickFilter, string> = {
  noPayment: "Sans paiement",
  dueSoon: "Échéance sous 7 jours",
  inProgress: "Paiements en cours",
  partial: "Partiellement payées",
};

export const activePayments = (invoice: Invoice) =>
  (invoice.payment ?? []).filter((p) => !INACTIVE_PAYMENT.includes(p.status));

export const paidAmount = (invoice: Invoice) =>
  (invoice.payment ?? [])
    .filter(
      (p) =>
        p.status === "paid" ||
        p.status === "simple_signed" ||
        p.status === "signed" ||
        p.status === "validated" ||
        p.status === "unsigned",
    )
    .reduce((sum, p) => sum + p.price, 0);

export const restAmount = (invoice: Invoice) =>
  Math.max(0, invoice.amount - paidAmount(invoice));

export const isOpen = (invoice: Invoice) => invoice.status === "UNPAID";

/** Facture ouverte dont l'échéance tombe dans les `days` jours (retards compris). */
export function isDueWithin(invoice: Invoice, days: number): boolean {
  if (!isOpen(invoice) || restAmount(invoice) <= 0 || !invoice.deadline)
    return false;
  const limit = new Date();
  limit.setDate(limit.getDate() + days);
  return new Date(invoice.deadline) <= limit;
}

export function isOverdue(invoice: Invoice): boolean {
  if (!isOpen(invoice) || restAmount(invoice) <= 0 || !invoice.deadline)
    return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(invoice.deadline) < today;
}

export function isDueThisMonth(invoice: Invoice): boolean {
  if (!isOpen(invoice) || !invoice.deadline) return false;
  const now = new Date();
  const due = new Date(invoice.deadline);
  return (
    due.getFullYear() === now.getFullYear() && due.getMonth() === now.getMonth()
  );
}

export const matchesQuickFilter = (
  invoice: Invoice,
  filter: InvoiceQuickFilter,
): boolean => {
  switch (filter) {
    case "noPayment":
      return isOpen(invoice) && activePayments(invoice).length === 0;
    case "dueSoon":
      return isDueWithin(invoice, 7);
    case "inProgress":
      return (
        invoice.status !== "CANCELLED" &&
        activePayments(invoice).some((p) => p.status !== "paid")
      );
    case "partial":
      return (
        isOpen(invoice) && paidAmount(invoice) > 0 && restAmount(invoice) > 0
      );
  }
};

/** Ligne de synthèse des paiements d'une facture (3ᵉ ligne de la liste). */
export function paymentSummary(invoice: Invoice): string {
  const payments = invoice.payment ?? [];
  const active = activePayments(invoice);
  if (active.length === 0) {
    const rejected = payments.find((p) => p.status === "rejected");
    return rejected
      ? `Aucun paiement actif · ${rejected.reference} rejeté`
      : "Aucun paiement";
  }
  const unpaid = active.filter((p) => p.status !== "paid");
  const noun = `paiement${active.length > 1 ? "s" : ""}`;
  if (unpaid.length === 0) {
    return `${active.length} ${noun} payé${active.length > 1 ? "s" : ""}`;
  }
  const first = unpaid[0];
  const status = (
    PAY_STATUS.find((s) => s.value === first.status)?.name ?? first.status
  ).toLowerCase();
  const paid = active.length - unpaid.length;
  return `${active.length} ${noun}${paid > 0 ? ` dont ${paid} payé${paid > 1 ? "s" : ""}` : ""} · ${first.reference} ${status}`;
}

export const money = (value: number) => `${formatNumber(value)} XAF`;
