"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { useFetchQuery } from "@/hooks/useData";
import { cn } from "@/lib/utils";
import { PaymentQueries } from "@/queries/payment";
import { PurchaseOrder } from "@/queries/purchase-order";
import { NavLink } from "@/types/types";
import Link from "next/link";
import ExpensesTable from "./expenses-table";

function Page() {
  const links: Array<NavLink> = [
      {
        title: "Créer une dépense",
        href: "./depenses/creer",
        hide: false,
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
  if ( isLoading || getPurchases.isLoading ) {
    return <LoadingPage />;
  }
  if (isError || getPurchases.isError) {
    return <ErrorPage error={error || getPurchases.error || undefined} />;
  }
  if (isSuccess && getPurchases.isSuccess) {
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
        <ExpensesTable payments={data.data.filter(p=> p.status === "validated")} purchases={getPurchases.data.data} />
      </div>
    );
  }
}

export default Page;
