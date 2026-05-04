"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { userQ } from "@/queries/baseModule";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import NewServiceForm from "./new-service-form";

function Page() {
  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: userQ.getAll,
  });

  if (getUsers.isLoading) return <LoadingPage />;
  if (getUsers.isError)
    return <ErrorPage error={getUsers.error || undefined} />;
  if (getUsers.isSuccess)
    return (
      <div className="content">
        <PageTitle
          title="Créer un service"
          subtitle="Formulaire de création d'un nouveau service"
          color="blue"
        />
        <NewServiceForm users={getUsers.data.data} />
      </div>
    );
}

export default Page;
