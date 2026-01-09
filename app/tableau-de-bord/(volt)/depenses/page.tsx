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
import ExpensesTable from "./expenses-table";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import { BankQuery } from "@/queries/bank";

function Page() {
  const links: Array<NavLink> = [
    {
      title: "Créer une dépense",
      href: "./depenses/creer",
      hide: false,
      disabled: false,
    },
  ];
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
  const bankQuery = new BankQuery();
  const getBanks = useFetchQuery(["banks"], bankQuery.getAll, 30000);
  if (isLoading || getPurchases.isLoading || getBanks.isLoading) {
    return <LoadingPage />;
  }
  if (isError || getPurchases.isError || getBanks.isError) {
    return <ErrorPage error={error || getPurchases.error || getBanks.error || undefined} />;
  }
  if (isSuccess && getPurchases.isSuccess && getBanks.isSuccess) {
    const Statistics: Array<StatisticProps> = [
      {
        title: "Tickets en attente",
        value: data.data.filter((p) => p.status === "validated").length,
        variant: "primary",
        more: {
          title: "Montant total",
          value: XAF.format(
            data.data
              .filter((p) => p.status === "validated")
              .reduce((total, el) => total + el.price, 0)
          ),
        },
      },
      {
        title: "Tickets payés",
        value: data.data.filter((p) => p.status === "paid").length,
        variant: "secondary",
        more: {
          title: "Montant total",
          value: XAF.format(
            data.data
              .filter((p) => p.status === "paid")
              .reduce((total, el) => total + el.price, 0)
          ),
        },
      },
    ];

    return (
      <div className="content">
        <PageTitle
          title="Dépenses"
          subtitle="Consulter et traiter les dépenses."
          color="red"
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
        <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4 items-center gap-5">
          {Statistics.map((data, id) => (
            <StatisticCard key={id} {...data} className="h-full" />
          ))}
        </div>
        <ExpensesTable
          payments={data.data.filter((p) => p.status === "validated")}
          banks = {getBanks.data.data}
          type="pending"
          purchases={getPurchases.data.data}
        />
        <ExpensesTable
          payments={data.data.filter((p) => p.status === "paid")}
          type="validated"
          banks = {getBanks.data.data}
          purchases={getPurchases.data.data}
        />
      </div>
    );
  }
}

export default Page;
