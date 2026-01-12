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
import { useFetchQuery } from "@/hooks/useData";
import { useStore } from "@/providers/datastore";
import { purchaseQ } from "@/queries/purchase-order";
import { BonsCommande, NavLink } from "@/types/types";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { PurchaseTable } from "./PurchaseTable";
import { cn, isRole, XAF } from "@/lib/utils";

const Page = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const { isSuccess, isError, error, isLoading, data } = useFetchQuery(
    ["purchaseOrders"],
    purchaseQ.getAll
  );

  const { user } = useStore();
  const auth = isRole({
    roleList: user?.role || [],
    role: "Donner d'ordre achat",
  });

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
    },
  ];

  console.log(filteredData);

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
      variant: "success",
      more: {
        title: "Montant Total",
        value: XAF.format(
          filteredData
            .filter((c) => c.status === "APPROVED")
            .reduce(
              (total, item) =>
                total +
                item.devi.element
                  .filter((o) => o.status === "SELECTED")
                  .reduce((t, e) => t + e.priceProposed * e.quantity, 0),
              0
            )
        ),
      },
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
          title="Bons de commande"
          subtitle="Approbation des bons de commande"
        >
          {links
            .filter((x) => (!x.hide ? true : x.hide === true && false))
            .map((link, id) => {
              const isLast = links.length > 1 ? id === links.length - 1 : false;
              return (
                <Link
                  key={id}
                  href={link.href}
                  onClick={(e) => {
                    link.disabled && e.preventDefault();
                  }}
                  className={cn(link.disabled && "cursor-not-allowed")}
                >
                  <Button
                    size={"lg"}
                    variant={isLast ? "accent" : "ghost"}
                    disabled={link.disabled}
                  >
                    {link.title}
                  </Button>
                </Link>
              );
            })}
        </PageTitle>
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

        <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4 items-center gap-5">
          {Statistics.map((data, id) => (
            <StatisticCard key={id} {...data} className="h-full" />
          ))}
        </div>
        <PurchaseTable data={filteredData} />
      </div>
    );
};

export default Page;
