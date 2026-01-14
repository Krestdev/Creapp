"use client";
import PageTitle from "@/components/pageTitle";
import React, { useState } from "react";
import { PurchaseApprovalTable } from "./approval-table";
import { useStore } from "@/providers/datastore";
import ErrorPage from "@/components/error-page";
import { purchaseQ } from "@/queries/purchase-order";
import { useFetchQuery } from "@/hooks/useData";
import LoadingPage from "@/components/loading-page";
import { ApprovedTable } from "./approved-table";
import { TabBar } from "@/components/base/TabBar";

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
  const [selectedTab, setSelectedTab] = useState(0)
  const tabs = [
    {
      id: 0,
      title: "Bons de commandes en attente"
    },
    {
      id: 1,
      title: "Bons de commandes traités"
    },
  ]

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
        <TabBar tabs={tabs} setSelectedTab={setSelectedTab} selectedTab={selectedTab} />
        {selectedTab === 0 ?
          <PurchaseApprovalTable
            data={data.data.filter(
              (c) => c.status === "IN-REVIEW" || c.status === "PENDING"
            )}
          /> :
          <ApprovedTable
            data={data.data.filter(
              (c) => c.status === "APPROVED" || c.status === "REJECTED"
            )}
          />
        }
      </div>
    );
  }
}

export default Page;
