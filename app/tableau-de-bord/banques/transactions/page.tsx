"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { isRole } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { bankQ } from "@/queries/bank";
import { transactionQ } from "@/queries/transaction";
import { NavLink } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import TransactionTable from "./transaction-table";
import { StatisticCard } from "@/components/base/TitleValueCard";
import { userQ } from "@/queries/baseModule";
import React from "react";

function Page() {
  const { user } = useStore();
  const auth = isRole({ roleList: user?.role ?? [], role: "trésorier" });
  const links: Array<NavLink> = [
    {
      title: "Créer une transaction",
      href: "./transactions/creer",
    },
  ];

  const getTransactions = useQuery({
    queryKey: ["transactions"],
    queryFn: transactionQ.getAll,
  });
  const getBanks = useQuery({ queryKey: ["banks"], queryFn: bankQ.getAll });
  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: userQ.getAll,
  });

  const filteredTransactions = React.useMemo(() => {
    if (!getTransactions.data) return [];
    return getTransactions.data.data
      .filter((t) => t.status === "APPROVED" /* && t.Type !== "TRANSFER" */)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }, [getTransactions.data]);

  if (getTransactions.isLoading || getBanks.isLoading || getUsers.isLoading) {
    return <LoadingPage />;
  }
  if (getTransactions.isError || getBanks.isError || getUsers.isError) {
    return (
      <ErrorPage
        error={
          getTransactions.error || getBanks.error || getUsers.error || undefined
        }
      />
    );
  }
  if (getTransactions.isSuccess && getBanks.isSuccess && getUsers.isSuccess)
    return (
      <div className="content">
        <PageTitle
          title="Transactions"
          subtitle="Consultez la liste des transactions"
          links={links}
        />
        <TransactionTable
          data={filteredTransactions}
          canEdit={true}
          banks={getBanks.data.data}
          filterByType
          users={getUsers.data.data}
        />
      </div>
    );
}

export default Page;
