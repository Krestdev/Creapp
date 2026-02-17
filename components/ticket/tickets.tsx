import { TicketTable } from "@/app/tableau-de-bord/ticket/ticket-table";
import { Invoice, PaymentRequest, RequestType } from "@/types/types";

interface Props {
  ticketsData: PaymentRequest[];
  requestTypeData: RequestType[];
  invoices: Invoice[];
}

export default function Tickets({ ticketsData, requestTypeData, invoices }: Props) {
  return <TicketTable data={ticketsData} requestTypeData={requestTypeData} invoices={invoices} />;
}
