import BdCommandePaiement from "@/components/pages/bdcommande/bdCommandePaiement";
import PageTitle from "@/components/pageTitle";
import React from "react";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Validation"
        subtitle="Approbation des bons de commandes"
        color="green"
      />
      <BdCommandePaiement />
    </div>
  );
};

export default Page;
