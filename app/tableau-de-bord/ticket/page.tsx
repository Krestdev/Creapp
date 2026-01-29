"use client";

import Empty from "@/components/base/empty";
import StatsCard from "@/components/base/StatsCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import Tickets from "@/components/ticket/tickets";
import { useStore } from "@/providers/datastore";
import { paymentQ } from "@/queries/payment";
import { requestTypeQ } from "@/queries/requestType";
import { PaymentRequest } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

function Page() {
  const { user } = useStore();

  const { data, isSuccess, isError, error, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: paymentQ.getAll,
  });

  const getRequestType = useQuery({
    queryKey: ["requestType"],
    queryFn: requestTypeQ.getAll,
  });

  const ticketsData: Array<PaymentRequest> = useMemo(() => {
    if (!data?.data) return [];
    return data?.data.filter((ticket) => ticket.status !== "ghost" && ticket.status !== "rejected" && ticket.status !== "pending" && ticket.status !== "cancelled");
  }, [data?.data]);

  const pending = useMemo(() => {
    if (!data?.data) return [];
    return ticketsData.filter((ticket) =>
      ticket.status === "accepted"
    );
  }, [data?.data]);

  const approved = useMemo(() => {
    if (!data?.data) return [];
    return ticketsData.filter(
      (ticket) =>
        ticket.status !== "accepted"
    );
  }, [data?.data]);

  const unPaid = useMemo(() => {
    if (!data?.data) return [];
    return ticketsData.filter(
      (ticket) =>
        ticket.status !== "paid" &&
        ticket.status !== "accepted"
    );
  }, [data?.data]);

  if (isLoading || getRequestType.isLoading) {
    return <LoadingPage />;
  }

  if (isError || getRequestType.isError) {
    return <ErrorPage error={error || getRequestType.error!} />;
  }

  if (isSuccess && getRequestType.isSuccess) {
    return (
      <div className="flex flex-col gap-6">
        {user?.role.flatMap((r) => r.label).includes("VOLT") ? (
          <PageTitle
            title="Tickets"
            subtitle="Consultez et payez les tickets."
            color="red"
          />
        ) : (
          <>
            <PageTitle
              title="Approbation"
              subtitle="Validez les tickets de paiement des bons de commandes"
              color="green"
            />
            <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4 items-center gap-5">
              <StatsCard
                title="Total Tickets"
                titleColor="text-[#fff]"
                value={String(ticketsData.length)}
                description="Tickets en attente :"
                descriptionValue={String(pending.length)}
                descriptionColor="text-[#fff]"
                dividerColor="bg-[#DFDFDF]"
                className={"bg-[#013E7B] text-[#E4E4E7] border-[#BBF7D0]"}
                dvalueColor="text-yellow-400"
              />

              <StatsCard
                title="Tickets Validées"
                titleColor="text-[#52525B]"
                value={String(approved.length)}
                description="Tickets non payés :"
                descriptionValue={String(unPaid.length)}
                descriptionColor="text-[#A1A1AA]"
                dividerColor="bg-[#DFDFDF]"
                className={"bg-[#FFFFFF] text-[#000000] border-[#DFDFDF]"}
                dvalueColor="text-destructive"
              />
            </div>
          </>
        )}
        {ticketsData.length > 0 ? (
          <Tickets
            ticketsData={ticketsData}
            requestTypeData={getRequestType.data?.data}
          />
        ) : (
          <Empty message={"Aucun ticket disponible"} />
        )}
      </div>
    );
  }
}

export default Page;
