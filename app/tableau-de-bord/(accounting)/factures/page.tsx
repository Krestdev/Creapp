"use client";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { commadQ } from "@/queries/command";
import { invoiceQ } from "@/queries/invoices";
import { Invoice, NavLink } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { InvoicesTable } from "./invoices-table";

function Page() {

  const links: Array<NavLink> = [
    {
      title: "Enregistrer une facture",
      href: "./factures/creer"
    }
  ]

  const getInvoices = useQuery({
    queryKey: ["invoices"],
    queryFn: invoiceQ.getAll,
  });
  const getPurchases = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: commadQ.getAll,
  });

  const invoices: Array<Invoice> = useMemo(() => {
    if (!getInvoices.data) return [];
    return getInvoices.data.data;
  }, [getInvoices.data]);

  if (getInvoices.isLoading || getPurchases.isLoading) {
    return <LoadingPage />;
  }

  if (getInvoices.isError || getPurchases.isError) {
    return <ErrorPage />;
  }

  if (getInvoices.isSuccess && getPurchases.isSuccess) {
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
        title: "Factures Validées",
        value: invoices.filter((p) => p.status === "PAID").length,
        variant: "success",
      },
      {
        title: "Total de factures",
        value: invoices.length,
        variant: "default",
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
        <InvoicesTable invoices={invoices} purchases={getPurchases.data.data} />
      </div>
    );
  }
}

export default Page;
