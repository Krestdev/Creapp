"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { useFetchQuery } from "@/hooks/useData";
import { paymentQ } from "@/queries/payment";
import { purchaseQ } from "@/queries/purchase-order";
import { InvoicesTable } from "./invoices-table";

function Page() {
  const paymentQuery = new PaymentQueries();
  const commandQuery = new PurchaseOrder();
  const getPayments = useFetchQuery(["payments"], paymentQuery.getAll, 15000);
  const getPurchases = useFetchQuery(
    ["purchaseOrders"],
    commandQuery.getAll,
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
          subtitle={"Vérification de la conformité des factures"}
          color={"red"}
        />
        <InvoicesTable
          payments={getPayments.data.data.filter((p) => p.type === "achat")}
          purchases={getPurchases.data.data}
        />
      </div>
    );
}

export default Page;
