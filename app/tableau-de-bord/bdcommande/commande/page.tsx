"use client"
import CommandeBd from "@/components/pages/bdcommande/commande";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { useStore } from "@/providers/datastore";
import Link from "next/link";
import React from "react";

const Page = () => {
  const { user } = useStore();
  const links = [
    {
      title: "Créer un Bon de commande",
      href: "/tableau-de-bord/bdcommande/nouveaux",
    },
  ];
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Commandes"
        subtitle="Consultez et gérez les éléments relatifs aux bons de commande."
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
            const isLast = links.length > 1 ? false : id === links.length - 1;
            return (
              <Link key={id} href={link.href}>
                <Button size={"lg"} variant={isLast ? "accent" : "ghost"}>
                  {link.title}
                </Button>
              </Link>
            );
          })}
      </PageTitle>
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
