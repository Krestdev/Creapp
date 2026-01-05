'use client'

import React from "react";
import PageTitle from "@/components/pageTitle";
import LoadingPage from "@/components/loading-page";
import ErrorPage from "@/components/error-page";
import { ReceptionQuery } from "@/queries/reception";
import { useFetchQuery } from "@/hooks/useData";
import type { Reception } from "@/types/types";
import { ReceptionTable } from "./reception-table";

const ReceptionsPage = () => {
  const receptionQuery = new ReceptionQuery();
  const getReceptions = useFetchQuery(["receptions"], receptionQuery.getAll, 90000);

  if (getReceptions.isLoading) return <LoadingPage />;
  if (getReceptions.isError) return <ErrorPage />;

  // ✅ Selon ta consigne : le type réel est getReceptions.data.data
  const receptions: Reception[] = getReceptions.data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={"Réceptions"}
        subtitle={"Enregistrez les réceptions des livraisons relatives aux bons de commande."}
        color={"red"}
      />

      <ReceptionTable data={receptions} />
    </div>
  );
};

export default ReceptionsPage;
