"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { queryKeys } from "@/lib/query-keys";
import { bankQ } from "@/queries/bank";
import { userQ } from "@/queries/baseModule";
import { useFilters } from "@/queries/filters/standard-filter";
import { transactionQ, TransactionApprovalParams } from "@/queries/transaction";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import TransferTable, { ApprovalFilters } from "./transfer-table";

const defaultCustomFilters: ApprovalFilters = {
  search: "",
  tab: "PENDING",
  bankId: "all",
  toBankId: "all",
  bankId: "all",
  userId: "all",
  date: undefined,
  from: "",
  to: "",
  amountMin: undefined,
  amountMax: undefined,
};

function Page() {
  const { filters, setFilters } = useFilters();
  const [customFilters, setCustomFilters] =
    useState<ApprovalFilters>(defaultCustomFilters);

  const approvalParams: TransactionApprovalParams = {
    pageIndex: filters.pageIndex,
    pageSize: filters.pageSize,
    tab: customFilters.tab,
    search: customFilters.search || undefined,
    bankId:
      customFilters.bankId !== "all" ? Number(customFilters.bankId) : undefined,
    toBankId:
      customFilters.toBankId !== "all"
        ? Number(customFilters.toBankId)
        : undefined,
    bankId:
      customFilters.bankId !== "all" ? Number(customFilters.bankId) : undefined,
    userId:
      customFilters.userId !== "all" ? Number(customFilters.userId) : undefined,
    date: customFilters.date,
    from: customFilters.from || undefined,
    to: customFilters.to || undefined,
    amountMin: customFilters.amountMin,
    amountMax: customFilters.amountMax,
  };

  const { data, isSuccess, isError, error, isLoading } = useQuery({
    queryKey: queryKeys.transferApprovalsList(approvalParams),
    queryFn: () => transactionQ.getApprovalTransactions(approvalParams),
    placeholderData: keepPreviousData,
  });

  const getBanks = useQuery({
    queryKey: queryKeys.banks,
    queryFn: bankQ.getAll,
  });

  const getUsers = useQuery({
    queryKey: queryKeys.users,
    queryFn: userQ.getAll,
  });

  // Tout changement de filtre ou d'onglet renvoie à la première page
  const updateCustomFilters = (next: ApprovalFilters) => {
    setCustomFilters(next);
    setFilters((prev) => ({ ...prev, pageIndex: 0 }));
  };

  if (isLoading || getBanks.isLoading || getUsers.isLoading) {
    return <LoadingPage />;
  }
  if (isError || getBanks.isError || getUsers.isError) {
    return (
      <ErrorPage
        error={error || getBanks.error || getUsers.error || undefined}
      />
    );
  }
  if (isSuccess && getBanks.isSuccess && getUsers.isSuccess) {
    return (
      <div className="content">
        <PageTitle
          title="Approbation des transferts"
          subtitle="Approuvez ou rejetez les demandes de transfert de fonds."
          color="green"
        />
        <TransferTable
          data={data.data.transactions}
          banks={getBanks.data.data}
          users={getUsers.data.data}
          paginationOptions={{
            onPaginationChange: (updater) => {
              setFilters((prev) => {
                const next =
                  typeof updater === "function"
                    ? updater({
                        pageIndex: prev.pageIndex,
                        pageSize: prev.pageSize,
                      })
                    : updater;
                return { ...prev, ...next };
              });
            },
            rowCount: data.data.total ?? data.data.transactions.length,
          }}
          pagination={{
            pageIndex: filters.pageIndex,
            pageSize: filters.pageSize,
          }}
          customFilters={customFilters}
          setCustomFilters={updateCustomFilters}
          resetAllFilters={() => {
            setCustomFilters(defaultCustomFilters);
            setFilters({ pageIndex: 0, pageSize: 30 });
          }}
        />
      </div>
    );
  }
}

export default Page;
