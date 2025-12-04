import PageTitle from "@/components/pageTitle";
import React from "react";

const CreerPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={"Créer un paiement"}
        subtitle={"Complétez le formulaire pour créer une paiement"}
        color={"blue"}
      />
    </div>
  );
};

export default CreerPage;
