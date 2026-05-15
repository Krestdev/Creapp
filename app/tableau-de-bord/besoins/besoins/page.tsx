"use client";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { queryKeys } from "@/lib/query-keys";
import { useStore } from "@/providers/datastore";
import { userQ } from "@/queries/baseModule";
import { categoryQ } from "@/queries/categoryModule";
import { useFilters } from "@/queries/filters/standard-filter";
import { projectQ } from "@/queries/projectModule";
import { purchaseQ } from "@/queries/purchase-order";
import { receptionQ } from "@/queries/reception";
import { requestQ } from "@/queries/requestModule";
import { requestTypeQ } from "@/queries/requestType";
import { DateFilter } from "@/types/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Settings2 } from "lucide-react";
import React, { useState } from "react";
import Filters from "./filters";
import { RequestsTable } from "./table-besoins";

function Page() {
  const { user } = useStore();

  const [customFilters, setCustomFilters] = useState<{
    search: string;
    user: string;
    category: string;
    project: string;
    status: string;
    type: string;
    date: DateFilter;
    from: string;
    to: string;
  }>({
    search: "",
    user: "all",
    category: "all",
    project: "all",
    status: "all",
    type: "all",
    date: undefined,
    from: "",
    to: "",
  });
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>();

  const { filters, setFilters } = useFilters();
  const paginationState = {
    pageIndex: filters.pageIndex,
    pageSize: filters.pageSize,
  };

  const {
    data: requests,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["requests", filters, customFilters, dateFilter],
    queryFn: async () =>
      requestQ.getAll({
        pageIndex: filters.pageIndex,
        pageSize: filters.pageSize,
        search: customFilters.search || undefined,
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
    enabled: !!user,
    placeholderData: keepPreviousData,
  });

  const {
    data: stats,
    isLoading: isLoadingStats,
    isError: isErrorStats,
    error: errorStats,
    isSuccess: isSuccessStats,
  } = useQuery({
    queryKey: ["requests", "stats", filters, customFilters, dateFilter],
    queryFn: async () =>
      requestQ.getStats({
        pageIndex: filters.pageIndex,
        pageSize: filters.pageSize,
        search: customFilters.search || undefined,
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
    enabled: !!user,
    placeholderData: keepPreviousData,
  });

  const categoryData = useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      return categoryQ.getCategories();
    },
  });

  const projectsData = useQuery({
    queryKey: queryKeys.projects,
    queryFn: async () => {
      return projectQ.getAll();
    },
  });

  const requestTypes = useQuery({
    queryKey: queryKeys.requestType,
    queryFn: requestTypeQ.getAll,
  });

  const usersData = useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => userQ.getAll(),
  });

  // Réinitialiser tous les filtres
  const resetAllFilters = () => {
    setCustomFilters({
      search: "",
      user: "all",
      category: "all",
      project: "all",
      status: "all",
      type: "all",
      date: undefined,
      from: "",
      to: "",
    });
    setFilters({
      pageIndex: 0,
      pageSize: 10,
    });
  };

  const uniqueCategories = React.useMemo(() => {
    if (!requests?.data.data || !categoryData.data?.data) return [];
    return [
      ...new Set(
        categoryData.data.data.map((req) => {
          return { id: req.id, label: req.label };
        }),
      ),
    ];
  }, [requests, categoryData.data]);

  const uniqueProjects = React.useMemo(() => {
    if (!requests?.data.data || !projectsData.data?.data) return [];

    return [
      ...new Set(
        projectsData.data.data.map((req) => {
          return { id: req.id, label: `Projet ${req.label}` };
        }),
      ),
    ];
  }, [requests, projectsData.data]);

  // Client-side filtering is replaced by server-side filtering via API.

  if (
    isLoading ||
    categoryData.isLoading ||
    projectsData.isLoading ||
    requestTypes.isLoading ||
    usersData.isLoading
  ) {
    return <LoadingPage />;
  }
  if (
    isError ||
    categoryData.isError ||
    projectsData.isError ||
    requestTypes.isError ||
    usersData.isError
  ) {
    return (
      <ErrorPage
        error={
          error ||
          categoryData.error ||
          projectsData.error ||
          requestTypes.error ||
          usersData.error ||
          undefined
        }
      />
    );
  }
  if (
    isSuccess &&
    categoryData.isSuccess &&
    projectsData.isSuccess &&
    requestTypes.isSuccess &&
    usersData.isSuccess
  ) {
    const Statistics: Array<StatisticProps> = [
      {
        title: "En attente de validation",
        value: stats?.data.awaiting || 0,
        variant: "secondary",
        more: {
          title: "Besoins rejetés",
          value: stats?.data.rejected || 0,
        },
      },
      {
        title: "Besoins émis",
        value: stats?.data.sent || 0,
        variant: "primary",
        more: {
          title: "Besoins approuvés",
          value: stats?.data.validated || 0,
        },
      },
      {
        title: "Besoins Déstockés",
        value: stats?.data.fromStore || 0,
        variant: "default",
        more: {
          title: "Besoins annulés",
          value: stats?.data.cancelled || 0,
        },
      },
    ];
    return (
      <div className="content">
        <PageTitle
          title="Tous les besoins"
          subtitle="Accedez à l'ensemble des besoins emis sur l'application."
          color="red"
        />
        <Sheet>
          <SheetTrigger asChild className="w-fit">
            <Button variant={"outline"}>
              <Settings2 />
              {"Filtres"}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{"Filtres"}</SheetTitle>
              <SheetDescription>
                {"Configurer les filtres pour affiner les données"}
              </SheetDescription>
            </SheetHeader>
            <div className="px-5 grid gap-5">
              <div className="grid gap-1.5">
                <Label htmlFor="search">{"Rechercher"}</Label>
                <Input
                  placeholder="Titre ou référence"
                  name="search"
                  type="search"
                  value={customFilters.search ?? ""}
                  onChange={(event) =>
                    setCustomFilters({
                      ...customFilters,
                      search: event.target.value,
                    })
                  }
                  className="w-full"
                />
              </div>
              <Filters
                customFilters={customFilters}
                setCustomFilters={setCustomFilters}
                isCustomDateModalOpen={isCustomDateModalOpen}
                setIsCustomDateModalOpen={setIsCustomDateModalOpen}
                setDateFilter={(filter) =>
                  setCustomFilters({ ...customFilters, date: filter })
                }
                resetAllFilters={resetAllFilters}
                uniqueCategories={uniqueCategories}
                uniqueProjects={uniqueProjects}
                users={usersData.data}
              />
            </div>
          </SheetContent>
        </Sheet>
        <div className="grid-stats-4">
          {Statistics.map((statistic, id) => (
            <StatisticCard key={id} {...statistic} />
          ))}
        </div>
        <RequestsTable
          data={requests.data.data}
          categories={categoryData.data.data}
          projects={projectsData.data.data}
          // payments={paymentsData.data.data}
          requestTypes={requestTypes.data.data}
          users={usersData.data.data}
          paginationOptions={{
            onPaginationChange: (updater) => {
              setFilters((prev) => {
                const nextPagination =
                  typeof updater === "function"
                    ? updater({
                        pageIndex: prev.pageIndex,
                        pageSize: prev.pageSize,
                      })
                    : updater;
                return { ...prev, ...nextPagination };
              });
            },
            rowCount: requests.data.total || requests.data.data.length,
          }}
          pagination={paginationState}
        />
      </div>
    );
  }
}

export default Page;
