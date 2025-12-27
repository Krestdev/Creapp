"use client";

import TitleValueCard from "@/components/base/TitleValueCard";
import Tickets from "@/components/ticket/tickets";
import PageTitle from "@/components/pageTitle";
import { useStore } from "@/providers/datastore";
import { TicketsData } from "@/types/types";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import { useFetchQuery } from "@/hooks/useData";
import { PaymentQueries } from "@/queries/payment";
import Empty from "@/components/base/empty";

function Page() {
  const { user } = useStore();

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
  if (isSuccess) {
    const ticketsData = data?.data.filter((ticket) => ticket.status !== "ghost");
    const pending = ticketsData.filter((ticket) => ticket.status === "pending");
    const approved = ticketsData.filter(
      (ticket) => ticket.status !== "pending"
    );

    return (
      <div className="flex flex-col gap-6">
        {user?.role.flatMap((r) => r.label).includes("MANAGER") ? (
          <PageTitle
            title="Tickets"
            subtitle="Consultez et gérez les tickets."
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
              <TitleValueCard
                title="Tickets en attente"
                value={pending.length.toString()}
                className="bg-[#15803D] border border-[#2262A2] text-[#E4E4E7]"
                valColor="text-white"
              />
              <TitleValueCard
                title="Tickets Validées"
                value={approved.length.toString()}
                className="bg-[#013E7B] border border-[#BBF7D0] text-[#E4E4E7]"
                valColor="text-white"
              />
              <TitleValueCard
                title="Total Tickets"
                value={data.data.length.toString()}
                className="bg-white border border-[#DFDFDF] text-[#52525B]"
                valColor="text-black"
              />
            </div>
          </>
        )}
        {ticketsData.length > 0 ? (
          <Tickets ticketsData={ticketsData} />
        ) : (
          <Empty message={"Aucun ticket disponible"} />
        )}
      </div>
    );
  }
}

export default Page;
