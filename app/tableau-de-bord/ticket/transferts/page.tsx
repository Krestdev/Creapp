"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { useFetchQuery } from "@/hooks/useData";
import { transactionQ } from "@/queries/transaction";
import TransferTable from "./transfer-table";
import TransferHistory from "./transfert-history";
import { TabBar } from "@/components/base/TabBar";
import { useState } from "react";

function Page() {
  const { data, isSuccess, isError, error, isLoading } = useFetchQuery(
    ["transactions"],
    transactionQ.getAll
  );
  const tabs = [
    {
      id: 0,
      title: "Transferts en attente"
    },
    {
      id: 1,
      title: "Historique des transferts"
    },
  ]
  const [selectedTab, setSelectedTab] = useState(0)

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
          title="Approbation des transferts"
          subtitle="Approuvez ou rejetez les demandes de transfert de fonds."
          color="green"
        />
        <TabBar tabs={tabs} setSelectedTab={setSelectedTab} selectedTab={selectedTab} />
        {
          selectedTab === 0 ?
            <TransferTable
              data={data.data.filter(
                (c) => c.Type === "TRANSFER" && c.status === "PENDING"
              )}
            /> :
            <TransferHistory
              data={data.data.filter(
                (c) =>
                  (c.Type === "TRANSFER" && c.status === "APPROVED") ||
                  c.status === "REJECTED"
              )}
            />
        }
      </div>
    );
  }
}

export default Page;
