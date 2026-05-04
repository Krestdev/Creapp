"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { useStore } from "@/providers/datastore";
import { purchaseQ } from "@/queries/purchase-order";
import { useQuery } from "@tanstack/react-query";
import { PurchaseApprovalTable } from "./approval-table";
import { userQ } from "@/queries/baseModule";

function Page() {
  const { user } = useStore();
  const auth =
    user?.role.some(
      (c) =>
        c.label === "SUPERADMIN" ||
        // c.label === "SALES_MANAGER" ||
        c.label === "VOLT_MANAGER",
    ) ?? false;

  const { isSuccess, isError, error, isLoading, data } = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: purchaseQ.getAll,
  });

  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: userQ.getAll,
  });

  if (isLoading || getUsers.isLoading) {
    return <LoadingPage />;
  }
  if (isError || getUsers.isError) {
    return <ErrorPage error={error || getUsers.error || undefined} />;
  }
  if (!auth) {
    return (
      <ErrorPage
        statusCode={401}
        message={
          auth === false
            ? "Vous n'êtes pas autorisé !"
            : "Impossible de récupérer vos informations"
        }
      />
    );
  }
  if (isSuccess && getUsers.isSuccess) {
    return (
      <div className="content">
        <PageTitle
          title="Approbation BC"
          subtitle="Approbation des bons de commandes"
          color="blue"
        />
        <PurchaseApprovalTable data={data.data} users={getUsers.data.data} />
      </div>
    );
  }
}

export default Page;
