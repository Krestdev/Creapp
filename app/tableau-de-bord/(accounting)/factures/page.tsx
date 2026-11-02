"use client";
import { StatCard } from "@/components/ds/stat-card";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { queryKeys } from "@/lib/query-keys";
import { userQ } from "@/queries/baseModule";
import { invoiceQ } from "@/queries/invoices";
import { providerQ } from "@/queries/providers";
import { purchaseQ } from "@/queries/purchase-order";
import { Invoice, NavLink } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarIcon,
  ClockIcon,
  FileTextIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  InvoiceQuickFilter,
  activePayments,
  isDueWithin,
  isOpen,
  matchesQuickFilter,
  money,
  paidAmount,
  restAmount,
} from "./invoice-utils";
import { InvoicesTable } from "./invoices-table";

function Page() {
  const links: Array<NavLink> = [
    {
      title: "Enregistrer une facture",
      href: "./factures/creer",
    },
  ];

  const getPurchases = useQuery({
    queryKey: queryKeys.purchaseOrders,
    queryFn: purchaseQ.getAll,
  });

  const getInvoices = useQuery({
    queryKey: queryKeys.invoices,
    queryFn: invoiceQ.getAll,
  });

  const getProviders = useQuery({
    queryKey: queryKeys.providers,
    queryFn: providerQ.getAll,
  });

  const getUsers = useQuery({
    queryKey: queryKeys.users,
    queryFn: userQ.getAll,
  });

  const invoices: Array<Invoice> = useMemo(() => {
    if (!getInvoices.data) return [];
    return getInvoices.data.data;
  }, [getInvoices.data]);

  const [quick, setQuick] = useState<InvoiceQuickFilter | null>(null);
  const toggleQuick = (filter: InvoiceQuickFilter) =>
    setQuick((current) => (current === filter ? null : filter));

  if (
    getInvoices.isLoading ||
    getUsers.isLoading ||
    getProviders.isLoading ||
    getPurchases.isLoading
  ) {
    return <LoadingPage />;
  }

  if (
    getInvoices.isError ||
    getUsers.isError ||
    getProviders.isError ||
    getPurchases.isError
  ) {
    return (
      <ErrorPage
        error={
          getInvoices.error ||
          getUsers.error ||
          getProviders.error ||
          getPurchases.error ||
          undefined
        }
      />
    );
  }

  if (
    getInvoices.isSuccess &&
    getUsers.isSuccess &&
    getProviders.isSuccess &&
    getPurchases.isSuccess
  ) {
    const sumRest = (list: typeof invoices) =>
      list.reduce((acc, i) => acc + restAmount(i), 0);
    const noPayment = invoices.filter((i) =>
      matchesQuickFilter(i, "noPayment"),
    );
    const dueSoon = invoices.filter((i) => isDueWithin(i, 7));
    const partial = invoices.filter((i) => matchesQuickFilter(i, "partial"));
    const inProgress = invoices
      .filter((i) => i.status !== "CANCELLED")
      .flatMap((i) => activePayments(i))
      .filter((p) => p.status !== "paid");
    const nextDue = [...dueSoon].sort(
      (x, y) =>
        new Date(x.deadline).getTime() - new Date(y.deadline).getTime(),
    )[0];
    return (
      <div className="content">
        <PageTitle
          title={"Factures fournisseurs"}
          subtitle={
            "Toutes les factures fournisseurs et l’état de leurs paiements. Modifier ou annuler n’est possible que sans paiement, ou si tous ses paiements sont en attente d’autorisation."
          }
          links={links}
        />
        <div className="grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2 @min-[960px]:grid-cols-4">
          <StatCard
            label="Sans paiement"
            value={noPayment.length}
            delta={money(sumRest(noPayment))}
            icon={FileTextIcon}
            onClick={() => toggleQuick("noPayment")}
          />
          <StatCard
            label="Échéance sous 7 jours"
            value={dueSoon.length}
            tone={dueSoon.length > 0 ? "alert" : "good"}
            icon={dueSoon.length > 0 ? TriangleAlertIcon : undefined}
            delta={
              dueSoon.length === 0
                ? "✓ Aucune échéance proche"
                : dueSoon.length === 1
                  ? `${money(sumRest(dueSoon))} · ${nextDue.reference}`
                  : `${money(sumRest(dueSoon))} · ${dueSoon.length} factures`
            }
            onClick={() => toggleQuick("dueSoon")}
          />
          <StatCard
            label="Paiements en cours"
            value={inProgress.length}
            delta={`${money(inProgress.reduce((acc, p) => acc + p.price, 0))} · autorisation ou exécution`}
            icon={CalendarIcon}
            onClick={() => toggleQuick("inProgress")}
          />
          <StatCard
            label="Partiellement payées"
            value={partial.length}
            delta={`reste ${money(sumRest(partial))}`}
            icon={ClockIcon}
            onClick={() => toggleQuick("partial")}
          />
        </div>
        <InvoicesTable
          invoices={invoices}
          users={getUsers.data.data}
          providers={getProviders.data.data}
          purchases={getPurchases.data.data}
          quickFilter={quick}
          onQuickFilterChange={setQuick}
        />
      </div>
    );
  }
}

export default Page;
