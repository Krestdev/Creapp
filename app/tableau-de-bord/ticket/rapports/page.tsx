"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import { userQ } from "@/queries/baseModule";
import { paymentQ } from "@/queries/payment";
import { requestQ } from "@/queries/requestModule";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import NotPaidRequestsTable from "./table-requests-not-paid";
import { projectQ } from "@/queries/projectModule";
import { categoryQ } from "@/queries/categoryModule";
import { queryKeys } from "@/lib/query-keys";

function Page() {
  const getUsers = useQuery({
    queryKey: queryKeys.users,
    queryFn: userQ.getAll,
  });

  const getCategories = useQuery({
    queryKey: queryKeys.categories,
    queryFn: categoryQ.getCategories,
  });

  const getProjects = useQuery({
    queryKey: queryKeys.projects,
    queryFn: projectQ.getAll,
  });

  if (getUsers.isLoading || getCategories.isLoading || getProjects.isLoading)
    return <LoadingPage />;
  if (getUsers.isError || getCategories.isError || getProjects.isError)
    return (
      <ErrorPage
        error={
          getUsers.error ||
          getCategories.error ||
          getProjects.error ||
          undefined
        }
      />
    );
  if (getUsers.isSuccess && getCategories.isSuccess && getProjects.isSuccess) {
    return (
      <></>
      /* <NotPaidRequestsTable
        requests={getRequests.data.data}
        users={getUsers.data.data}
        tickets={payments}
        categories={getCategories.data.data}
        projects={getProjects.data.data}
      /> */
    );
  }
}

export default Page;
