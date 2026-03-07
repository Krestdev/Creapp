"use client";

import { TicketsTable } from "@/components/tables/tickets-table";
import { paymentQ } from "@/queries/payment";
import LoadingPage from "../loading-page";
import ErrorPage from "../error-page";
import { requestTypeQ } from "@/queries/requestType";
import { useQuery } from "@tanstack/react-query";
import { requestQ } from "@/queries/requestModule";
import { userQ } from "@/queries/baseModule";
import { payTypeQ } from "@/queries/payType";

const Liste = () => {
  const { data, isSuccess, isError, error, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: paymentQ.getAll,
  });
  const getRequestType = useQuery({
    queryKey: ["requestType"],
    queryFn: requestTypeQ.getAll,
  });

  const getRequests = useQuery({
    queryKey: ["requests"],
    queryFn: requestQ.getAll,
  });

  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: userQ.getAll
  });

  const getPaymentType = useQuery({
    queryKey: ["paymentType"],
    queryFn: payTypeQ.getAll,
  });

  if (isLoading || getRequestType.isLoading || getRequests.isLoading || getUsers.isLoading || getPaymentType.isLoading) {
    return <LoadingPage />;
  }
  if (isError || getRequestType.isError || getRequests.isError || getUsers.isError || getPaymentType.isError) {
    return <ErrorPage error={error || getRequestType.error || getRequests.error || getPaymentType.error ||  getUsers.error!} />;
  }
  if (isSuccess && getRequestType.isSuccess && getRequests.isSuccess && getUsers.isSuccess && getPaymentType.isSuccess)
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
            users={getUsers.data.data}
            requests={getRequests.data.data} 
            payTypes={getPaymentType.data.data}          />
        </div>
      </div>
    );
};

export default Liste;
