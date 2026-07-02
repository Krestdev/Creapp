"use client";

import Empty from "@/components/base/empty";
import { TabBar } from "@/components/base/TabBar";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { queryKeys } from "@/lib/query-keys";
import { XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { userQ } from "@/queries/baseModule";
import { paymentQ } from "@/queries/payment";
import { payTypeQ } from "@/queries/payType";
import { projectQ } from "@/queries/projectModule";

import { requestTypeQ } from "@/queries/requestType";
import { DateFilter } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { TicketTable } from "./ticket-table";
import { TicketFiltersProps } from "./ticketFilters";

function Page() {
  const { user } = useStore();

  const [isCustomDateModalOpen, setIsCustomDateModalOpen] =
    React.useState(false);
  const [dateFilter, setDateFilter] = React.useState<DateFilter>();

  const [customFilters, setCustomFilters] = React.useState<
    TicketFiltersProps["customFilters"]
  >({
    search: "",
    tab: "pending",
    priority: "all",
    type: "all",
    date: undefined,
    from: "",
    to: "",
  });

  const { tab, search, ...otherFilters } = customFilters;

  const resetAllFilters = () => {
    setCustomFilters({
      search: "",
      tab: "pending",
      priority: "all",
      type: "all",
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

  const { data, isSuccess, isError, error, isLoading } = useQuery({
    queryKey: queryKeys.tickets(customFilters, pagination, dateFilter),
    queryFn: () =>
      paymentQ.getTickets({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        search: customFilters.search || undefined,
        tab: customFilters.tab,
        priority:
          customFilters.priority !== "all" ? customFilters.priority : undefined,
        type: customFilters.type !== "all" ? customFilters.type : undefined,
        date: customFilters.date || undefined,
        from: customFilters.from || undefined,
        to: customFilters.to || undefined,
      }),
  });

  const getStats = useQuery({
    queryKey: queryKeys.ticketsStats(otherFilters, dateFilter),
    queryFn: () =>
      paymentQ.getTicketsStats({
        priority:
          customFilters.priority !== "all" ? customFilters.priority : undefined,
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



  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: userQ.getAll,
  });

  const getProjects = useQuery({
    queryKey: queryKeys.projects,
    queryFn: projectQ.getAll,
  });

  const getPayTypes = useQuery({
    queryKey: queryKeys.paymentTypes,
    queryFn: payTypeQ.getAll,
  });

  if (
    isLoading ||
    getRequestType.isLoading ||
    getUsers.isLoading ||
    getProjects.isLoading ||
    getPayTypes.isLoading ||
    getStats.isLoading
  ) {
    return <LoadingPage />;
  }

  if (
    isError ||
    getRequestType.isError ||
    getUsers.isError ||
    getProjects.isError ||
    getPayTypes.isError ||
    getStats.isError
  ) {
    return (
      <ErrorPage
        error={
          error ||
          getRequestType.error! ||
          getUsers.error ||
          getProjects.error ||
          getPayTypes.error ||
          getStats.error
        }
      />
    );
  }

  if (
    isSuccess &&
    getRequestType.isSuccess &&
    getUsers.isSuccess &&
    getProjects.isSuccess &&
    getPayTypes.isSuccess &&
    getStats.isSuccess
  ) {
    const tabs = [
      {
        id: "pending",
        title: "Tickets en attente",
        badge: getStats.data.pending.count,
      },
      {
        id: "processed",
        title: "Tickets traités",
      },
      {
        id: "paid",
        title: "Tickets payés",
      },
    ];

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
    ];

    return (
      <div className="flex flex-col gap-6">
        <PageTitle
          title="Tickets"
          subtitle="Consultez et payez les tickets."
          color="red"
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
        <TicketTable
          data={data.data}
          requestTypeData={getRequestType.data.data}
          users={getUsers.data.data}
          projects={getProjects.data.data}
          payTypes={getPayTypes.data.data}
          pagination={pagination}
          paginationOptions={{
            onPaginationChange: (updater) => {
              setPagination((prev) => {
                const nextPagination =
                  typeof updater === "function" ? updater(prev) : updater;
                return { ...prev, ...nextPagination };
              });
            },
            rowCount: data.count,
          }}
          filters={{
            customFilters,
            setCustomFilters,
            setDateFilter,
            resetAllFilters,
            isCustomDateModalOpen,
            setIsCustomDateModalOpen
          }}
        />
      </div>
    );
  }
}

export default Page;
