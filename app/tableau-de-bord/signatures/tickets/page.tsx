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
import { requestTypeQ } from "@/queries/requestType";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Settings2 } from "lucide-react";
import React from "react";
import ExpensesTableSign from "./expenses-table-sign";
import PaymentSignatureFilters, {
  PaymentSignatureFiltersProps,
} from "./payment-signature-filters";

function Page() {
  const { user } = useStore();

  const [customFilters, setCustomFilters] = React.useState<
    PaymentSignatureFiltersProps["customFilters"]
  >({
    search: "",
    amount: 0,
    amountType: "greater",
    priority: "all",
    tab: "pending",
  });

  const { tab, search, ...otherFilters } = customFilters;

  const resetAllFilters = () => {
    setCustomFilters({
      search: "",
      amount: 0,
      amountType: "greater",
      priority: "all",
      tab: "pending",
    });
  };

  const [filters, setFilters] = React.useState({
    pageIndex: 0,
    pageSize: 15,
  });

  const { data, isSuccess, isError, error, isLoading } = useQuery({
    queryKey: queryKeys.signatureRequests(filters, customFilters),
    queryFn: () =>
      paymentQ.getSignatureRequests({
        pageIndex: filters.pageIndex,
        pageSize: filters.pageSize,
        search: customFilters.search || undefined,
        tab: customFilters.tab,
        amount: customFilters.amount || 0,
        amountType: customFilters.amountType,
        priority:
          customFilters.priority !== "all" ? customFilters.priority : undefined,
      }),
    enabled: !!user,
    placeholderData: keepPreviousData,
  });

  const getStats = useQuery({
    queryKey: queryKeys.signatureRequestsStats(otherFilters),
    queryFn: () =>
      paymentQ.getSignatureRequestsStats({
        amount: customFilters.amount || 0,
        amountType: customFilters.amountType,
        priority:
          customFilters.priority !== "all" ? customFilters.priority : undefined,
      }),
    enabled: !!user,
    placeholderData: keepPreviousData,
  });

  const getRequestType = useQuery({
    queryKey: queryKeys.requestTypes,
    queryFn: requestTypeQ.getAll,
  });

  const getPayType = useQuery({
    queryKey: queryKeys.paymentTypes,
    queryFn: payTypeQ.getAll,
  });

  const getUsers = useQuery({
    queryKey: queryKeys.users,
    queryFn: userQ.getAll,
  });
  const getProjects = useQuery({
    queryKey: queryKeys.projects,
    queryFn: projectQ.getAll,
  });

  const tabs = [
    {
      id: "pending",
      title: "Tickets en attente",
      badge: getStats.data?.pending?.count || 0,
    },
    {
      id: "signed",
      title: "Tickets signés",
      badge: getStats.data?.signed?.count || 0,
    },
  ];

  if (
    isLoading ||
    getRequestType.isLoading ||
    getPayType.isLoading ||
    getProjects.isLoading ||
    getUsers.isLoading ||
    getStats.isLoading
  ) {
    return <LoadingPage />;
  }

  if (
    isError ||
    getRequestType.isError ||
    getPayType.isError ||
    getProjects.isError ||
    getUsers.isError ||
    getStats.isError
  ) {
    return (
      <ErrorPage
        error={
          error ||
          getRequestType.error ||
          getPayType.error ||
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
    getPayType.isSuccess &&
    getProjects.isSuccess &&
    getUsers.isSuccess &&
    getStats.isSuccess
  ) {
    const Statistics: Array<StatisticProps> = [
      {
        title: "En attente signature",
        value: getStats.data.pending.count || 0,
        variant: "secondary",
        more: {
          title: "Montant total",
          value: XAF.format(getStats.data.pending.sum || 0),
        },
      },
      {
        title: "Signés",
        value: getStats.data.signed.count || 0,
        variant: "success",
        more: {
          title: "Montant total",
          value: XAF.format(getStats.data.signed.sum || 0),
        },
      },
    ];

    return (
      <div className="content">
        <PageTitle
          title="Signatures"
          subtitle="Consultez les demandes de signature liées aux retraits bancaires"
          color="blue"
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
            <div className="px-2 mt-4 space-y-4">
              <PaymentSignatureFilters
                customFilters={customFilters}
                setCustomFilters={setCustomFilters}
                resetAllFilters={resetAllFilters}
              />
            </div>
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
            setCustomFilters({
              ...customFilters,
              tab: value as "pending" | "signed",
            });
            setFilters((prev) => ({ ...prev, pageIndex: 0 }));
          }}
          selectedTab={customFilters.tab}
          className="w-fit"
        />

        <ExpensesTableSign
          payments={data.data}
          requestTypes={getRequestType.data.data}
          payType={getPayType.data.data}
          projects={getProjects.data.data}
          users={getUsers.data.data}
          pagination={filters}
          paginationOptions={{
            onPaginationChange: (updater) => {
              setFilters((prev) => {
                const nextPagination =
                  typeof updater === "function" ? updater(prev) : updater;
                return { ...prev, ...nextPagination };
              });
            },
            rowCount: data.count,
          }}
        />
      </div>
    );
  }

  return null;
}

export default Page;
