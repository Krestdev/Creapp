'use client'
import PageTitle from "@/components/pageTitle";
import React from "react";
import CreatePaiement from "./create";
import { PurchaseOrder } from "@/queries/purchase-order";
import { useFetchQuery } from "@/hooks/useData";
import LoadingPage from "@/components/loading-page";
import ErrorPage from "@/components/error-page";

function Page(){
  const purchaseOrderQuery = new PurchaseOrder();
    const getPurchases = useFetchQuery(["purchaseOrders"], purchaseOrderQuery.getAll);

    if(getPurchases.isLoading){
      return <LoadingPage/>
    }
    if(getPurchases.isError){
      return <ErrorPage error={getPurchases.error} />
    }
    if(getPurchases.isSuccess)
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
};

export default Page;
