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

function Page() {
  const getRequests = useQuery({
    queryKey: ["requests"],
    queryFn: requestQ.getAll,
  });
  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: userQ.getAll,
  });

  const getPayments = useQuery({
    queryKey: ["payments"],
    queryFn: paymentQ.getAll,
  });

  const getCategories = useQuery({
    queryKey: ["categories"],
    queryFn: categoryQ.getCategories,
  });

  const getProjects = useQuery({
    queryKey: ["projects"],
    queryFn: projectQ.getAll,
  });

  const payments = React.useMemo(() => {
    if (!getPayments.data) return [];
    return getPayments.data.data.filter((p) => p.method?.type === "cash");
  }, [getPayments.data]);

  if (
    getRequests.isLoading ||
    getUsers.isLoading ||
    getPayments.isLoading ||
    getCategories.isLoading ||
    getProjects.isLoading
  )
    return <LoadingPage />;
  if (
    getRequests.isError ||
    getUsers.isError ||
    getPayments.isError ||
    getCategories.isError ||
    getProjects.isError
  )
    return (
      <ErrorPage
        error={
          getRequests.error ||
          getUsers.error ||
          getPayments.error ||
          getCategories.error ||
          getProjects.error ||
          undefined
        }
      />
    );
  if (
    getRequests.isSuccess &&
    getUsers.isSuccess &&
    getPayments.isSuccess &&
    getCategories.isSuccess &&
    getProjects.isSuccess
  ) {
    return (
      <NotPaidRequestsTable
        requests={getRequests.data.data}
        users={getUsers.data.data}
        tickets={payments}
        categories={getCategories.data.data}
        projects={getProjects.data.data}
      />
    );
  }
}

export default Page;
