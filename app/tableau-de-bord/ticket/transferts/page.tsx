"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { transactionQ } from "@/queries/transaction";
import TransferTable from "./transfer-table";
import { useQuery } from "@tanstack/react-query";
import { userQ } from "@/queries/baseModule";
import React from "react";

function Page() {
  const { data, isSuccess, isError, error, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: transactionQ.getAll,
  });
  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: userQ.getAll,
  });

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    return data.data.filter((x) => !x.from.type?.includes("CASH"));
  }, [data]);
  if (isLoading || getUsers.isLoading) {
    return <LoadingPage />;
  }
  if (isError || getUsers.isError) {
    return <ErrorPage error={error || getUsers.error || undefined} />;
  }
  if (isSuccess && getUsers.isSuccess) {
    return (
      <div className="content">
        <PageTitle
          title="Approbation des transferts"
          subtitle="Approuvez ou rejetez les demandes de transfert de fonds."
          color="green"
        />
        <TransferTable data={filteredData} users={getUsers.data.data} />
      </div>
    );
  }
}

export default Page;
