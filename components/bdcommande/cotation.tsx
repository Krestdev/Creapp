"use client";

import { CommandeTable } from "@/components/tables/commande-table";
import { commandRqstQ } from "@/queries/commandRqstModule";
import ErrorPage from "../error-page";
import LoadingPage from "../loading-page";
import { useQuery } from "@tanstack/react-query";
import { requestQ } from "@/queries/requestModule";
import { categoryQ } from "@/queries/categoryModule";
import { queryKeys } from "@/lib/query-keys";

const Cotation = () => {
  const { isSuccess, isError, error, isLoading, data } = useQuery({
    queryKey: queryKeys.quotationRequests,
    queryFn: commandRqstQ.getAll,
  });

  const getRequests = useQuery({
    queryKey: queryKeys.requestsForQuotation,
    queryFn: () => requestQ.getForQuotation(),
  });

  const getCategories = useQuery({
    queryKey: queryKeys.categories,
    queryFn: categoryQ.getCategories,
  });

  if (isLoading || getRequests.isLoading || getCategories.isLoading) {
    return <LoadingPage />;
  }
  if (isError || getRequests.isError || getCategories.isError) {
    return (
      <ErrorPage
        error={error || getRequests.error || getCategories.error || undefined}
      />
    );
  }
  if (isSuccess && getRequests.isSuccess && getCategories.isSuccess)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <CommandeTable
            data={data.data}
            requests={getRequests.data.data}
            // .filter(
            //   (r) => r.type === "achat" && r.state === "validated",
            // )
            categories={getCategories.data.data}
          />
        </div>
      </div>
    );
};

export default Cotation;
