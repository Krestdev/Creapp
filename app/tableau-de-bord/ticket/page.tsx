"use client";

import Empty from "@/components/base/empty";
import StatsCard from "@/components/base/StatsCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { useStore } from "@/providers/datastore";
import { userQ } from "@/queries/baseModule";
import { invoiceQ } from "@/queries/invoices";
import { paymentQ } from "@/queries/payment";
import { purchaseQ } from "@/queries/purchase-order";
import { requestQ } from "@/queries/requestModule";
import { requestTypeQ } from "@/queries/requestType";
import { PaymentRequest } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { TicketTable } from "./ticket-table";
import { projectQ } from "@/queries/projectModule";
import { payTypeQ } from "@/queries/payType";

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

  const getRequests = useQuery({
    queryKey: ["requests"],
    queryFn: requestQ.getAll,
  });

  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: userQ.getAll,
  });

  const getPurchase = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: purchaseQ.getAll,
  });

  const getInvoices = useQuery({
    queryKey: ["invoices"],
    queryFn: invoiceQ.getAll,
  });

  const getProjects = useQuery({
    queryKey: ["projects"],
    queryFn: projectQ.getAll,
  });

  const getPayTypes = useQuery({
    queryKey: ["payTypes"],
    queryFn: payTypeQ.getAll,
  });

  const ticketsData: Array<PaymentRequest> = useMemo(() => {
    const bannedTypes: Array<PaymentRequest["type"]> = [
      "transport",
      "others",
      // "appro",
      "gas",
    ];
    if (!data) return [];
    return data.data.filter(
      (ticket) =>
        ticket.status !== "ghost" &&
        ticket.status !== "cancelled" &&
        !bannedTypes.some((t) => t === ticket.type),
    );
  }, [data]);

  const pending = useMemo(() => {
    return ticketsData.filter(
      (ticket) => ticket.status === "accepted" || ticket.status === "pending",
    );
  }, [ticketsData]);

  const approved = useMemo(() => {
    return ticketsData.filter(
      (ticket) =>
        ticket.status !== "rejected" &&
        ticket.status !== "accepted" &&
        ticket.status !== "pending",
    );
  }, [ticketsData]);

  const unPaid = useMemo(() => {
    return ticketsData.filter(
      (ticket) =>
        ticket.status === "validated" ||
        ticket.status === "signed" ||
        ticket.status === "simple_signed" ||
        ticket.status === "unsigned",
    );
  }, [ticketsData]);

  if (
    isLoading ||
    getRequestType.isLoading ||
    getPurchase.isLoading ||
    getInvoices.isLoading ||
    getRequests.isLoading ||
    getUsers.isLoading ||
    getProjects.isLoading ||
    getPayTypes.isLoading
  ) {
    return <LoadingPage />;
  }

  if (
    isError ||
    getRequestType.isError ||
    getPurchase.isError ||
    getInvoices.isError ||
    getRequests.isError ||
    getUsers.isError ||
    getProjects.isError ||
    getPayTypes.isError
  ) {
    return (
      <ErrorPage
        error={
          error ||
          getRequestType.error! ||
          getPurchase.error! ||
          getInvoices.error! ||
          getUsers.error ||
          getRequests.error ||
          getProjects.error ||
          getPayTypes.error
        }
      />
    );
  }

  if (
    isSuccess &&
    getRequestType.isSuccess &&
    getPurchase.isSuccess &&
    getInvoices.isSuccess &&
    getRequests.isSuccess &&
    getUsers.isSuccess &&
    getProjects.isSuccess &&
    getPayTypes.isSuccess
  ) {
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
            <div className="grid-stats-4">
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
          <TicketTable
            invoices={getInvoices.data.data}
            data={ticketsData}
            requestTypeData={getRequestType.data.data}
            users={getUsers.data.data}
            requests={getRequests.data.data}
            projects={getProjects.data.data}
            payTypes={getPayTypes.data.data}
          />
        ) : (
          <Empty message={"Aucun ticket disponible"} />
        )}
      </div>
    );
  }
}

export default Page;
