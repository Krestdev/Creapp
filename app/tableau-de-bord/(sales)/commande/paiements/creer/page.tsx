"use client";
import PageTitle from "@/components/pageTitle";
import React from "react";
import CreatePaiement from "./create";
import { purchaseQ } from "@/queries/purchase-order";
import LoadingPage from "@/components/loading-page";
import ErrorPage from "@/components/error-page";
import { useQuery } from "@tanstack/react-query";
import { paymentQ } from "@/queries/payment";

function Page() {
  const getPurchases = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: purchaseQ.getAll,
  });

  const getPayments = useQuery({
      queryKey: ["payments"],
      queryFn: paymentQ.getAll,
    });

  if (getPurchases.isLoading || getPayments.isLoading) {
    return <LoadingPage />;
  }
  if (getPurchases.isError || getPayments.isError) {
    return <ErrorPage error={getPurchases.error || getPayments.error || undefined} />;
  }
  if (getPurchases.isSuccess && getPayments.isSuccess)
    return (
      <div className="content">
        <PageTitle
          title={"Créer un paiement"}
          subtitle={"Complétez le formulaire pour créer une paiement"}
          color={"blue"}
        />
        <CreatePaiement purchases={getPurchases.data.data.filter(x => x.status === "APPROVED")} payments={getPayments.data.data}/>
      </div>
    );
}

export default Page;
