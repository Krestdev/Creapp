"use client";
import PageTitle from "@/components/pageTitle";
import React from "react";
import CreatePaiement from "./create";
import { purchaseQ } from "@/queries/purchase-order";
import LoadingPage from "@/components/loading-page";
import ErrorPage from "@/components/error-page";
import { useQuery } from "@tanstack/react-query";

function Page() {
  const getPurchases = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: purchaseQ.getAll,
  });

  if (getPurchases.isLoading) {
    return <LoadingPage />;
  }
  if (getPurchases.isError) {
    return <ErrorPage error={getPurchases.error} />;
  }
  if (getPurchases.isSuccess)
    return (
      <div className="content">
        <PageTitle
          title={"Créer un paiement"}
          subtitle={"Complétez le formulaire pour créer une paiement"}
          color={"blue"}
        />
        <CreatePaiement purchases={getPurchases.data.data} />
      </div>
    );
}

export default Page;
