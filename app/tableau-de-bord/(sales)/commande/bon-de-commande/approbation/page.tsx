"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { useStore } from "@/providers/datastore";
import { purchaseQ } from "@/queries/purchase-order";
import { useQuery } from "@tanstack/react-query";
import { PurchaseApprovalTable } from "./approval-table";

function Page() {
  const { user } = useStore();
  const auth =
    user?.role.some(
      (c) => c.label === "ADMIN" || c.label === "SALES_MANAGER"
    ) ?? false;

  const { isSuccess, isError, error, isLoading, data } = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: purchaseQ.getAll,
  });

  if (!auth) {
    return <ErrorPage statusCode={401} />;
  }
  if (isLoading) {
    return <LoadingPage />;
  }
  if (isError) {
    return <ErrorPage error={error} />;
  }
  if (isSuccess) {
    return (
      <div className="content">
        <PageTitle
          title="Approbation"
          subtitle="Approbation des bons de commandes"
          color="blue"
        />
        <PurchaseApprovalTable data={data.data} />
      </div>
    );
  }
}

export default Page;
