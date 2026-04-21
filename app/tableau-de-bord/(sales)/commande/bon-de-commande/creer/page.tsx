"use client";
import CreateForm from "@/app/tableau-de-bord/(sales)/commande/bon-de-commande/creer/create-form";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { CommandConditionQ } from "@/queries/commandsConditions";
import { payTypeQ } from "@/queries/payType";
import { providerQ } from "@/queries/providers";
import { purchaseQ } from "@/queries/purchase-order";
import { quotationQ } from "@/queries/quotation";
import { useQuery } from "@tanstack/react-query";

function Page() {
  const getQuotations = useQuery({
    queryKey: ["quotations"],
    queryFn: quotationQ.getAll,
  });
  const getProviders = useQuery({
    queryKey: ["providers"],
    queryFn: providerQ.getAll,
  });
  const getPurchases = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: purchaseQ.getAll,
  });
  const getPaymentType = useQuery({
    queryKey: ["paymentType"],
    queryFn: payTypeQ.getAll,
  });
  const conditions = useQuery({
    queryKey: ["conditions"],
    queryFn: () => CommandConditionQ.getAll(),
  });

  if (
    getQuotations.isLoading ||
    getProviders.isLoading ||
    getPurchases.isLoading ||
    getPaymentType.isLoading ||
    conditions.isLoading
  ) {
    return <LoadingPage />;
  }
  if (
    getQuotations.isError ||
    getProviders.isError ||
    getPurchases.isError ||
    getPaymentType.isError ||
    conditions.isError
  ) {
    return (
      <ErrorPage
        error={
          getQuotations.error ||
          getProviders.error ||
          getPurchases.error ||
          getPaymentType.error ||
          conditions.error ||
          undefined
        }
      />
    );
  }
  if (
    getQuotations.isSuccess &&
    getProviders.isSuccess &&
    getPurchases.isSuccess &&
    getPaymentType.isSuccess &&
    conditions.isSuccess
  ) {
    return (
      <div className="content">
        <PageTitle
          title="Créer un bon de Commande"
          subtitle="Complétez le formulaire pour créer un bon de Commande"
          color="blue"
        />
        <CreateForm
          quotations={getQuotations.data.data}
          providers={getProviders.data.data}
          purchases={getPurchases.data.data}
          paymentType={getPaymentType.data.data}
          conditions={conditions.data.data}
        />
      </div>
    );
  }
}

export default Page;
