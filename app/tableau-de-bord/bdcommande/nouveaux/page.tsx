import PageTitle from "@/components/pageTitle";
import React from "react";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Créer un bon de Commande"
        subtitle="Complétez le formulaire pour créer un bon de Commande"
        color="blue"
      />
    </div>
  );
};

export default Page;
