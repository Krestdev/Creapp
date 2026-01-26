"use client";

import { TabBar, TabProps } from "@/components/base/TabBar";
import Cotation from "@/components/bdcommande/cotation";
import CreateCotation from "@/components/bdcommande/createCommande";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { isRole } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { requestQ } from "@/queries/requestModule";
import { NavLink } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

const Page = () => {
  const { user } = useStore();
  const links: Array<NavLink> = [
    /* {
      title: "Créer une Demande",
      href: "./cotation/creer",
      hide: !isRole({
        roleList: user?.role || [],
        role: "Donner d'ordre achat",})
    }, */
  ];

  const requestData = useQuery({
    queryKey: ["requests"],
    queryFn: () => {
      return requestQ.getAll();
    },
  });

  const getCommandRequests = useQuery({
    queryKey: ["commands"],
    queryFn: commandRqstQ.getAll,
  });

  const commandRequests = useMemo(() => {
    if (!getCommandRequests.data) return [];
    return getCommandRequests.data.data;
  }, [getCommandRequests.data]);

  const isRequestUsed = (requestId: number): boolean =>
    commandRequests.some((c) => c.besoins.some((b) => b.id === requestId));

  const requestToUse = useMemo(() => {
    if (!requestData.data || !getCommandRequests.data) return [];
    return requestData.data.data.filter(
      (x) =>
        x.type === "achat" && x.state === "validated" && !isRequestUsed(x.id),
    );
  }, [requestData.data, getCommandRequests.data]);

  const tabs: TabProps["tabs"] = [
    {
      id: 1,
      title: "Créer une Demande",
      badge: requestToUse.length > 0 ? requestToUse.length : undefined,
    },
    {
      id: 0,
      title: "Demande de cotation",
    },
  ];
  const [selectedTab, setSelectedTab] = useState(0);
  if(getCommandRequests.isLoading || requestData.isLoading){
    return <LoadingPage/>
  }
  if(getCommandRequests.isError || requestData.isError){
    return <ErrorPage error={getCommandRequests.error || requestData.error || undefined} />
  }
  if(getCommandRequests.isSuccess && requestData.isSuccess){
    return (
      <div className="content">
        <PageTitle
          title="Demandes de cotation"
          subtitle="Consultez et gérez vos demandes de cotation."
          color="red"
          links={links}
        />
        <TabBar
          tabs={tabs}
          setSelectedTab={setSelectedTab}
          selectedTab={selectedTab}
        />
        {selectedTab === 1 ? <CreateCotation /> : <Cotation />}
      </div>
    );
  }
};

export default Page;
