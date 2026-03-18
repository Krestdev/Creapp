"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import { userQ } from "@/queries/baseModule";
import { paymentQ } from "@/queries/payment";
import { requestQ } from "@/queries/requestModule";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import NotPaidRequestsTable from "./table-requests-not-paid";

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

  if (getRequests.isLoading || getUsers.isLoading || getPayments.isLoading)
    return <LoadingPage />;
  if (getRequests.isError || getUsers.isError || getPayments.isError)
    return (
      <ErrorPage
        error={
          getRequests.error || getUsers.error || getPayments.error || undefined
        }
      />
    );
  if (getRequests.isSuccess && getUsers.isSuccess && getPayments.isSuccess) {
    return (
      <NotPaidRequestsTable
        requests={getRequests.data.data}
        users={getUsers.data.data}
        tickets={getPayments.data.data}
      />
    );
  }
}

export default Page;
