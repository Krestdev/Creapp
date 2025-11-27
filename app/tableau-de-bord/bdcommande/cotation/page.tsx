import Cotation from "@/components/pages/bdcommande/cotation";
import PageTitle from "@/components/pageTitle";
import React from "react";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Demandes de quotation"
        subtitle="Consultez et gérez vos demandes de quotation."
        color="red"
        links={[
          {
            title: "Créer une Demande",
            href: "/tableau-de-bord/bdcommande/cotation/creer",
          },
        ]}
      />
      <Cotation />
    </div>
  );
};

export default Page;
