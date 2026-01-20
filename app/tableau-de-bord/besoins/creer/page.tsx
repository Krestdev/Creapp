import CreateResquestPage from "@/components/besoin/CreateResquestPage";
import PageTitle from "@/components/pageTitle";
import React from "react";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Créer un besoin"
        color="blue"
        subtitle="Renseignez les informations relatives à votre besoin."
      />
      <CreateResquestPage />
    </div>
  );
};

export default Page;
