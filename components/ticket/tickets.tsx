import { TicketsTable } from "@/components/tables/tickets-table";
import { useStore } from "@/providers/datastore";
import { PaymentRequest } from "@/types/types";
import { RequestType } from "@/types/types";
import { TabBar } from "../base/TabBar";
import { useState } from "react";

interface Props {
  ticketsData: PaymentRequest[];
  requestTypeData: RequestType[];
}

const Tickets = ({ ticketsData, requestTypeData }: Props) => {
  const approved = ticketsData.filter(
    (ticket) => ticket.status === "validated"
  );
  const paid = ticketsData.filter((ticket) => ticket.status === "paid");
  const accepted = ticketsData.filter(t => t.status === "accepted");
  const tabs = [
    { id: 0, title: "En attentes d'approbation" },
    { id: 1, title: "Tickets traités" },
  ];
  const [selectedTab, setSelectedTab] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      <TabBar tabs={tabs} setSelectedTab={setSelectedTab} selectedTab={selectedTab} />
      <div className="flex flex-col">
        {selectedTab === 0 ?
          <div className="flex flex-col">
            {/* <h2>{"En attentes d'approbation"}</h2> */}
            <TicketsTable data={accepted} isAdmin={true} requestTypeData={requestTypeData} />
          </div> :
          <div className="flex flex-col">
            {/* <h2>{"Tickets traités"}</h2> */}
            <TicketsTable
              data={paid.concat(approved)}
              isAdmin={true}
              isManaged={true}
              requestTypeData={requestTypeData}
            />
          </div>}
      </div>
    </div>
  );
};

export default Tickets;