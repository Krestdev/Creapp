"use client";
import { TabBar } from "@/components/base/TabBar";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { PaiementsTable } from "@/components/tables/PaiementsTable";
import { queryKeys } from "@/lib/query-keys";
import { XAF } from "@/lib/utils";
import { paymentQ } from "@/queries/payment";
import { providerQ } from "@/queries/providers";
import { purchaseQ } from "@/queries/purchase-order";
import { DateFilter, NavLink } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { PaymentFiltersProps } from "./paymentFilters";

function Page() {
  const links: Array<NavLink> = [
    {
      title: "Créer un paiement",
      href: "./paiements/creer",
    },
  ];

  const [isCustomDateModalOpen, setIsCustomDateModalOpen] =
    React.useState(false);
  const [dateFilter, setDateFilter] = React.useState<DateFilter>();

  const [customFilters, setCustomFilters] = React.useState<
    PaymentFiltersProps["customFilters"]
  >({
    search: "",
    tab: "pending",
    amount: 0,
    amountType: "greater",
    provider: "all",
    priority: "all",
    date: undefined,
    from: "",
    to: "",
  });

  const { tab, search, ...otherFilters } = customFilters;

  const resetAllFilters = () => {
    setCustomFilters({
      search: "",
      tab: "pending",
      amount: 0,
      amountType: "greater",
      provider: "all",
      priority: "all",
      date: undefined,
      from: "",
      to: "",
    });
    setDateFilter(undefined);
  };

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 15,
  });

  const getPayments = useQuery({
    queryKey: queryKeys.payments(customFilters, dateFilter, pagination),
    queryFn: () =>
      paymentQ.getAccountantPayments({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        search: customFilters.search || undefined,
        provider:
          customFilters.provider !== "all" ? customFilters.provider : undefined,
        tab: customFilters.tab,
        amount: customFilters.amount || 0,
        amountType: customFilters.amountType,
        date: customFilters.date || undefined,
        from: customFilters.from || undefined,
        to: customFilters.to || undefined,
      }),
  });

  const getStats = useQuery({
    queryKey: queryKeys.paymentsStats(otherFilters, dateFilter),
    queryFn: () =>
      paymentQ.getAccountantPaymentsStats({
        provider:
          customFilters.provider !== "all" ? customFilters.provider : undefined,
        amount: customFilters.amount || 0,
        amountType: customFilters.amountType,
        date: customFilters.date || undefined,
        from: customFilters.from || undefined,
        to: customFilters.to || undefined,
      }),
  });

  const getPurchases = useQuery({
    queryKey: queryKeys.purchaseOrders,
    queryFn: purchaseQ.getAll,
  });

  const getProviders = useQuery({
    queryKey: queryKeys.providers,
    queryFn: providerQ.getAll,
  });

  const tabs = [
    {
      id: "pending",
      title: "Tickets en attente",
      badge: getStats.data?.pending.count,
    },
    {
      id: "processed",
      title: "Tickets traités",
      badge: getStats.data?.processed.count,
    },
    {
      id: "paid",
      title: "Tickets payés",
    },
    {
      id: "cancelled",
      title: "Tickets annulés",
    },
  ];

  if (
    getPayments.isLoading ||
    getPurchases.isLoading ||
    getProviders.isLoading ||
    getStats.isLoading
  ) {
    return <LoadingPage />;
  }

  if (
    getPayments.isError ||
    getPurchases.isError ||
    getProviders.isError ||
    getStats.isError
  ) {
    return (
      <ErrorPage
        error={
          getPayments.error ||
          getPurchases.error ||
          getProviders.error ||
          getStats.error ||
          undefined
        }
      />
    );
  }

  if (
    getPayments.isSuccess &&
    getPurchases.isSuccess &&
    getProviders.isSuccess &&
    getStats.isSuccess
  ) {
    const Statistics: Array<StatisticProps> = [
      {
        title: "Tickets en attente de traitement",
        value: getStats.data.pending.count,
        variant: "primary",
        more: {
          title: "Montant total",
          value: XAF.format(getStats.data.pending.sum),
        },
      },
      {
        title: "Tickets payés",
        value: getStats.data.paid.count,
        variant: "success",
        more: {
          title: "Montant total",
          value: XAF.format(getStats.data.paid.sum),
        },
      },
      {
        title: "Tickets traités",
        value: getStats.data.processed.count,
        variant: "secondary",
        more: {
          title: "Montant total",
          value: XAF.format(getStats.data.processed.sum),
        },
      },
      {
        title: "Tickets annulés",
        value: getStats.data.cancelled.count,
        variant: "default",
        more: {
          title: "Montant total",
          value: XAF.format(getStats.data.cancelled.sum),
        },
      },
    ];
    return (
      <div className="flex flex-col gap-6">
        <PageTitle
          title={"Paiements"}
          subtitle={
            "Créez et gérez les paiements des factures relatives aux bons de commande"
          }
          color={"red"}
          links={links}
        />
        <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4 items-center gap-5">
          {Statistics.map((data, id) => (
            <StatisticCard key={id} {...data} className="h-full" />
          ))}
        </div>
        <TabBar
          tabs={tabs}
          setSelectedTab={(value) => {
            setCustomFilters({ ...customFilters, tab: value });
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
          selectedTab={customFilters.tab}
          className="w-fit"
        />
        <PaiementsTable
          payments={getPayments.data.data}
          pagination={pagination}
          paginationOptions={{
            onPaginationChange: (updater) => {
              setPagination((prev) => {
                const nextPagination =
                  typeof updater === "function" ? updater(prev) : updater;
                return { ...prev, ...nextPagination };
              });
            },
            rowCount: getPayments.data.count,
          }}
          filters={{
            customFilters,
            setCustomFilters,
            isCustomDateModalOpen,
            setIsCustomDateModalOpen,
            providers: getProviders.data.data,
            setDateFilter,
            resetAllFilters,
          }}
        />
      </div>
    );
  }
}

export default Page;
