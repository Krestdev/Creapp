"use client";

import Tickets from "@/components/pages/ticket/tickets";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { useStore } from "@/providers/datastore";
import Link from "next/link";

function Page() {

  const { user } = useStore();
  const links = [
    { title: "Validation", href: "/tableau-de-bord/ticket/validation" },
    {
      title: "Liste des tickets",
      href: "/tableau-de-bord/ticket/liste",
    },
    {
      title: "Créer un paiement",
      href: "/tableau-de-bord/ticket/nouveaux",
    },
    { title: "Paiements", href: "/tableau-de-bord/ticket/paiements" },
    {
      title: "Paiements reçus",
      href: "/tableau-de-bord/ticket/paiementrecus",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Tickets"
        subtitle="Consultez et gérez les tickets."
        color="red"
      >
        {links
          .filter(
            (x) =>
              !(
                x.title === "Validation/tableau-de-bord/ticket" &&
                !user?.role.flatMap((r) => r.label).includes("MANAGER")
              )
          )
          .map((link, id) => {
            const isLast = links.length > 1 ? false : id === links.length - 1;
            return (
              <Link key={id} href={link.href}>
                <Button size="lg" variant={isLast ? "accent" : "ghost"}>
                  {link.title}
                </Button>
              </Link>
            );
          })}
      </PageTitle>

      <Tickets />
    </div>
  );
}

export default Page;
