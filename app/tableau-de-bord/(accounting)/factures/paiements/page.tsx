"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { PaiementsTable } from "@/components/tables/PaiementsTable";
import { paymentQ } from "@/queries/payment";
import { purchaseQ } from "@/queries/purchase-order";
import { NavLink } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

function Page() {
  const links: Array<NavLink> = [
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
          links={links}
        />
        <PaiementsTable
          payments={getPayments.data.data.filter((p) => p.type === "achat")}
          purchases={getPurchases.data.data}
        />
      </div>
    );
}

export default Page;
