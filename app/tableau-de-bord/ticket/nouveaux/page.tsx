import CreateTicketPage from "@/components/ticket/CreateTicketPage";
import PageTitle from "@/components/pageTitle";
import React from "react";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Créer un Paiement"
        subtitle="Formulaire de création de ticket de paiement"
        color="blue"
      />
      <CreateTicketPage />
    </div>
  );
};

export default Page;
