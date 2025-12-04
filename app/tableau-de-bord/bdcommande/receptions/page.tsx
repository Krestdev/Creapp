
import PageTitle from "@/components/pageTitle";
import React from "react";

const ReceptionsPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={"Réceptions"}
        subtitle={"Enregistrez les réceptions des livraisons relatives aux bons de commande."}
        color={"red"}
      />
    </div>
  );
};

export default ReceptionsPage;
