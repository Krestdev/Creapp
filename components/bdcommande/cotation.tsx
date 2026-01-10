"use client";

import { CommandeTable } from "@/components/tables/commande-table";
import { useFetchQuery } from "@/hooks/useData";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import LoadingPage from "../loading-page";
import ErrorPage from "../error-page";

const Cotation = () => {
  const [dateFilter, setDateFilter] = React.useState<
    "today" | "week" | "month" | "year" | "custom" | undefined
  >();

  const { isSuccess, isError, error, isLoading, data } = useFetchQuery(
    ["commands"],
    commandRqstQ.getAll
  );

  if (isLoading) {
    return <LoadingPage />;
  }
  if (isError) {
    return <ErrorPage error={error ?? isError ?? undefined} />;
  }
  if (isSuccess)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <CommandeTable
            data={data?.data}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
          />
        </div>
      </div>
    );
};

export default Cotation;
