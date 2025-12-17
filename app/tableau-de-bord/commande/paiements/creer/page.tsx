import PageTitle from "@/components/pageTitle";
import React from "react";
import CreatePaiement from "./create";

const CreerPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={"Créer un paiement"}
        subtitle={"Complétez le formulaire pour créer une paiement"}
        color={"blue"}
      />
      <CreatePaiement />
    </div>
  );
};

export default CreerPage;
