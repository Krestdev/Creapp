"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { useFetchQuery } from "@/hooks/useData";
import { commadQ } from "@/queries/command";
import { paymentQ } from "@/queries/payment";
import { InvoicesTable } from "./invoices-table";
import { StatisticCard, StatisticProps } from "@/components/base/TitleValueCard";
import { PaymentRequest } from "@/types/types";
import { useMemo } from "react";

function Page() {
  const getPayments = useFetchQuery(["payments"], paymentQ.getAll, 15000);
  const getPurchases = useFetchQuery(["purchaseOrders"], commadQ.getAll, 15000);

  const payments: Array<PaymentRequest> = useMemo(()=>{
    if(!getPayments.data) return [];
    return getPayments.data.data.filter((p) => p.type === "achat");
  },[getPayments.data])

  if (getPayments.isLoading || getPurchases.isLoading) {
    return <LoadingPage />;
  }

  if (getPayments.isError || getPurchases.isError) {
    return <ErrorPage />;
  }

  if (getPayments.isSuccess && getPurchases.isSuccess){
    const statistics:Array<StatisticProps> = [
      {
        title: "Factures en attente",
        value: payments.filter(p=>p.status === "pending").length,
        variant: "secondary"
      },
      {
        title: "Factures Rejetées",
        value: payments.filter(p=>p.status === "rejected").length,
        variant: "destructive"
      },
      {
        title: "Factures Validées",
        value: payments.filter(p=>p.status === "accepted").length,
        variant: "success"
      },
      {
        title: "Total de factures",
        value: payments.length,
        variant: "default"
      },
    ];
    return (
      <div className="content">
        <PageTitle
          title={"Factures"}
          subtitle={"Vérification de la conformité des factures"}
          color={"red"}
        />
        <div className="grid-stats-4">
          {
            statistics.map((item, id)=>
            <StatisticCard key={id} {...item} />)
          }
        </div>
        <InvoicesTable
          payments={payments}
          purchases={getPurchases.data.data}
        />
      </div>
    );}
}

export default Page;
