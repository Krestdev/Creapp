"use client";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { queryKeys } from "@/lib/query-keys";
import { bankQ } from "@/queries/bank";
import { userQ } from "@/queries/baseModule";
import { useFilters } from "@/queries/filters/standard-filter";
import { payTypeQ } from "@/queries/payType";
import { transactionQ, TransactionApprovalParams } from "@/queries/transaction";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import SignTransfers, { SignatureFilters } from "./sign-transfers";

const defaultCustomFilters: SignatureFilters = {
  search: "",
  tab: "PENDING",
  bankId: "all",
  date: undefined,
  from: "",
  to: "",
  amountMin: undefined,
  amountMax: undefined,
};

function Page() {
  const { filters, setFilters } = useFilters();
  const [customFilters, setCustomFilters] =
    useState<SignatureFilters>(defaultCustomFilters);

  const signatureParams: TransactionApprovalParams = {
    pageIndex: filters.pageIndex,
    pageSize: filters.pageSize,
    tab: customFilters.tab,
    search: customFilters.search || undefined,
    bankId:
      customFilters.bankId !== "all" ? Number(customFilters.bankId) : undefined,
    date: customFilters.date,
    from: customFilters.from || undefined,
    to: customFilters.to || undefined,
    amountMin: customFilters.amountMin,
    amountMax: customFilters.amountMax,
  };

  const { data, isSuccess, isError, error, isLoading } = useQuery({
    queryKey: queryKeys.signatureTransfersList(signatureParams),
    queryFn: () => transactionQ.getSignatureTransfers(signatureParams),
    placeholderData: keepPreviousData,
  });

  const pendingCount = useQuery({
    queryKey: queryKeys.pendingToSignTransfersCount,
    queryFn: () => transactionQ.getPendingToSignCount(),
  });
  const getBanks = useQuery({
    queryKey: queryKeys.banks,
    queryFn: bankQ.getAll,
  });
  const getPayType = useQuery({
    queryKey: queryKeys.paymentTypes,
    queryFn: payTypeQ.getAll,
  });
  const getUsers = useQuery({
    queryKey: queryKeys.users,
    queryFn: userQ.getAll,
  });

  // Tout changement de filtre ou d'onglet renvoie à la première page
  const updateCustomFilters = (next: SignatureFilters) => {
    setCustomFilters(next);
    setFilters((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const statistics: Array<StatisticProps> = [
    {
      title: "En attente signature",
      value: pendingCount.data?.data ?? 0,
      variant: "primary",
    },
  ];

  if (
    isLoading ||
    getBanks.isLoading ||
    getPayType.isLoading ||
    getUsers.isLoading
  ) {
    return <LoadingPage />;
  }

  if (isError || getBanks.isError || getPayType.isError || getUsers.isError) {
    return (
      <ErrorPage
        error={
          error ||
          getBanks.error ||
          getPayType.error ||
          getUsers.error ||
          undefined
        }
      />
    );
  }

  if (
    isSuccess &&
    getBanks.isSuccess &&
    getPayType.isSuccess &&
    getUsers.isSuccess
  ) {
    return (
      <div className="content">
        <PageTitle
          title="Signatures"
          subtitle="Consultez les demandes de signatures liées aux transferts bancaires"
          color="blue"
        />

        <div className="h-fit grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4 items-center gap-5">
          {statistics.map((stat, id) => (
            <StatisticCard key={id} {...stat} className="h-full" />
          ))}
        </div>
        <SignTransfers
          data={data.data.transactions}
          banks={getBanks.data.data}
          paymentMethods={getPayType.data.data}
          users={getUsers.data.data}
          pendingCount={pendingCount.data?.data}
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

  return null;
}

export default Page;
