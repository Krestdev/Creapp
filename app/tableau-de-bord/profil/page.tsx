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
import { userQ } from "@/queries/baseModule";

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

  const getUser = useQuery({
    queryKey: ["user", user?.id],
    queryFn: () => userQ.getOne(user!.id),
    enabled: !!user,
  });

  if (requests.isLoading || getUser.isLoading) {
    return <LoadingPage />;
  }
  if (requests.isError || getUser.isError) {
    return <ErrorPage error={requests.error || getUser.error || undefined} />;
  }
  if (requests.isSuccess && getUser.isSuccess) {
    console.log(requests.data.data);
    return (
      <div className="content">
        <PageTitle
          title={"Mon Profil"}
          subtitle={"Informations personnelles et configuration"}
          links={links}
        />
        <ProfilePage user={getUser.data.data} requests={requests.data.data} />
      </div>
    );
  }
}

export default Page;
