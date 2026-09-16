"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { queryKeys } from "@/lib/query-keys";
import { bankQ } from "@/queries/bank";
import { userQ } from "@/queries/baseModule";
import { useFilters } from "@/queries/filters/standard-filter";
import { payTypeQ } from "@/queries/payType";
import { transactionQ, TransactionParams } from "@/queries/transaction";
import { NavLink } from "@/types/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import TransferTable from "./transfer-table";

function Page() {
  const links: Array<NavLink> = [
    {
      title: "Demande de transfert",
      href: "./transferts/creer",
    },
    {
      title: "Approvisionnement",
      href: "./transferts/approvisionnement",
    },
  ];

  const { filters, setFilters } = useFilters();
  const [customFilters, setCustomFilters] = useState({
    search: "",
    status: "all",
    bankId: "all",
    date: undefined as string | undefined,
    from: "",
    to: "",
    amountMin: undefined as number | undefined,
    amountMax: undefined as number | undefined,
  });

  const getTransactions = useQuery({
    queryKey: queryKeys.transactions(filters, customFilters),
    queryFn: () =>
      transactionQ.getAll({
        pageIndex: filters.pageIndex,
        pageSize: filters.pageSize,
        type: "TRANSFER",
        search: customFilters.search || undefined,
        status: customFilters.status !== "all" ? customFilters.status : undefined,
        bankId: customFilters.bankId !== "all" ? Number(customFilters.bankId) : undefined,
        date: customFilters.date as TransactionParams["date"],
        from: customFilters.from || undefined,
        to: customFilters.to || undefined,
        amountMin: customFilters.amountMin,
        amountMax: customFilters.amountMax,
      }),
    placeholderData: keepPreviousData,
  });

  const getBanks = useQuery({ queryKey: queryKeys.banks, queryFn: bankQ.getAll });
  const getUsers = useQuery({ queryKey: queryKeys.users, queryFn: userQ.getAll });
  const getPaymentMethods = useQuery({ queryKey: queryKeys.paymentTypes, queryFn: payTypeQ.getAll });

  const resetAllFilters = () => {
    setCustomFilters({
      search: "",
      status: "all",
      bankId: "all",
      date: undefined,
      from: "",
      to: "",
      amountMin: undefined,
      amountMax: undefined,
    });
    setFilters({ pageIndex: 0, pageSize: 30 });
  };

  if (
    getTransactions.isLoading ||
    getBanks.isLoading ||
    getPaymentMethods.isLoading ||
    getUsers.isLoading
  ) {
    return <LoadingPage />;
  }
  if (
    getTransactions.isError ||
    getBanks.isError ||
    getPaymentMethods.isError ||
    getUsers.isError
  ) {
    return (
      <ErrorPage
        error={
          getTransactions.error ||
          getBanks.error ||
          getPaymentMethods.error ||
          getUsers.error ||
          undefined
        }
      />
    );
  }
  if (
    getTransactions.isSuccess &&
    getBanks.isSuccess &&
    getPaymentMethods.isSuccess &&
    getUsers.isSuccess
  )
    return (
      <div className="content">
        <PageTitle
          title="Transferts"
          subtitle="Historique des transferts"
          links={links}
        />
        <TransferTable
          data={getTransactions.data.data as any}
          banks={getBanks.data.data}
          paymentMethods={getPaymentMethods.data.data}
          users={getUsers.data.data}
          paginationOptions={{
            onPaginationChange: (updater) => {
              setFilters((prev) => {
                const next =
                  typeof updater === "function"
                    ? updater({ pageIndex: prev.pageIndex, pageSize: prev.pageSize })
                    : updater;
                return { ...prev, ...next };
              });
            },
            rowCount: getTransactions.data.total ?? getTransactions.data.data.length,
          }}
          pagination={{ pageIndex: filters.pageIndex, pageSize: filters.pageSize }}
          customFilters={customFilters}
          setCustomFilters={setCustomFilters}
          resetAllFilters={resetAllFilters}
        />
      </div>
    );
}

export default Page;
