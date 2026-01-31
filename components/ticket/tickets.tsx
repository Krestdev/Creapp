import { TicketTable } from "@/app/tableau-de-bord/ticket/ticket-table";
import { BonsCommande, PaymentRequest, RequestType } from "@/types/types";

interface Props {
  ticketsData: PaymentRequest[];
  requestTypeData: RequestType[];
  purchases: BonsCommande[];
}

export default function Tickets({ ticketsData, requestTypeData, purchases }: Props) {
  return <TicketTable data={ticketsData} requestTypeData={requestTypeData} purchases={purchases} />;
}
