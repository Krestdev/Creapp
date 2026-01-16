"use client";

import Empty from "@/components/base/empty";
import { TabBar } from "@/components/base/TabBar";
import Besoins from "@/components/bdcommande/besoins";
import Cotation from "@/components/bdcommande/cotation";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { useStore } from "@/providers/datastore";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { requestQ } from "@/queries/requestModule";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

const Page = () => {
  const { user, isHydrated } = useStore();
  const links = [
    {
      title: "Créer une Demande",
      href: "./cotation/creer",
    },
  ];

  const requestData = useQuery({
    queryKey: ["requests"],
    queryFn: () => {
      return requestQ.getAll();
    },
    enabled: isHydrated,
  });

  const tabs = [
    {
      id: 0,
      title: "Besoins disponibles",
    },
    {
      id: 1,
      title: "Demande de cotation",
    },
  ];
  const [selectedTab, setSelectedTab] = useState(0);

  const { data: cotation } = useQuery({
    queryKey: ["commands"],
    queryFn: commandRqstQ.getAll,
  });

  const besoinsDansCotation =
    cotation?.data.flatMap((item) => item.besoins.map((b) => b.id)) ?? [];

  const besoinVal = requestData.data?.data.filter(
    (x) =>
      x.categoryId !== 0 &&
      x.state === "validated" &&
      !besoinsDansCotation.includes(x.id)
  );
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
      <TabBar
        tabs={tabs}
        setSelectedTab={setSelectedTab}
        selectedTab={selectedTab}
      />
      {selectedTab === 0 ? (
        <div className="content">
          <h2>{"Besoins disponibles"}</h2>
          {besoinVal && besoinVal?.length > 0 ? (
            <Besoins selected={[]} setSelected={() => {}} isHome />
          ) : (
            <Empty message="Aucun besoin disponible" />
          )}
        </div>
      ) : (
        <div className="content">
          <h2>{"Demande de cotation"}</h2>
          <Cotation />
        </div>
      )}
    </div>
  );
};

export default Page;
