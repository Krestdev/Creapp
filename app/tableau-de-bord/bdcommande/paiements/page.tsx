
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const PaiementPage = () => {
  const links = [
    {
      title: "Créer un Paiement",
      href: "/tableau-de-bord/bdcommande/paiements/creer",
    },
  ];
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={"Paiements"}
        subtitle={
          "Créez et gérez les paiements des factures relatives aux bons de commande"
        }
        color={"blue"}
      >
        {links.map((x) => (
          <Link href={x.href} key={x.title}>
            <Button variant={"ghost"}>{x.title}</Button>
          </Link>
        ))}
      </PageTitle>
    </div>
  );
};

export default PaiementPage;
