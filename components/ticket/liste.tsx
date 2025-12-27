"use client"

import { TicketsTable } from "@/components/tables/tickets-table";
import { useFetchQuery } from "@/hooks/useData";
import { PaymentQueries } from "@/queries/payment";
import LoadingPage from "../loading-page";
import ErrorPage from "../error-page";

const Liste = () => {
  const paymentsQuery = new PaymentQueries();
  const { data, isSuccess, isError, error, isLoading } = useFetchQuery(
    ["payments"],
    paymentsQuery.getAll,
    30000
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
          <div className="flex justify-between">
            <h2>Tickets</h2>
          </div>
          <TicketsTable data={data.data} isAdmin={false} />
        </div>
      </div>
    );
};

export default Liste;
