"use client"

import { TicketsTable } from "@/components/tables/tickets-table";
import { useFetchQuery } from "@/hooks/useData";
import { PaymentQueries } from "@/queries/payment";
import LoadingPage from "../loading-page";
import ErrorPage from "../error-page";
import { RequestTypeQueries } from "@/queries/requestType";

const Liste = () => {
  const paymentsQuery = new PaymentQueries();
  const { data, isSuccess, isError, error, isLoading } = useFetchQuery(
    ["payments"],
    paymentsQuery.getAll,
    30000
  );
  const requestTypeQueries = new RequestTypeQueries();
  const getRequestType = useFetchQuery(["requestType"], requestTypeQueries.getAll, 30000);


  if (isLoading || getRequestType.isLoading) {
    return <LoadingPage />;
  }
  if (isError || getRequestType.isError) {
    return <ErrorPage error={error || getRequestType.error!} />;
  }
  if (isSuccess && getRequestType.isSuccess)

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <h2>Tickets</h2>
          </div>
          <TicketsTable data={data.data} isAdmin={false} requestTypeData={getRequestType.data.data} />
        </div>
      </div>
    );
};

export default Liste;
