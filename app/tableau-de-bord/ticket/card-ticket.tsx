import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  cn,
  getPaymentPriorityBadge,
  getPaymentTypeBadge,
  XAF,
} from "@/lib/utils";
import {
  Invoice,
  RequestModelT,
  RequestType,
  User,
  PaymentRequest,
} from "@/types/types";
import { BanIcon, ChevronDown, Eye, LucideCheck } from "lucide-react";
import React from "react";
import RejectTicket from "./reject-ticket";
import { DetailTicket } from "@/components/modals/detail-ticket";
import { ModalWarning } from "@/components/modals/modal-warning";
import { useMutation } from "@tanstack/react-query";
import { paymentQ, UpdatePayment } from "@/queries/payment";
import { toast } from "sonner";

interface Props {
  data: PaymentRequest;
  requestTypeData: RequestType[];
  invoices: Array<Invoice>;
  users: Array<User>;
  requests: Array<RequestModelT>;
}

function CardTicket({
  data,
  requestTypeData,
  requests,
  invoices,
  users,
}: Props) {
  const [message, setMessage] = React.useState<string>("");
  const [openDetailModal, setOpenDetailModal] = React.useState(false);
  const [openRejectModal, setOpenRejectModal] = React.useState(false);
  const [openValidationModal, setOpenValidationModal] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState<PaymentRequest>();
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice>();

  const invoice = invoices.find((item) => item.id === Number(data.invoiceId));

  const validateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePayment }) => {
      return paymentQ.vaidate(id, data);
    },
    onSuccess: () => {
      toast.success(message);
      !message.includes("payé") && setOpenValidationModal(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const style = (): {
    className: HTMLDivElement["className"];
    label: string;
  } => {
    switch (data.status) {
      case "pending":
        return {
          className: "bg-linear-to-b from-amber-600 to-amber-400 text-white",
          label: "En attente",
        };
      case "accepted":
        return {
          className: "bg-linear-to-b from-orange-600 to-orange-400 text-white",
          label: "En attente",
        };
      case "paid":
        return {
          className: "bg-linear-to-b from-green-600 to-green-400 text-white",
          label: "Payé",
        };
      case "rejected":
        return {
          className: "bg-linear-to-b from-red-600 to-red-400 text-white",
          label: "Rejeté",
        };
      case "signed":
        return {
          className: "bg-linear-to-b from-teal-600 to-teal-400 text-white",
          label: "Signé",
        };
      case "validated":
        return {
          className: "bg-linear-to-b from-blue-600 to-blue-400 text-white",
          label: "Validé",
        };
      case "simple_signed":
        return {
          className: "bg-linear-to-b from-teal-600 to-teal-400 text-white",
          label: "Signé",
        };
      case "unsigned":
        return {
          className:
            "bg-linear-to-b from-emerald-600 to-emerald-400 text-white",
          label: "Non signé",
        };
      default:
        return {
          className: "bg-linear-to-b from-gray-50 to-gray-400 text-gray-900",
          label: data.status,
        };
    }
  };
  const typeBadge = getPaymentTypeBadge({
    type: data.type,
    typeList: requestTypeData,
  });
  const priorityBadge = getPaymentPriorityBadge({ priority: data.priority });
  return (
    <div
      className={cn(
        "w-full rounded-xl overflow-hidden shadow-xs border",
        style().className,
      )}
    >
      <p className="w-full px-3 py-1 text-sm uppercase text-center tracking-widest">
        {style().label}
      </p>
      <div className="w-full h-full relative p-1 pb-4 bg-background rounded-lg flex flex-col gap-2.5">
        <div className="p-3 rounded-lg border border-dashed bg-gray-50 flex flex-col gap-1.5">
          <span className="inline-flex gap-2 justify-between items-start">
            <p className="text-sm font-semibold text-gray-900 line-clamp-2">
              {data.title}
            </p>
            <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
          </span>
          <p className="text-xs text-gray-700 line-clamp-4 normal-case">
            {data.description ?? "Pas de description"}
          </p>
          <hr />
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <span className="text-xs uppercase text-gray-600">
              {"priorité"}
            </span>
            <Badge variant={priorityBadge.variant}>{priorityBadge.label}</Badge>
          </div>
        </div>
        <div className="px-3 flex justify-between gap-2 items-center flex-wrap">
          <span className="text-xs uppercase text-gray-600">{"montant"}</span>
          <span className="text-base font-bold text-primary-600">
            {XAF.format(data.price)}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="w-fit">
            <Button variant="ghost" className="ml-auto mr-3">
              {"Actions"}
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                setSelectedInvoice(invoice);
                setSelectedTicket(data);
                setOpenDetailModal(true);
              }}
            >
              <Eye />
              {"Voir"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setMessage("Ticket approuvé avec succès");
                setSelectedTicket(data);
                setOpenValidationModal(true);
              }}
              disabled={
                data.status === "validated" ||
                data.status === "signed" ||
                data.status === "simple_signed" ||
                data.status === "unsigned" ||
                data.status === "paid" ||
                data.status === "rejected"
              }
            >
              <LucideCheck className="text-green-600" />
              {"Approuver"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setMessage("Ticket approuvé avec succès");
                setSelectedTicket(data);
                setOpenRejectModal(true);
              }}
              disabled={
                data.status === "validated" ||
                data.status === "signed" ||
                data.status === "simple_signed" ||
                data.status === "unsigned" ||
                data.status === "paid" ||
                data.status === "rejected"
              }
            >
              <BanIcon />
              {"Rejeter"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {!!selectedTicket && (
        <DetailTicket
          open={openDetailModal}
          onOpenChange={setOpenDetailModal}
          data={selectedTicket}
          invoice={selectedInvoice}
          users={users}
          types={requestTypeData}
          requests={requests}
        />
      )}

      <ModalWarning
        open={openValidationModal}
        variant="success"
        onOpenChange={setOpenValidationModal}
        title={
          "Approbation" +
          " - " +
          selectedTicket?.title +
          " - " +
          selectedTicket?.reference
        }
        description={"Voulez-vous valider ce ticket ?"}
        onAction={() =>
          validateMutation.mutate({
            id: selectedTicket?.id!,
            data: {
              invoiceId: selectedTicket?.invoiceId,
              price: selectedTicket?.price,
              status: "validated",
            },
          })
        }
        actionText={"Approuver"}
      />

      {selectedTicket && (
        <RejectTicket
          payment={selectedTicket}
          open={openRejectModal}
          openChange={setOpenRejectModal}
          invoices={invoices}
        />
      )}
    </div>
  );
}

export default CardTicket;
