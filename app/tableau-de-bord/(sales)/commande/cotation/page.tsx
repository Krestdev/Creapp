"use client";

import Cotation from "@/components/bdcommande/cotation";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { useStore } from "@/providers/datastore";
import Link from "next/link";
import React from "react";

const Page = () => {
  const { user } = useStore();
  const links = [
    {
      title: "Créer une Demande",
      href: "./cotation/creer",
    },
  ];
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Demandes de cotation"
        subtitle="Consultez et gérez vos demandes de cotation."
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
      <Cotation />
    </div>
  );
};

export default Page;
