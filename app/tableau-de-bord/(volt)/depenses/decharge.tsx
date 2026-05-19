"use client";
import DepenseDocument from "@/components/depense/depenseDoc";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/lib/query-keys";
import { transactionQ } from "@/queries/transaction";
import { PaymentRequest, PayType, RequestType, User } from "@/types/types";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import React from "react";

interface Props {
  paymentTypes: PayType[];
  paymentRequest: PaymentRequest;
  users: User[];
  requestTypes: RequestType[];
}

function Decharge({
  paymentTypes,
  paymentRequest,
  users,
  requestTypes,
}: Props) {
  const getTransaction = useQuery({
    queryKey: queryKeys.transaction(paymentRequest.transactionId!),
    queryFn: () => transactionQ.getOne(paymentRequest.transactionId!),
    enabled: !!paymentRequest.transactionId,
  });
  return (
    <PDFDownloadLink
      document={
        <DepenseDocument
          getPaymentType={paymentTypes}
          paymentRequest={paymentRequest}
          users={users}
          requestTypes={requestTypes}
          transaction={getTransaction.data?.data}
        />
      }
      fileName={`recu-${paymentRequest.type}-${paymentRequest.reference}.pdf`}
    >
      {({ loading }) => (
        <Button
          disabled={loading || !getTransaction.data}
          variant={"ghost"}
          className="font-normal px-0 text-gray-600 bg-transparent hover:bg-transparent h-5"
        >
          <Download />
          {loading || getTransaction.isPending
            ? "Génération du PDF..."
            : getTransaction.data
              ? "Télécharger le PDF"
              : "Erreur de génération"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}

export default Decharge;
