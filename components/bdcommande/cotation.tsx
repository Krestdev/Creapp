"use client";

import { CommandeTable } from "@/components/tables/commande-table";
import { useFetchQuery } from "@/hooks/useData";
import { commandRqstQ } from "@/queries/commandRqstModule";
import ErrorPage from "../error-page";
import LoadingPage from "../loading-page";

const Cotation = () => {
  const { isSuccess, isError, error, isLoading, data } = useFetchQuery(
    ["commands"],
    commandRqstQ.getAll
  );

  if (isLoading) {
    return <LoadingPage />;
  }
  if (isError) {
    return <ErrorPage error={error} />;
  }
  if (isSuccess)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <CommandeTable
            data={data.data}
          />
        </div>
      </div>
    );
};

export default Cotation;
