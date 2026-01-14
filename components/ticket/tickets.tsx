import { TicketsTable } from "@/components/tables/tickets-table";
import { useStore } from "@/providers/datastore";
import { PaymentRequest } from "@/types/types";
import { RequestType } from "@/types/types";

interface Props {
  ticketsData: PaymentRequest[];
  requestTypeData: RequestType[];
}

const Tickets = ({ ticketsData, requestTypeData }: Props) => {
  const approved = ticketsData.filter(
    (ticket) => ticket.status === "validated"
  );
  const paid = ticketsData.filter((ticket) => ticket.status === "paid");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex justify-between"></div>
        <div className="flex flex-col">
          <h2>{"En attentes d'approbation"}</h2>
          <TicketsTable data={ticketsData.filter(t => t.status === "accepted")} isAdmin={true} requestTypeData={requestTypeData} />
        </div>
        <div className="flex flex-col">
          <h2>{"Tickets traités"}</h2>
          <TicketsTable
            data={paid.concat(approved)}
            isAdmin={true}
            isManaged={true}
            requestTypeData={requestTypeData}
          />
        </div>
      </div>
    </div>
  );
};

export default Tickets;
