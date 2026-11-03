"use client";

import Cotation from "@/components/bdcommande/cotation";
import PageTitle from "@/components/pageTitle";
import { NavLink } from "@/types/types";

const Page = () => {
  const links: Array<NavLink> = [
    {
      title: "Nouvelle cotation",
      href: "./cotation/creer",
    },
  ];

  return (
    <div className="content">
      <PageTitle
        title="Demandes de cotation"
        subtitle="Vos demandes de cotation et l’avancement des réponses fournisseurs."
        links={links}
      />
      <Cotation />
    </div>
  );
};

export default Page;
