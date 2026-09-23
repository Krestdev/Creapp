"use client";
import StatsCard from "@/components/base/StatsCard";
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
import { useStore } from "@/providers/datastore";
import { TransferTransaction } from "@/types/types";
import SignTransfers, { SignatureFilters } from "./sign-transfers";

// Le backend n'expose pas de compteur par utilisateur : on charge les
// transferts en une seule page pour calculer les statistiques côté client.
const STATS_PAGE_SIZE = 1000;

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
  const { user } = useStore();
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

  // Statistiques du signataire connecté, indépendantes de l'onglet et des
  // filtres. Le backend ignore `userId` sur cet endpoint : on récupère les
  // deux onglets et on ne garde que ce qui concerne l'utilisateur connecté.
  const statsQuery = useQuery({
    queryKey: queryKeys.signatureTransfersList({
      scope: "my-stats",
      userId: user?.id,
    }),
    queryFn: async () => {
      const [pending, completed] = await Promise.all([
        transactionQ.getSignatureTransfers({
          tab: "PENDING",
          pageIndex: 0,
          pageSize: STATS_PAGE_SIZE,
        }),
        transactionQ.getSignatureTransfers({
          tab: "COMPLETED",
          pageIndex: 0,
          pageSize: STATS_PAGE_SIZE,
        }),
      ]);
      return {
        pending: pending.data.transactions,
        completed: completed.data.transactions,
      };
    },
    enabled: !!user?.id,
  });

  const hasSigned = (t: TransferTransaction) =>
    !!t.signers?.some((s) => s.userId === user?.id && s.signed === true);
  // En attente : à traiter et pas encore signé par moi
  const pendingValue = (statsQuery.data?.pending ?? []).filter(
    (t) => !hasSigned(t),
  ).length;
  // Signés : uniquement ceux que j'ai moi-même signés
  const signedValue = (statsQuery.data?.completed ?? []).filter(hasSigned)
    .length;
  const totalValue = pendingValue + signedValue;

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
          <StatsCard
            title="Mes signatures"
            titleColor="text-primary-100"
            value={totalValue}
            description="En attente :"
            descriptionValue={String(pendingValue)}
            descriptionColor="text-primary-100"
            dvalueColor="text-white"
            dividerColor="bg-primary-200"
            className="h-full bg-primary-600 border-primary-200 text-white"
          />
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
