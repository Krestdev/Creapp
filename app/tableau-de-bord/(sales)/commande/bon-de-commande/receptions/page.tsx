"use client";

import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { useFetchQuery } from "@/hooks/useData";
import { receptionQ } from "@/queries/reception";
import type { Reception } from "@/types/types";
import { ReceptionTable } from "./reception-table";

const ReceptionsPage = () => {
  const getReceptions = useFetchQuery(["receptions"], receptionQ.getAll, 90000);

  if (getReceptions.isLoading) return <LoadingPage />;
  if (getReceptions.isError) return <ErrorPage />;

  // ✅ Selon ta consigne : le type réel est getReceptions.data.data
  const receptions: Reception[] = getReceptions.data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={"Réceptions"}
        subtitle={
          "Enregistrez les réceptions des livraisons relatives aux bons de commande."
        }
        color={"red"}
      />

      <ReceptionTable data={receptions} />
    </div>
  );
};

export default ReceptionsPage;
