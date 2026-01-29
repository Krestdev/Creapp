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

  if (getReceptions.isLoading || getDevis.isLoading || cmdReqs.isLoading) return <LoadingPage />;
  if (getReceptions.isError || getDevis.isError || cmdReqs.isError) return <ErrorPage />;

  // ✅ Selon ta consigne : le type réel est getReceptions.data.data
  const receptions: Reception[] = getReceptions.data?.data ?? [];
  const devis = getDevis.data?.data ?? [];
  const cmdReqsData = cmdReqs.data?.data ?? [];
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={"Réceptions"}
        subtitle={
          "Enregistrez les réceptions des livraisons relatives aux bons de commande."
        }
        color={"red"}
      />

      <ReceptionTable data={receptions} devis={devis} cmdReqst={cmdReqsData} />
    </div>
  );
};

export default ReceptionsPage;
