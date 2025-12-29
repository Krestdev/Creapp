import { TicketsTable } from "@/components/tables/tickets-table";
import { useStore } from "@/providers/datastore";
import { PaymentRequest } from "@/types/types";
import React from "react";

interface Props {
  ticketsData: PaymentRequest[];
}

const Tickets = ({ ticketsData }: Props) => {
  const approved = ticketsData.filter(
    (ticket) => ticket.status === "validated"
  );
  const { user } = useStore();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2>{"Tickets"}</h2>
        </div>
        {user?.role.flatMap((x) => x.label).includes("ACCOUNTING") ? (
          <TicketsTable data={approved} isAdmin={false} />
        ) : (
          <TicketsTable data={ticketsData} isAdmin={true} />
        )}
        {/* <TicketsTable data={ticketsData} isAdmin={true} /> */}
      </div>
    </div>
  );
};

export default Tickets;
