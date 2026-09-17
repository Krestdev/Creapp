"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { queryKeys } from "@/lib/query-keys";
import { userQ } from "@/queries/baseModule";
import { useFilters } from "@/queries/filters/standard-filter";
import { transactionQ, TransactionParams } from "@/queries/transaction";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import TransferTable from "./transfer-table";

function Page() {
  const { filters, setFilters } = useFilters();
  const [customFilters, setCustomFilters] = useState({
    search: "",
    status: "all",
    date: undefined as string | undefined,
    from: "",
    to: "",
  });

  const { data, isSuccess, isError, error, isLoading } = useQuery({
    queryKey: queryKeys.transactions(filters, customFilters),
    queryFn: () =>
      transactionQ.getAll({
        pageIndex: filters.pageIndex,
        pageSize: filters.pageSize,
        search: customFilters.search || undefined,
        status:
          customFilters.status !== "all" ? customFilters.status : undefined,
        date: customFilters.date as TransactionParams["date"],
        from: customFilters.from || undefined,
        to: customFilters.to || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const getUsers = useQuery({
    queryKey: queryKeys.users,
    queryFn: userQ.getAll,
  });

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
        <TransferTable
          data={data.data.transactions as any}
          users={getUsers.data.data}
          paginationOptions={{
            onPaginationChange: (updater: any) => {
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
          setCustomFilters={setCustomFilters}
          resetAllFilters={() => {
            setCustomFilters({
              search: "",
              status: "all",
              date: undefined,
              from: "",
              to: "",
            });
            setFilters({ pageIndex: 0, pageSize: 30 });
          }}
        />
      </div>
    );
  }
}

export default Page;
