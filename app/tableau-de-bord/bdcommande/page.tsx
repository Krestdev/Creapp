"use client";

import Bdcommande from "@/components/pages/bdcommande/bdcommande";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { useStore } from "@/providers/datastore";
import Link from "next/link";
import React from "react";

const Page = () => {
  const { user } = useStore();
  const links = [
    {
      title: "Demande de quotation",
      href: "/tableau-de-bord/bdcommande/cotation",
    },
    { title: "Devis", href: "/tableau-de-bord/bdcommande/devis" },
    {
      title: "Bons de commande",
      href: "/tableau-de-bor/bdcommande/commande",
    },
    { title: "Paiements", href: "/tableau-de-bord/bdcommande/paiements" },
  ];
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Bons de commande"
        subtitle="Consultez et gérez les éléments relatifs aux bons de commande"
        color="red"
      >
        {links
          .filter(
            (x) =>
              !(
                x.title === "Approbation" &&
                !user?.role.flatMap((r) => r.label).includes("MANAGER")
              )
          )
          .map((link, id) => {
            const isLast = links.length > 1 ? id === links.length - 1 : false;
            return (
              <Link key={id} href={link.href}>
                <Button size={"lg"} variant={isLast ? "accent" : "ghost"}>
                  {link.title}
                </Button>
              </Link>
            );
          })}
      </PageTitle>
      <Bdcommande />
    </div>
  );
};

export default Page;
