import Bdcommande from "@/components/pages/bdcommande/bdcommande";
import PageTitle from "@/components/pageTitle";
import React from "react";

const Page = () => {
  const links = [
    {
      title: "Demande de cotation",
      href: "/tableau-de-bord/bdcommande/cotation",
    },
    { title: "Devis", href: "/tableau-de-bord/bdcommande/devis" },
    { title: "Besoins", href: "/tableau-de-bord/bdcommande/besoins" },
    { title: "Validation", href: "/tableau-de-bord/bdcommande/validation" },
    {
      title: "Bons de commande",
      href: "/tableau-de-bor/bdcommande/commande",
    },
    {
      title: "Nouveaux Bons de commande",
      href: "/tableau-de-bord/bdcommande/nouveaux",
    },
  ];
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Bons de commande"
        subtitle="Consultez et gérez les éléments relatifs aux bons de commande"
        color="red"
        links={links}
      />
      <Bdcommande />
    </div>
  );
};

export default Page;
