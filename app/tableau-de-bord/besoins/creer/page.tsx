"use client";
import CreateResquestPage from "@/components/besoin/CreateResquestPage";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { userQ } from "@/queries/baseModule";
import { projectQ } from "@/queries/projectModule";
import { requestTypeQ } from "@/queries/requestType";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const Page = () => {
  const getRequestType = useQuery({
    queryKey: ["requestType"],
    queryFn: requestTypeQ.getAll,
  });

  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: async () => userQ.getAll(),
  });

  const getProjects = useQuery({
    queryKey: ["projects"],
    queryFn: async () => projectQ.getAll(),
  });

  if (getRequestType.isLoading || getUsers.isLoading || getProjects.isLoading) return <LoadingPage />;
  if (getRequestType.isError || getUsers.isError || getProjects.isError) return <ErrorPage error={getRequestType.error || getUsers.error || getProjects.error || undefined} />;
  if (getRequestType.isSuccess && getUsers.isSuccess && getProjects.isSuccess) {
    return (
      <div className="flex flex-col gap-6">
        <PageTitle
          title="Créer un besoin"
          color="blue"
          subtitle="Renseignez les informations relatives à votre besoin."
        />
        <CreateResquestPage types={getRequestType.data.data} users={getUsers.data.data} projects={getProjects.data.data} />
      </div>
    );
  }
};

export default Page;
