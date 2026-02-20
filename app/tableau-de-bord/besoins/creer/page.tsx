"use client";
import CreateResquestPage from "@/components/besoin/CreateResquestPage";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { userQ } from "@/queries/baseModule";
import { categoryQ } from "@/queries/categoryModule";
import { projectQ } from "@/queries/projectModule";
import { requestTypeQ } from "@/queries/requestType";
import { vehicleQ } from "@/queries/vehicule";
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

  const getCategories = useQuery({
    queryKey: ["categoryList"],
    queryFn: async () => categoryQ.getCategories(),
  });

  const getVehicles = useQuery({
      queryKey: ["vehicles"],
      queryFn: async()=> vehicleQ.getAll(),
    });

  if (getRequestType.isLoading || getUsers.isLoading || getProjects.isLoading || getCategories.isLoading || getVehicles.isLoading) return <LoadingPage />;
  if (getRequestType.isError || getUsers.isError || getProjects.isError || getCategories.isError || getVehicles.isError) return <ErrorPage error={getRequestType.error || getUsers.error || getProjects.error || getCategories.error || getVehicles.error || undefined} />;
  if (getRequestType.isSuccess && getUsers.isSuccess && getProjects.isSuccess && getCategories.isSuccess && getVehicles.isSuccess) {
    return (
      <div className="flex flex-col gap-6">
        <PageTitle
          title="Créer un besoin"
          color="blue"
          subtitle="Renseignez les informations relatives à votre besoin."
        />
        <CreateResquestPage types={getRequestType.data.data} users={getUsers.data.data} projects={getProjects.data.data} categories={getCategories.data.data} vehicles={getVehicles.data.data} />
      </div>
    );
  }
};

export default Page;
