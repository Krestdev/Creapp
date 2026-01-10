"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { useFetchQuery } from "@/hooks/useData";
import { transactionQ } from "@/queries/transaction";
import TransferTable from "./transfer-table";
import TransferHistory from "./transfert-history";

function Page() {
  const { data, isSuccess, isError, error, isLoading } = useFetchQuery(
    ["transactions"],
    transactionQ.getAll
  );

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
          title="Approbation des transferts"
          subtitle="Approuvez ou rejetez les demandes de transfert de fonds."
          color="green"
        />
        <TransferTable
          data={data.data.filter(
            (c) => c.Type === "TRANSFER" && c.status === "PENDING"
          )}
        />
        <TransferHistory
          data={data.data.filter(
            (c) =>
              (c.Type === "TRANSFER" && c.status === "APPROVED") ||
              c.status === "REJECTED"
          )}
        />
      </div>
    );
  }
}

export default Page;
