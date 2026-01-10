"use client";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import { AreaChartDataItem, ChartArea } from "@/components/Charts/area-chart";
import {
  ChartDataItem,
  ChartPieDonut,
} from "@/components/Charts/chart-pie-donut";
import { DateRangePicker } from "@/components/dateRangePicker";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useFetchQuery } from "@/hooks/useData";
import { getRandomColor, XAF } from "@/lib/utils";
import { purchaseQ } from "@/queries/purchase-order";
import { BonsCommande } from "@/types/types";
import React, { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import AreaPurchaseChart from "./purchase-period";
import PieProviderPurchase from "./purchase-pie-provider";

function Page() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const { isSuccess, isError, error, isLoading, data } = useFetchQuery(
    ["purchaseOrders"],
    purchaseQ.getAll
  );

  const filteredData: Array<BonsCommande> = useMemo(() => {
    const list = data?.data ?? [];
    if (!dateRange) return list;

    const from = dateRange?.from;
    const to = dateRange?.to;

    return list.filter((item) => {
      let matchDate = true; //Date filter

      const start = new Date(item.createdAt);
      console.log(start);
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

  const Statistics: Array<StatisticProps> = [
    {
      title: "Total Bons de commande",
      value: filteredData.length,
      variant: "primary",
      more: {
        title: "Montant Total",
        value: XAF.format(
          filteredData.reduce(
            (total, item) =>
              total +
              item.devi.element.reduce(
                (t, e) => t + e.priceProposed * e.quantity,
                0
              ),
            0
          )
        ),
      },
    },
    {
      title: "En attente",
      value: filteredData.filter(
        (c) => c.status === "PENDING" || c.status === "IN-REVIEW"
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
      variant: "success", //Ajouter les livrés plus tard
    },
  ];

  if (isLoading) {
    return <LoadingPage />;
  }
  if (isError) {
    return <ErrorPage error={error ?? isError ?? undefined} />;
  }
  if (isSuccess)
    return (
      <div className="content">
        <PageTitle
          title="Statistiques"
          subtitle="Chiffres et graphiques associés aux bons de commande"
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
        {/**Graphics Here !! */}
        <div className="grid-stats-4">
          <div className="p-6 rounded-md border w-full h-full flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3>{"Répartition des bons de commande par période"}</h3>
            </div>
            <AreaPurchaseChart data={filteredData} dateFilter={dateRange} />
          </div>
          <div className="p-6 rounded-md border w-full h-full flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3>{"Bons de commande par fournisseur"}</h3>
            </div>
            <PieProviderPurchase data={filteredData} />
          </div>
        </div>
      </div>
    );
}

export default Page;
