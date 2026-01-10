"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { useFetchQuery } from "@/hooks/useData";
import { cn, XAF } from "@/lib/utils";
import { PaymentQueries } from "@/queries/payment";
import { PurchaseOrder } from "@/queries/purchase-order";
import { NavLink } from "@/types/types";
import Link from "next/link";
import ExpensesTable from "../expenses-table";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import { BankQuery } from "@/queries/bank";
import { RequestTypeQueries } from "@/queries/requestType";

function Page() {
  const paymentsQuery = new PaymentQueries();
  const { data, isSuccess, isError, error, isLoading } = useFetchQuery(
    ["payments"],
    paymentsQuery.getAll,
    30000
  );
  const purchasesQuery = new PurchaseOrder();
  const getPurchases = useFetchQuery(
    ["purchaseOrders"],
    purchasesQuery.getAll,
    30000
  );
  const requestTypeQueries = new RequestTypeQueries();
  const getRequestType = useFetchQuery(["requestType"], requestTypeQueries.getAll, 30000);

  const bankQuery = new BankQuery();
  const getBanks = useFetchQuery(["banks"], bankQuery.getAll, 35000);
  if (isLoading || getPurchases.isLoading || getRequestType.isLoading || getBanks.isLoading) {
    return <LoadingPage />;
  }
  if (isError || getPurchases.isError || getRequestType.isError || getBanks.isError) {
    return <ErrorPage error={error || getPurchases.error || getRequestType.error || getBanks.error || undefined} />;
  }
  if (isSuccess && getPurchases.isSuccess && getRequestType.isSuccess && getBanks.isSuccess) {
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
          requestTypes={getRequestType.data.data}
        />
        <ExpensesTable
          payments={data.data.filter(
            (p) => p.status === "paid" && p.type !== "CURRENT"
          )}
          type="validated"
          purchases={getPurchases.data.data}
          banks={getBanks.data.data}
          requestTypes={getRequestType.data.data}
        />
      </div>
    );
  }
}

export default Page;
