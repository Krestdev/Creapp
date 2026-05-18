"use client";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { queryKeys } from "@/lib/query-keys";
import { XAF } from "@/lib/utils";
import { userQ } from "@/queries/baseModule";
import { invoiceQ } from "@/queries/invoices";
import { providerQ } from "@/queries/providers";
import { purchaseQ } from "@/queries/purchase-order";
import { Invoice, NavLink } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
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

  const payments = invoices
    .flatMap((i) => i.payment)
    .filter((p) => p.status === "paid");

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
    const statistics: Array<StatisticProps> = [
      {
        title: "Factures Non Payées",
        value: invoices.filter((p) => p.status === "UNPAID").length,
        variant: "secondary",
      },
      {
        title: "Factures Annulées",
        value: invoices.filter((p) => p.status === "CANCELLED").length,
        variant: "destructive",
      },
      {
        title: "Factures Payées",
        value: invoices.filter((p) => p.status === "PAID").length,
        variant: "success",
        more: {
          title: "Montant payé",
          value: XAF.format(payments.reduce((acc, i) => acc + i.price, 0)),
        },
      },
      {
        title: "Total de factures",
        value: invoices.length,
        variant: "default",
        more: {
          title: "Montant total",
          value: XAF.format(invoices.reduce((acc, i) => acc + i.amount, 0)),
        },
      },
    ];
    return (
      <div className="content">
        <PageTitle
          title={"Factures"}
          subtitle={"Vérification de la conformité des factures"}
          color={"red"}
          links={links}
        />
        <div className="grid-stats-4">
          {statistics.map((item, id) => (
            <StatisticCard key={id} {...item} />
          ))}
        </div>
        <InvoicesTable
          invoices={invoices}
          users={getUsers.data.data}
          providers={getProviders.data.data}
          purchases={getPurchases.data.data}
        />
      </div>
    );
  }
}

export default Page;
