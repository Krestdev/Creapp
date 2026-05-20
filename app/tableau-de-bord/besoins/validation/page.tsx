"use client";

import { DataVal } from "@/components/base/dataVal";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { queryKeys } from "@/lib/query-keys";
import { approbatorRequests } from "@/lib/requests-helpers";
import { useStore } from "@/providers/datastore";
import { userQ } from "@/queries/baseModule";
import { categoryQ } from "@/queries/categoryModule";
import { projectQ } from "@/queries/projectModule";
import { purchaseQ } from "@/queries/purchase-order";
import { receptionQ } from "@/queries/reception";
import { requestQ } from "@/queries/requestModule";
import { requestTypeQ } from "@/queries/requestType";
import { DateFilter, RequestModelT } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import ApprovalFilters, { ApprovalFiltersProps } from "./filters";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { TabBar } from "@/components/base/TabBar";

const Page = () => {
  const [customFilters, setCustomFilters] = React.useState<
    ApprovalFiltersProps["customFilters"]
  >({
    search: "",
    user: "all",
    tab: "pending",
    category: "all",
    project: "all",
    status: "all",
    type: "all",
    date: undefined,
    from: "",
    to: "",
  });
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] =
    React.useState(false);
  const [dateFilter, setDateFilter] = React.useState<DateFilter>();

  const { tab, search, ...otherFilters } = customFilters;

  const [filters, setFilters] = useState({
    pageIndex: 0,
    pageSize: 15,
  });

  const tabs = [
    {
      id: "pending",
      title: "En attente",
    },
    {
      id: "processed",
      title: "Traités",
    },
  ];

  const resetAllFilters = () => {
    setCustomFilters({
      search: "",
      user: "all",
      tab: "pending",
      category: "all",
      project: "all",
      status: "all",
      type: "all",
      date: undefined,
      from: "",
      to: "",
    });
    setDateFilter(undefined);
    setIsCustomDateModalOpen(false);
    setFilters({
      pageIndex: 0,
      pageSize: 15,
    });
  };

  const categoriesData = useQuery({
    queryKey: queryKeys.categories,
    queryFn: categoryQ.getCategories,
  });
  const projectsData = useQuery({
    queryKey: queryKeys.projects,
    queryFn: projectQ.getAll,
  });

  const usersData = useQuery({
    queryKey: queryKeys.users,
    queryFn: userQ.getAll,
  });

  const requestData = useQuery({
    queryKey: queryKeys.requestsForApproval(filters, customFilters, dateFilter),
    queryFn: () =>
      requestQ.getValidatorRequests({
        pageIndex: filters.pageIndex,
        pageSize: filters.pageSize,
        search: customFilters.search || undefined,
        user: customFilters.user !== "all" ? customFilters.user : undefined,
        tab: customFilters.tab,
        category:
          customFilters.category !== "all" ? customFilters.category : undefined,
        project:
          customFilters.project !== "all" ? customFilters.project : undefined,
        status:
          customFilters.status !== "all" ? customFilters.status : undefined,
        type: customFilters.type !== "all" ? customFilters.type : undefined,
        date: customFilters.date || undefined,
        from: customFilters.from || undefined,
        to: customFilters.to || undefined,
      }),
  });

  const requestStatsData = useQuery({
    queryKey: queryKeys.requestsForApprovalStats(
      filters,
      otherFilters,
      dateFilter,
    ),
    queryFn: () =>
      requestQ.getValidatorRequestsStats({
        user: customFilters.user !== "all" ? customFilters.user : undefined,
        category:
          customFilters.category !== "all" ? customFilters.category : undefined,
        project:
          customFilters.project !== "all" ? customFilters.project : undefined,
        status:
          customFilters.status !== "all" ? customFilters.status : undefined,
        type: customFilters.type !== "all" ? customFilters.type : undefined,
        date: customFilters.date || undefined,
        from: customFilters.from || undefined,
        to: customFilters.to || undefined,
      }),
  });

  const getRequestType = useQuery({
    queryKey: queryKeys.requestTypes,
    queryFn: requestTypeQ.getAll,
  });

  const getReceptions = useQuery({
    queryKey: queryKeys.receptions,
    queryFn: receptionQ.getAll,
  });

  const getPurchases = useQuery({
    queryKey: queryKeys.purchaseOrders,
    queryFn: purchaseQ.getAll,
  });

  if (
    projectsData.isPending ||
    usersData.isPending ||
    categoriesData.isPending ||
    requestData.isPending ||
    getRequestType.isPending ||
    getReceptions.isPending ||
    getPurchases.isPending ||
    requestStatsData.isPending
  ) {
    return <LoadingPage />;
  }

  if (
    projectsData.isError ||
    usersData.isError ||
    categoriesData.isError ||
    requestData.isError ||
    getRequestType.isError ||
    getPurchases.isError ||
    getReceptions.isError ||
    requestStatsData.isError
  ) {
    return (
      <ErrorPage
        error={
          projectsData.error ||
          usersData.error ||
          categoriesData.error ||
          requestData.error ||
          getRequestType.error ||
          getReceptions.error ||
          getPurchases.error ||
          requestStatsData.error ||
          undefined
        }
      />
    );
  }
  const statistics: Array<StatisticProps> = [
    {
      title: "En attente de validation",
      value: requestStatsData.data.data.awaiting,
      variant: "primary",
      more: {
        title: "Total recus",
        value: requestStatsData.data.data.total,
      },
    },
    {
      title: "Besoins approuvés",
      value: requestStatsData.data.data.validated,
      variant: "default",
      more: {
        title: "Besoins rejetés",
        value: requestStatsData.data.data.rejected,
      },
    },
  ];

  return (
    <div className="content">
      {/* page title */}
      <PageTitle
        title="Validation des besoins"
        subtitle="Approuvez ou rejetez les besoins."
        color="green"
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
          <ApprovalFilters
            customFilters={customFilters}
            setCustomFilters={setCustomFilters}
            isCustomDateModalOpen={isCustomDateModalOpen}
            setIsCustomDateModalOpen={setIsCustomDateModalOpen}
            uniqueCategories={categoriesData.data.data}
            uniqueProjects={projectsData.data.data}
            requestTypes={getRequestType.data.data}
            setDateFilter={setDateFilter}
            resetAllFilters={resetAllFilters}
            users={usersData.data.data}
          />
        </SheetContent>
      </Sheet>
      <div className="grid-stats-4">
        {statistics.map((statistic, id) => (
          <StatisticCard key={id} {...statistic} />
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
      <DataVal
        data={requestData.data.data.data}
        empty="Aucun besoin en attente"
        isCheckable={true}
        categoriesData={categoriesData.data.data}
        projectsData={projectsData.data.data}
        usersData={usersData.data.data}
        requestTypeData={getRequestType.data.data}
        purchaseOrders={getPurchases.data.data}
        receptions={getReceptions.data.data}
        tab={customFilters.tab}
        pagination={filters}
        paginationOptions={{
          onPaginationChange: (updater) => {
            setFilters((prev) => {
              const nextPagination =
                typeof updater === "function" ? updater(prev) : updater;
              return { ...prev, ...nextPagination };
            });
          },
          //rowCount: data.count,
        }}
      />
    </div>
  );
};

export default Page;
