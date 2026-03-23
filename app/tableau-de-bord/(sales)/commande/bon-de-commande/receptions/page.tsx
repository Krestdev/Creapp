"use client";

import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { receptionQ } from "@/queries/reception";
import type { Reception } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { ReceptionTable } from "./reception-table";
import { quotationQ } from "@/queries/quotation";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { purchaseQ } from "@/queries/purchase-order";

const ReceptionsPage = () => {
  const getReceptions = useQuery({
    queryKey: ["receptions"],
    queryFn: receptionQ.getAll,
  });

  const getDevis = useQuery({
    queryKey: ["quotations"],
    queryFn: quotationQ.getAll,
  });

  const cmdReqs = useQuery({
    queryKey: ["commands"],
    queryFn: commandRqstQ.getAll,
  });

  const getPurchases = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: purchaseQ.getAll,
  });

  if (
    getReceptions.isLoading ||
    getDevis.isLoading ||
    cmdReqs.isLoading ||
    getPurchases.isLoading
  )
    return <LoadingPage />;
  if (
    getReceptions.isError ||
    getDevis.isError ||
    cmdReqs.isError ||
    getPurchases.isError
  )
    return (
      <ErrorPage
        error={
          getReceptions.error ||
          getDevis.error ||
          cmdReqs.error ||
          getPurchases.error ||
          undefined
        }
      />
    );

  if (
    getReceptions.isSuccess &&
    getDevis.isSuccess &&
    cmdReqs.isSuccess &&
    getPurchases.isSuccess
  ) {
    return (
      <div className="flex flex-col gap-6">
        <PageTitle
          title={"Réceptions"}
          subtitle={
            "Enregistrez les réceptions des livraisons relatives aux bons de commande."
          }
          color={"red"}
        />

        <ReceptionTable
          data={getReceptions.data.data}
          devis={getDevis.data.data}
          cmdReqst={cmdReqs.data.data}
          purchases={getPurchases.data.data}
        />
      </div>
    );
  }
};

export default ReceptionsPage;
