"use client";
import PageTitle from "@/components/pageTitle";
import React from "react";
import { PurchaseApprovalTable } from "./approval-table";
import { useStore } from "@/providers/datastore";
import ErrorPage from "@/components/error-page";
import { purchaseQ } from "@/queries/purchase-order";
import { useFetchQuery } from "@/hooks/useData";
import LoadingPage from "@/components/loading-page";
import { ApprovedTable } from "./approved-table";

function Page() {
  const { user } = useStore();
  const auth =
    user?.role.some(
      (c) => c.label === "ADMIN" || c.label === "SALES_MANAGER"
    ) ?? false;

  const { isSuccess, isError, error, isLoading, data } = useFetchQuery(
    ["purchaseOrders"],
    purchaseQ.getAll
  );

  if (!auth) {
    return <ErrorPage statusCode={401} />;
  }
  if (isLoading) {
    return <LoadingPage />;
  }
  if (isError) {
    return <ErrorPage error={error} />;
  }
  if (isSuccess) {
    return (
      <div className="content">
        <PageTitle
          title="Approbation"
          subtitle="Approbation des bons de commandes"
          color="blue"
        />
        <PurchaseApprovalTable
          data={data.data.filter(
            (c) => c.status === "IN-REVIEW" || c.status === "PENDING"
          )}
        />
        <ApprovedTable
          data={data.data.filter(
            (c) => c.status === "APPROVED" || c.status === "REJECTED"
          )}
        />
      </div>
    );
  }
}

export default Page;
