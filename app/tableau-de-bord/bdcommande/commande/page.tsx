import PageTitle from "@/components/pageTitle";
import React from "react";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Bons de Commandes"
        subtitle="Consultez et gérez vos commandes."
        color="red"
        links={[
          {
            title: "Créer un Bon de commande",
            href: "/tableau-de-bord/bdcommande/nouveaux",
          },
        ]}
      />
    </div>
  );
};

export default Page;
