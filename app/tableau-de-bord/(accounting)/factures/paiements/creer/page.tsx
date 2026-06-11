"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { queryKeys } from "@/lib/query-keys";
import { invoiceQ } from "@/queries/invoices";
import { projectQ } from "@/queries/projectModule";
import { useQuery } from "@tanstack/react-query";
import CreatePaiement from "./create";

function Page() {
  const getInvoices = useQuery({
    queryKey: queryKeys.invoicesPayments,
    queryFn: invoiceQ.getAll,
  });

  const getProjects = useQuery({
    queryKey: queryKeys.projects,
    queryFn: projectQ.getAll,
  });

  if (getInvoices.isLoading || getProjects.isLoading) {
    return <LoadingPage />;
  }
  if (getInvoices.isError || getProjects.isError) {
    return (
      <ErrorPage error={getInvoices.error || getProjects.error || undefined} />
    );
  }
  if (getInvoices.isSuccess && getProjects.isSuccess)
    return (
      <div className="content">
        <PageTitle
          title={"Créer un paiement"}
          subtitle={"Complétez le formulaire pour créer une paiement"}
          color={"blue"}
        />
        <CreatePaiement
          invoices={getInvoices.data.data.filter(
            (x) => x.status === "UNPAID", //&& x.rest > 0,
          )}
          projects={getProjects.data.data}
        />
      </div>
    );
}

export default Page;
