"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { useFetchQuery } from "@/hooks/useData";
import { cn, XAF } from "@/lib/utils";
import { paymentQ } from "@/queries/payment";
import { purchaseQ } from "@/queries/purchase-order";
import { NavLink } from "@/types/types";
import Link from "next/link";
import ExpensesTable from "../expenses-table";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import { bankQ, BankQuery } from "@/queries/bank";

function Page() {
  const { data, isSuccess, isError, error, isLoading } = useFetchQuery(
    ["payments"],
    paymentQ.getAll,
    30000
  );
  const getPurchases = useFetchQuery(
    ["purchaseOrders"],
    purchaseQ.getAll,
    30000
  );
  const getBanks = useFetchQuery(["banks"], bankQ.getAll, 35000);
  if (isLoading || getPurchases.isLoading || getBanks.isLoading) {
    return <LoadingPage />;
  }
  if (isError || getPurchases.isError || getBanks.isError) {
    return (
      <ErrorPage
        error={error || getPurchases.error || getBanks.error || undefined}
      />
    );
  }
  if (isSuccess && getPurchases.isSuccess && getBanks.isSuccess) {
    const Statistics: Array<StatisticProps> = [
      {
        title: "Tickets en attente",
        value: data.data.filter(
          (p) => p.status === "validated" && p.type !== "CURRENT"
        ).length,
        variant: "primary",
        more: {
          title: "Montant total",
          value: XAF.format(
            data.data
              .filter((p) => p.status === "validated" && p.type !== "CURRENT")
              .reduce((total, el) => total + el.price, 0)
          ),
        },
      },
      {
        title: "Tickets payés",
        value: data.data.filter(
          (p) => p.status === "paid" && p.type !== "CURRENT"
        ).length,
        variant: "secondary",
        more: {
          title: "Montant total",
          value: XAF.format(
            data.data
              .filter((p) => p.status === "paid" && p.type !== "CURRENT")
              .reduce((total, el) => total + el.price, 0)
          ),
        },
      },
    ];

    return (
      <div className="content">
        <PageTitle
          title="Dépenses Tickets"
          subtitle="Consulter et traiter les dépenses"
          color="red"
        />

        <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4 items-center gap-5">
          {Statistics.map((data, id) => (
            <StatisticCard key={id} {...data} className="h-full" />
          ))}
        </div>
        <ExpensesTable
          payments={data.data.filter(
            (p) => p.status === "validated" && p.type !== "CURRENT"
          )}
          type="pending"
          purchases={getPurchases.data.data}
          banks={getBanks.data.data}
        />
        <ExpensesTable
          payments={data.data.filter(
            (p) => p.status === "paid" && p.type !== "CURRENT"
          )}
          type="validated"
          purchases={getPurchases.data.data}
          banks={getBanks.data.data}
        />
      </div>
    );
  }
}

export default Page;
