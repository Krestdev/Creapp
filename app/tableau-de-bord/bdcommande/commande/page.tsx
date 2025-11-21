import StatsCard from "@/components/base/StatsCard";
import CommandeBd from "@/components/pages/bdcommande/commande";
import PageTitle from "@/components/pageTitle";
import React from "react";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Commandes"
        subtitle="Consultez et gérez les éléments relatifs aux bons de commande."
        color="red"
        links={[
          {
            title: "Créer un Bon de commande",
            href: "/tableau-de-bord/bdcommande/nouveaux",
          },
        ]}
      />
      {/* <StatsCard
        title="Bons de comande"
        titleColor="text-[#E4E4E7]"
        value={String(soumis)}
        description="Besoins soumis ce mois :"
        descriptionValue={String(soumisMois)}
        descriptionColor="red"
        dividerColor="bg-[#2262A2]"
        className={"bg-[#013E7B] text-[#fffff] border-[#2262A2]"}
        dvalueColor="text-[#FFFFFF]"
      /> */}
      <CommandeBd />
    </div>
  );
};

export default Page;
