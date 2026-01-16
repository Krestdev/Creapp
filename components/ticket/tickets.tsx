import { TicketsTable } from "@/components/tables/tickets-table";
import { useStore } from "@/providers/datastore";
import { PAY_STATUS, PAYMENT_TYPES, PaymentRequest, PRIORITIES } from "@/types/types";
import { RequestType } from "@/types/types";
import { TabBar } from "../base/TabBar";
import React from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Settings2 } from "lucide-react";
import { Input } from "../ui/input";
import { VariantProps } from "class-variance-authority";
import { badgeVariants } from "../ui/badge";
import { TicketTable } from "@/app/tableau-de-bord/ticket/ticket-table";

interface Props {
  ticketsData: PaymentRequest[];
  requestTypeData: RequestType[];
}

const Tickets = ({ ticketsData, requestTypeData }: Props) => {
  return (
    <TicketTable data={ticketsData} requestTypeData={requestTypeData} />
  );
};

export default Tickets;