"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { invoiceQ } from "@/queries/invoices";
import { paymentQ } from "@/queries/payment";
import { useQuery } from "@tanstack/react-query";
import CreatePaiement from "./create";

function Page() {
  const getInvoices = useQuery({
    queryKey: ["invoices"],
    queryFn: invoiceQ.getAll,
  });

  const getPayments = useQuery({
      queryKey: ["payments"],
      queryFn: paymentQ.getAll,
    });

  if (getInvoices.isLoading || getPayments.isLoading) {
    return <LoadingPage />;
  }
  if (getInvoices.isError || getPayments.isError) {
    return <ErrorPage error={getInvoices.error || getPayments.error || undefined} />;
  }
  if (getInvoices.isSuccess && getPayments.isSuccess)
    return (
      <div className="content">
        <PageTitle
          title={"Créer un paiement"}
          subtitle={"Complétez le formulaire pour créer une paiement"}
          color={"blue"}
        />
        <CreatePaiement invoices={getInvoices.data.data.filter(x => x.status === "UNPAID")} payments={getPayments.data.data}/>
      </div>
    );
}

export default Page;
