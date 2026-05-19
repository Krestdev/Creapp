"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { queryKeys } from "@/lib/query-keys";
import { userQ } from "@/queries/baseModule";
import { invoiceQ } from "@/queries/invoices";
import { projectQ } from "@/queries/projectModule";
import { useQuery } from "@tanstack/react-query";
import CreatePaiement from "./create";

function Page() {
  const getInvoices = useQuery({
    queryKey: queryKeys.invoices,
    queryFn: invoiceQ.getAll,
  });

  const getProjects = useQuery({
    queryKey: queryKeys.projects,
    queryFn: projectQ.getAll,
  });

  const getUsers = useQuery({
    queryKey: queryKeys.users,
    queryFn: userQ.getAll,
  });

  if (getInvoices.isLoading || getProjects.isLoading || getUsers.isLoading) {
    return <LoadingPage />;
  }
  if (getInvoices.isError || getProjects.isError || getUsers.isError) {
    return (
      <ErrorPage
        error={
          getInvoices.error || getProjects.error || getUsers.error || undefined
        }
      />
    );
  }
  if (getInvoices.isSuccess && getProjects.isSuccess && getUsers.isSuccess)
    return (
      <div className="content">
        <PageTitle
          title={"Créer un paiement"}
          subtitle={"Complétez le formulaire pour créer une paiement"}
          color={"blue"}
        />
        <CreatePaiement
          invoices={getInvoices.data.data.filter((x) => x.status === "UNPAID")}
          projects={getProjects.data.data}
          users={getUsers.data.data}
        />
      </div>
    );
}

export default Page;
