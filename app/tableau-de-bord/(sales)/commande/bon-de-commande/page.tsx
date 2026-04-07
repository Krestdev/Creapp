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
import { isRole, XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { paymentQ } from "@/queries/payment";
import { purchaseQ } from "@/queries/purchase-order";
import { BonsCommande, NavLink } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { PurchaseTable } from "./PurchaseTable";
import { CommandConditionQ } from "@/queries/commandsConditions";
import { invoiceQ } from "@/queries/invoices";
import { receptionQ } from "@/queries/reception";
import { userQ } from "@/queries/baseModule";

const Page = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const { isSuccess, isError, error, isLoading, data } = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: purchaseQ.getAll,
  });

  const getPayments = useQuery({
    queryKey: ["payments"],
    queryFn: paymentQ.getAll,
  });

  const getConditions = useQuery({
    queryKey: ["conditions"],
    queryFn: () => CommandConditionQ.getAll(),
  });

  const getInvoices = useQuery({
    queryKey: ["invoices"],
    queryFn: invoiceQ.getAll,
  });

  const getReceptions = useQuery({
    queryKey: ["receptions"],
    queryFn: receptionQ.getAll,
  });

  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: userQ.getAll,
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
    getPayments.isLoading ||
    getConditions.isLoading ||
    getInvoices.isLoading ||
    getReceptions.isLoading ||
    getUsers.isLoading
  ) {
    return <LoadingPage />;
  }
  if (
    isError ||
    getPayments.isError ||
    getConditions.isError ||
    getInvoices.isError ||
    getReceptions.isError ||
    getUsers.isError
  ) {
    return (
      <ErrorPage
        error={
          error ||
          getPayments.error ||
          getInvoices.error ||
          getConditions.error ||
          getReceptions.error ||
          getUsers.error ||
          undefined
        }
      />
    );
  }
  if (
    isSuccess &&
    getPayments.isSuccess &&
    getConditions.isSuccess &&
    getInvoices.isSuccess &&
    getReceptions.isSuccess &&
    getUsers.isSuccess
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
          payments={getPayments.data.data}
          conditions={getConditions.data.data}
          invoices={getInvoices.data.data}
          users={getUsers.data.data}
        />
      </div>
    );
};

export default Page;
