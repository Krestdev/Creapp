"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { useStore } from "@/providers/datastore";
import { requestQ } from "@/queries/requestModule";
import { NavLink } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import ProfilePage from "./profile";

function Page() {
  const { user } = useStore();
  const links: Array<NavLink> = [
    {
      title: "Modifier mon mot de passe",
      href: "/tableau-de-bord/changer-mot-de-passe",
    },
    {
      title: "Configurer ma signature",
      href: "/tableau-de-bord/profil/signature",
      hide: !user?.role.some(
        (r) => r.label === "SALES" || r.label === "VOLT_MANAGER",
      ),
    },
  ];

  const requests = useQuery({
    queryKey: ["requests", user?.id],
    queryFn: () => requestQ.getMine(user!.id),
    enabled: !!user,
  });

  if (requests.isLoading) {
    return <LoadingPage />;
  }
  if (requests.isError) {
    return <ErrorPage error={requests.error} />;
  }
  if (requests.isSuccess) {
    console.log(requests.data.data);
    return (
      <div className="content">
        <PageTitle
          title={"Mon Profil"}
          subtitle={"Informations personnelles et configuration"}
          links={links}
        />
        <ProfilePage user={user!} requests={requests.data.data} />
      </div>
    );
  }
}

export default Page;
