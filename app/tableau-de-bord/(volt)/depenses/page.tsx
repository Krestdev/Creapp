"use client";
import { TabBar } from "@/components/base/TabBar";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { queryKeys } from "@/lib/query-keys";
import { XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { userQ } from "@/queries/baseModule";
import { paymentQ } from "@/queries/payment";
import { payTypeQ } from "@/queries/payType";
import { projectQ } from "@/queries/projectModule";
import { providerQ } from "@/queries/providers";
import { requestTypeQ } from "@/queries/requestType";
import { DateFilter, NavLink } from "@/types/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Settings2 } from "lucide-react";
import React from "react";
import DepenseFilters, { DepenseFiltersProps } from "./depenseFilters";
import ExpensesTable from "./expenses-table";

function Page() {
  const { user } = useStore();

  const links: Array<NavLink> = [
    {
      title: "Créer une dépense",
      href: "/tableau-de-bord/depenses/creer",
      hide: true,
      disabled: false,
    },
  ];

  const [isCustomDateModalOpen, setIsCustomDateModalOpen] =
    React.useState(false);
  const [dateFilter, setDateFilter] = React.useState<DateFilter>();

  const [customFilters, setCustomFilters] = React.useState<
    DepenseFiltersProps["customFilters"]
  >({
    search: "",
    tab: "validated",
    beneficiary: "all",
    amount: 0,
    amountType: "greater",
    provider: "all",
    priority: "all",
    paymentMethod: "all",
    isSelected: "all",
    type: "all",
    date: undefined,
    from: "",
    to: "",
  });

  const { tab, search, ...otherFilters } = customFilters;

  const resetAllFilters = () => {
    setCustomFilters({
      search: "",
      tab: "validated",
      beneficiary: "all",
      amount: 0,
      amountType: "greater",
      provider: "all",
      priority: "all",
      paymentMethod: "all",
      isSelected: "all",
      type: "all",
      date: undefined,
      from: "",
      to: "",
    });
    setDateFilter(undefined);
  };

  const [filters, setFilters] = React.useState({
    pageIndex: 0,
    pageSize: 15,
  });

  const { data, isSuccess, isError, error, isLoading } = useQuery({
    queryKey: queryKeys.depenses(filters, customFilters, dateFilter),
    queryFn: () =>
      paymentQ.getDepenses({
        pageIndex: filters.pageIndex,
        pageSize: filters.pageSize,
        search: customFilters.search || undefined,
        beneficiary:
          customFilters.beneficiary !== "all"
            ? customFilters.beneficiary
            : undefined,
        provider:
          customFilters.provider !== "all" ? customFilters.provider : undefined,
        tab: customFilters.tab,
        amount: customFilters.amount || 0,
        amountType: customFilters.amountType,
        paymentMethod:
          customFilters.paymentMethod !== "all"
            ? customFilters.paymentMethod
            : undefined,
        type: customFilters.type !== "all" ? customFilters.type : undefined,
        date: customFilters.date || undefined,
        from: customFilters.from || undefined,
        to: customFilters.to || undefined,
      }),
    enabled: !!user,
    placeholderData: keepPreviousData,
  });

  const getStats = useQuery({
    queryKey: queryKeys.depensesStats(otherFilters, dateFilter),
    queryFn: () =>
      paymentQ.getDepensesStats({
        beneficiary:
          customFilters.beneficiary !== "all"
            ? customFilters.beneficiary
            : undefined,
        provider:
          customFilters.provider !== "all" ? customFilters.provider : undefined,
        amount: customFilters.amount || 0,
        amountType: customFilters.amountType,
        paymentMethod:
          customFilters.paymentMethod !== "all"
            ? customFilters.paymentMethod
            : undefined,
        type: customFilters.type !== "all" ? customFilters.type : undefined,
        date: customFilters.date || undefined,
        from: customFilters.from || undefined,
        to: customFilters.to || undefined,
      }),
    enabled: !!user,
    placeholderData: keepPreviousData,
  });

  const getRequestType = useQuery({
    queryKey: queryKeys.requestTypes,
    queryFn: requestTypeQ.getAll,
  });

  const getPaymentType = useQuery({
    queryKey: queryKeys.paymentTypes,
    queryFn: payTypeQ.getAll,
  });

  const getProjects = useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => {
      return projectQ.getAll();
    },
  });

  const getUsers = useQuery({
    queryKey: queryKeys.users,
    queryFn: () => userQ.getAll(),
  });

  const getProviders = useQuery({
    queryKey: queryKeys.providers,
    queryFn: providerQ.getAll,
  });

  const tabs = [
    {
      id: "validated",
      title: "Tickets en attente",
      badge: getStats.data?.validated.count,
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
    isLoading ||
    getRequestType.isLoading ||
    getPaymentType.isLoading ||
    getProviders.isLoading ||
    getProjects.isLoading ||
    getUsers.isLoading ||
    getStats.isLoading
  ) {
    return <LoadingPage />;
  }
  if (
    isError ||
    getRequestType.isError ||
    getPaymentType.isError ||
    getProviders.isError ||
    getProjects.isError ||
    getUsers.isError ||
    getStats.isError
  ) {
    return (
      <ErrorPage
        error={
          error ||
          getRequestType.error ||
          getPaymentType.error ||
          getProviders.error ||
          getProjects.error ||
          getUsers.error ||
          getStats.error ||
          undefined
        }
      />
    );
  }
  if (
    isSuccess &&
    getRequestType.isSuccess &&
    getPaymentType.isSuccess &&
    getProviders.isSuccess &&
    getProjects.isSuccess &&
    getUsers.isSuccess &&
    getStats.isSuccess
  ) {
    const Statistics: Array<StatisticProps> = [
      {
        title: "Tickets en attente de traitement",
        value: getStats.data.validated.count,
        variant: "primary",
        more: {
          title: "Montant total",
          value: XAF.format(getStats.data.validated.sum),
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
      <div className="content">
        <PageTitle
          title="Dépenses"
          subtitle="Consulter et traiter les dépenses"
          color="red"
          links={links}
        />
        <Sheet>
          <SheetTrigger asChild className="w-fit">
            <Button variant={"outline"}>
              <Settings2 />
              {"Filtres"}
            </Button>
          </SheetTrigger>
          <SheetContent className="px-3">
            <SheetHeader>
              <SheetTitle>{"Filtres"}</SheetTitle>
              <SheetDescription>
                {"Configurer les filtres pour affiner les données"}
              </SheetDescription>
            </SheetHeader>
            <DepenseFilters
              customFilters={customFilters}
              setCustomFilters={setCustomFilters}
              isCustomDateModalOpen={isCustomDateModalOpen}
              setIsCustomDateModalOpen={setIsCustomDateModalOpen}
              users={getUsers.data.data}
              providers={getProviders.data.data}
              setDateFilter={setDateFilter}
              resetAllFilters={resetAllFilters}
            />
          </SheetContent>
        </Sheet>
        <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4 items-center gap-5">
          {Statistics.map((data, id) => (
            <StatisticCard key={id} {...data} className="h-full" />
          ))}
        </div>
        <TabBar
          tabs={tabs}
          setSelectedTab={(value) => {
            setCustomFilters({ ...customFilters, tab: value });
            setFilters((prev) => ({ ...prev, pageIndex: 0 }));
          }}
          selectedTab={customFilters.tab}
          className="w-fit"
        />
        <ExpensesTable
          payments={data.data}
          requestTypes={getRequestType.data.data}
          paymentTypes={getPaymentType.data.data}
          providers={getProviders.data.data}
          users={getUsers.data.data}
          projects={getProjects.data.data}
          activeTab={customFilters.tab}
          pagination={filters}
          paginationOptions={{
            onPaginationChange: (updater) => {
              setFilters((prev) => {
                const nextPagination =
                  typeof updater === "function"
                    ? updater({
                        pageIndex: filters.pageIndex,
                        pageSize: filters.pageSize,
                      })
                    : updater;
                return { ...prev, ...nextPagination };
              });
            },
            rowCount: data.count,
          }}
        />
      </div>
    );
  }
}

export default Page;
