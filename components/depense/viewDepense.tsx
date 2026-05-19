import { CrossPlatformPDFViewer } from "@/components/cross-view-pdf";
import { PaymentRequest, PayType, RequestType, User } from "@/types/types";
import { PDFDownloadLink } from "@react-pdf/renderer";
import React, { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import DepenseDocument from "./depenseDoc";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { transactionQ } from "@/queries/transaction";

interface Props {
  open: boolean;
  openChange: Dispatch<SetStateAction<boolean>>;
  paymentRequest: PaymentRequest;
  payTypes: Array<PayType>;
  users: Array<User>;
  requestTypes: Array<RequestType>;
}

const PaymentReceipt: React.FC<Props> = ({
  open,
  openChange,
  paymentRequest,
  payTypes,
  users,
  requestTypes,
}) => {
  const getTransaction = useQuery({
    queryKey: queryKeys.transaction(paymentRequest.transactionId!),
    queryFn: () => transactionQ.getOne(paymentRequest.transactionId!),
    enabled: !!paymentRequest.transactionId,
  });
  return (
    <div>
      <Dialog open={open} onOpenChange={openChange}>
        <DialogContent>
          {/* Header with burgundy background */}
          <DialogHeader>
            <DialogTitle>{`Reçu ${paymentRequest.title}`}</DialogTitle>
            <DialogDescription>
              {"Informations relatives aux bons de commande"}
            </DialogDescription>
          </DialogHeader>

          {/* Option 1: PDF Viewer (for preview) */}
          {getTransaction.isSuccess && (
            <div style={{ height: "500px", marginBottom: "20px" }}>
              <CrossPlatformPDFViewer
                document={
                  <DepenseDocument
                    getPaymentType={payTypes}
                    paymentRequest={paymentRequest}
                    users={users}
                    requestTypes={requestTypes}
                    transaction={getTransaction.data.data}
                  />
                }
                fileName={`Depense_${paymentRequest.reference}.pdf`}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          )}

          {/* Option 2: PDF Download Link */}
          <DialogFooter className="shrink-0 sticky z-10 w-full bottom-0">
            <PDFDownloadLink
              document={
                <DepenseDocument
                  getPaymentType={payTypes}
                  paymentRequest={paymentRequest}
                  users={users}
                  requestTypes={requestTypes}
                  transaction={getTransaction.data?.data}
                />
              }
              fileName={`recu-transport-${paymentRequest.reference}.pdf`}
            >
              {({ loading }) => (
                <Button disabled={loading || getTransaction.isPending}>
                  {loading || getTransaction.isPending
                    ? "Génération du PDF..."
                    : getTransaction.data
                      ? "Télécharger le PDF"
                      : "Erreur de génération"}
                </Button>
              )}
            </PDFDownloadLink>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentReceipt;
