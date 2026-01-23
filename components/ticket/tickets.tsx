import { TicketTable } from "@/app/tableau-de-bord/ticket/ticket-table";
import { PaymentRequest, RequestType } from "@/types/types";

interface Props {
  ticketsData: PaymentRequest[];
  requestTypeData: RequestType[];
}

export default function Tickets({ ticketsData, requestTypeData }: Props) {
  return <TicketTable data={ticketsData} requestTypeData={requestTypeData} />;
}
