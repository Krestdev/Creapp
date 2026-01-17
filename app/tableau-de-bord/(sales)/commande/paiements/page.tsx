"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { PaiementsTable } from "@/components/tables/PaiementsTable";
import { Button } from "@/components/ui/button";
import { useStore } from "@/providers/datastore";
import { paymentQ } from "@/queries/payment";
import { purchaseQ } from "@/queries/purchase-order";
import { useQuery } from "@tanstack/react-query";
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

  const links = [
    {
      title: "Créer un paiement",
      href: "./paiements/creer",
    },
  ];

  const getPayments = useQuery({
    queryKey: ["payments"],
    queryFn: paymentQ.getAll,
  });
  const getPurchases = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: purchaseQ.getAll,
  });

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
          title={"Paiements"}
          subtitle={
            "Créez et gérez les paiements des factures relatives aux bons de commande"
          }
          color={"red"}
        >
          {links.map((x) => (
            <Link href={x.href} key={x.title}>
              <Button variant={"ghost"}>{x.title}</Button>
            </Link>
          ))}
        </PageTitle>
        <PaiementsTable
          payments={getPayments.data.data.filter((p) => p.type === "achat")}
          purchases={getPurchases.data.data}
        />
      </div>
    );
}

export default Page;
