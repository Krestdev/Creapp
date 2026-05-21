"use client";

import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import { DateRangePicker } from "@/components/dateRangePicker";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { queryKeys } from "@/lib/query-keys";
import { isRole, XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { userQ } from "@/queries/baseModule";
import { CommandConditionQ } from "@/queries/commandsConditions";
import { invoiceQ } from "@/queries/invoices";
import { payTypeQ } from "@/queries/payType";
import { purchaseQ } from "@/queries/purchase-order";
import { quotationQ } from "@/queries/quotation";
import { receptionQ } from "@/queries/reception";
import { BonsCommande, NavLink } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { PurchaseTable } from "./PurchaseTable";

const Page = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const { isSuccess, isError, error, isLoading, data } = useQuery({
    queryKey: queryKeys.purchaseOrders,
    queryFn: purchaseQ.getAll,
  });

  const getConditions = useQuery({
    queryKey: queryKeys.conditions,
    queryFn: () => CommandConditionQ.getAll(),
  });

  const getInvoices = useQuery({
    queryKey: queryKeys.invoices,
    queryFn: invoiceQ.getAll,
  });

  const getReceptions = useQuery({
    queryKey: queryKeys.receptions,
    queryFn: receptionQ.getAll,
  });

  const getUsers = useQuery({
    queryKey: queryKeys.users,
    queryFn: userQ.getAll,
  });

  const getQuotations = useQuery({
    queryKey: queryKeys.quotations,
    queryFn: quotationQ.getAll,
  });

  const getPaymentType = useQuery({
    queryKey: queryKeys.paymentTypes,
    queryFn: payTypeQ.getAll,
  });

  const { user } = useStore();
  const auth = isRole({
    roleList: user?.role || [],
    role: "Donner d'ordre achat",
  });

  const receptions = useMemo(() => {
    if (!getReceptions.data) return [];
    return getReceptions.data.data.filter((r) => r.Status !== "COMPLETED");
  }, [getReceptions.data]);

  const filteredData: Array<BonsCommande> = useMemo(() => {
    const list = data?.data ?? [];
    if (!dateRange) return list;

    const from = dateRange?.from;
    const to = dateRange?.to;

    return list.filter((item) => {
      let matchDate = true; //Date filter

      const start = new Date(item.createdAt);
      if (from && !to) {
        matchDate = start >= from;
      } else if (!from && to) {
        matchDate = start <= to;
      } else if (from && to) {
        matchDate = start >= from && start <= to;
      }

      return matchDate;
    });
  }, [data?.data, dateRange]);

  const links: Array<NavLink> = [
    {
      title: "Créer un bon",
      href: "./bon-de-commande/creer",
      hide: false,
    },
    {
      title: "Statistiques",
      href: "./bon-de-commande/statistiques",
      disabled: false,
    },
    {
      title: "Receptions",
      href: "./bon-de-commande/receptions",
      disabled: false,
      badge: receptions.length > 0 ? receptions.length : undefined,
    },
  ];

  const Statistics: Array<StatisticProps> = [
    {
      title: "Total Bons de commande",
      value: filteredData.length,
      variant: "primary",
      more: {
        title: "Montant Total",
        value: XAF.format(
          filteredData.reduce((total, item) => total + item.netToPay, 0),
        ),
      },
    },
    {
      title: "En attente",
      value: filteredData.filter(
        (c) => c.status === "PENDING" || c.status === "IN-REVIEW",
      ).length,
      variant: "secondary",
      more: {
        title: "Rejetés",
        value: filteredData.filter((c) => c.status === "REJECTED").length,
      },
    },
    {
      title: "Validés",
      value: filteredData.filter((c) => c.status === "APPROVED").length,
      variant: "success",
      more: {
        title: "Montant Total",
        value: XAF.format(
          filteredData
            .filter((c) => c.status === "APPROVED")
            .reduce((total, item) => total + item.netToPay, 0),
        ),
      },
    },
  ];

  if (
    isLoading ||
    getConditions.isLoading ||
    getInvoices.isLoading ||
    getReceptions.isLoading ||
    getUsers.isLoading ||
    getQuotations.isLoading ||
    getPaymentType.isLoading
  ) {
    return <LoadingPage />;
  }
  if (
    isError ||
    getConditions.isError ||
    getInvoices.isError ||
    getReceptions.isError ||
    getUsers.isError ||
    getQuotations.isError ||
    getPaymentType.isError
  ) {
    return (
      <ErrorPage
        error={
          error ||
          getInvoices.error ||
          getConditions.error ||
          getReceptions.error ||
          getUsers.error ||
          getQuotations.error ||
          getPaymentType.error ||
          undefined
        }
      />
    );
  }
  if (
    isSuccess &&
    getConditions.isSuccess &&
    getInvoices.isSuccess &&
    getReceptions.isSuccess &&
    getUsers.isSuccess &&
    getQuotations.isSuccess &&
    getPaymentType.isSuccess
  )
    return (
      <div className="content">
        <PageTitle
          title="Bons de commande"
          subtitle="Approbation des bons de commande"
          links={links}
        />
        <div className="flex flex-wrap items-end gap-3">
          <div className="grid gap-2">
            <Label htmlFor="date">{"Période"}</Label>
            <DateRangePicker
              date={dateRange}
              onChange={setDateRange}
              className="min-w-40"
            />
          </div>
          <Button variant={"outline"} onClick={() => setDateRange(undefined)}>
            {"Réinitialiser"}
          </Button>
        </div>

        <div className="grid-stats-4">
          {Statistics.map((data, id) => (
            <StatisticCard key={id} {...data} className="h-full" />
          ))}
        </div>
        <PurchaseTable
          data={filteredData}
          conditions={getConditions.data.data}
          invoices={getInvoices.data.data}
          users={getUsers.data.data}
          quotations={getQuotations.data.data}
          paytypes={getPaymentType.data.data}
        />
      </div>
    );
};

export default Page;
