"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import { userQ } from "@/queries/baseModule";
import { requestQ } from "@/queries/requestModule";
import { useQuery } from "@tanstack/react-query";
import React from "react";

function Page() {
  const getRequests = useQuery({
    queryKey: ["requests"],
    queryFn: requestQ.getAll,
  });
  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: userQ.getAll,
  });

  if (getRequests.isLoading || getUsers.isLoading) return <LoadingPage />;
  if (getRequests.isError || getUsers.isError)
    return (
      <ErrorPage error={getRequests.error || getUsers.error || undefined} />
    );
  if (getRequests.isSuccess && getUsers.isSuccess) {
    return <div>Page</div>;
  }
}

export default Page;
