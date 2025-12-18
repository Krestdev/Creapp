"use client";

import TitleValueCard from "@/components/base/TitleValueCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { useFetchQuery } from "@/hooks/useData";
import { useStore } from "@/providers/datastore";
import { CommandQueries } from "@/queries/command";
import Link from "next/link";

const Page = () => {
  const commandsQuery = new CommandQueries();
  const { isSuccess, isError, error, isLoading } = useFetchQuery(
    ["commandes"],
    commandsQuery.getAll,
    30000
  );

  const { user } = useStore();
  const links = [
    {
      title: "Créer un bon",
      href: "./bon-de-commande/creer",
    },
    {
      title: "Approbation",
      href: "./bon-de-commande/approbation",
    },
    {
      title: "Receptions",
      href: "./bon-de-commande/receptions",
    },
  ];

  if (isLoading) {
    return <LoadingPage />;
  }
  if (isError) {
    return <ErrorPage error={error ?? isError ?? undefined} />;
  }
  if (isSuccess)
    return (
      <div className="flex flex-col gap-6">
        <PageTitle
          title="Bons de commande"
          subtitle="Approbation des bons de commande"
          color="green"
        >
          {links
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
        <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4 items-center gap-5">
          <TitleValueCard
            title={"Bons en attente"}
            value={"13"}
            className={"border border-[#2262A2] bg-[#013E7B] text-[#E4E4E7]"}
            valColor={"text-white"}
          />
          <TitleValueCard
            title={"Bons rejetés"}
            value={"4"}
            className={"border border-[#EB88B4] bg-[#9E1351] text-[#E4E4E7]"}
            valColor={"text-white"}
          />
          <TitleValueCard
            title={"Bons validés"}
            value={"62"}
            className={"border border-[#BBF7D0] bg-[#15803D] text-[#E4E4E7]"}
            valColor={"text-white"}
          />
          <TitleValueCard
            title={"Bons de commande"}
            value={"79"}
            className={"border border-[#DFDFDF] bg-[#FFFFFF] text-[#52525B]"}
            valColor={"text-[#52525B]"}
          />
        </div>
        {/* <CommandeBd /> */}
        {/* <BonsCommandeTable data={data.data} /> */}
      </div>
    );
};

export default Page;
