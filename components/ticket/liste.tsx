"use client";

import { TicketsTable } from "@/components/tables/tickets-table";
import { paymentQ } from "@/queries/payment";
import LoadingPage from "../loading-page";
import ErrorPage from "../error-page";
import { requestTypeQ } from "@/queries/requestType";
import { useQuery } from "@tanstack/react-query";

const Liste = () => {
  const { data, isSuccess, isError, error, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: paymentQ.getAll,
  });
  const getRequestType = useQuery({
    queryKey: ["requestType"],
    queryFn: requestTypeQ.getAll,
  });

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
          <TicketsTable
            data={data.data}
            isAdmin={false}
            requestTypeData={getRequestType.data.data}
          />
        </div>
      </div>
    );
};

export default Liste;
