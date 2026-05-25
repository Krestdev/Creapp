"use client";

import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { DevisTable } from "@/components/tables/DevisTable";
import { queryKeys } from "@/lib/query-keys";
import { userQ } from "@/queries/baseModule";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { providerQ } from "@/queries/providers";
import { quotationQ } from "@/queries/quotation";
import { requestQ } from "@/queries/requestModule";
import { NavLink } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const Page = () => {
  const links: Array<NavLink> = [
    {
      title: "Créer un devis",
      href: "./devis/creer",
    },
  ];

  const { data, isSuccess, isError, error, isLoading } = useQuery({
    queryKey: queryKeys.quotations,
    queryFn: quotationQ.getAll,
  });

  const getProviders = useQuery({
    queryKey: queryKeys.providers,
    queryFn: providerQ.getAll,
  });

  const commands = useQuery({
    queryKey: queryKeys.quotationRequests,
    queryFn: commandRqstQ.getAll,
  });

  const getUsers = useQuery({
    queryKey: queryKeys.users,
    queryFn: () => userQ.getAll(),
  });

  const getRequests = useQuery({
    queryKey: queryKeys.requests,
    queryFn: () => requestQ.getAll(),
  });

  if (
    isLoading ||
    getProviders.isLoading ||
    commands.isLoading ||
    getUsers.isLoading ||
    getRequests.isLoading
  ) {
    return <LoadingPage />;
  }

  if (
    isError ||
    getProviders.isError ||
    commands.isError ||
    getUsers.isError ||
    getRequests.isError
  ) {
    return (
      <ErrorPage
        error={
          error ||
          getProviders.error ||
          commands.error ||
          getUsers.error ||
          getRequests.error ||
          undefined
        }
      />
    );
  }

  if (
    isSuccess &&
    getProviders.isSuccess &&
    commands.isSuccess &&
    getUsers.isSuccess &&
    getRequests.isSuccess
  )
    return (
      <div className="content">
        <PageTitle
          title="Devis"
          subtitle="Consultez et gérez les cotations."
          color="red"
          links={links}
        />
        <DevisTable
          data={data.data}
          commands={commands.data.data}
          providers={getProviders.data.data}
          users={getUsers.data.data}
        />
      </div>
    );
};

export default Page;
