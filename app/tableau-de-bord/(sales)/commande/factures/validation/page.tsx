"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { PaiementsTable } from "@/components/tables/PaiementsTable";
import { PaiementValTable } from "@/components/tables/PaiementValTable";
import { Button } from "@/components/ui/button";
import { useFetchQuery } from "@/hooks/useData";
import { useStore } from "@/providers/datastore";
import { paymentQ } from "@/queries/payment";
import { purchaseQ } from "@/queries/purchase-order";
import Link from "next/link";

function Page() {
  const { user } = useStore();
  const isAuth: boolean =
    user?.role.some(
      (r) =>
        r.label === "ADMIN" ||
        r.label === "SALES" ||
        r.label === "SALES_MANAGER"
    ) ?? false;

  if (!isAuth) {
    return (
      <ErrorPage
        statusCode={401}
        message="Vous n'avez pas accès à cette page"
      />
    );
  }

  const getPayments = useFetchQuery(["payments"], paymentQ.getAll, 15000);
  const getPurchases = useFetchQuery(
    ["purchaseOrders"],
    purchaseQ.getAll,
    15000
  );

  if (getPayments.isLoading || getPurchases.isLoading) {
    return <LoadingPage />;
  }

  if (getPayments.isError || getPurchases.isError) {
    return <ErrorPage />;
  }

  if (getPayments.isSuccess && getPurchases.isSuccess)
    return (
      <div className="flex flex-col gap-6">
        <PageTitle
          title={"Factures"}
          subtitle={
            "Validez la conformité des factures relatives aux paiements"
          }
          color={"red"}
        />
        <PaiementValTable
          payments={getPayments.data.data.filter((p) => p.type === "PURCHASE")}
          purchases={getPurchases.data.data}
        />
      </div>
    );
}

export default Page;
