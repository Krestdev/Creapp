'use client'
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { PaiementsTable } from "@/components/tables/PaiementsTable";
import { Button } from "@/components/ui/button";
import { useFetchQuery } from "@/hooks/useData";
import { useStore } from "@/providers/datastore";
import { PaymentQueries } from "@/queries/payment";
import { PurchaseOrder } from "@/queries/purchase-order";
import Link from "next/link";

 function Page(){
  const { user } = useStore();
  const isAuth:boolean = user?.role.some(r => r.label === "ADMIN" || r.label === "SALES" || r.label === "SALES_MANAGER") ?? false
  
  if(!isAuth){
    return <ErrorPage statusCode={401} message="Vous n'avez pas accès à cette page"/>
  }
  
  const links = [
    {
      title: "Créer un paiement",
      href: "./paiements/creer",
    },
  ];

  const paymentQuery = new PaymentQueries();
  const commandQuery = new PurchaseOrder();
  const getPayments = useFetchQuery(["payments"], paymentQuery.getAll, 15000);
  const getPurchases = useFetchQuery(["purchaseOrders"], commandQuery.getAll, 15000);

  if(getPayments.isLoading || getPurchases.isLoading){
    return <LoadingPage/>
  }

  if(getPayments.isError || getPurchases.isError){
    return <ErrorPage />
  }

  if(getPayments.isSuccess && getPurchases.isSuccess)
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
      <PaiementsTable payments={getPayments.data.data.filter(p=>p.type === "PURCHASE")} purchases={getPurchases.data.data} />
    </div>
  );
};

export default Page;
