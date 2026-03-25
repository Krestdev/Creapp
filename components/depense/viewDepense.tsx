import {
  PaymentRequest,
  PayType,
  RequestModelT,
  RequestType,
  User,
} from "@/types/types";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
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

interface Props {
  open: boolean;
  openChange: Dispatch<SetStateAction<boolean>>;
  paymentRequest: PaymentRequest;
  payTypes: Array<PayType>;
  users: Array<User>;
  requests: Array<RequestModelT>;
  requestTypes: Array<RequestType>;
}

const PaymentReceipt: React.FC<Props> = ({
  open,
  openChange,
  paymentRequest,
  payTypes,
  users,
  requests,
  requestTypes,
}) => {
  return (
    <div>
      <Dialog open={open} onOpenChange={openChange}>
        <DialogContent>
          {/* Header with burgundy background */}
          <DialogHeader>
            <DialogTitle>{`Reçu ${paymentRequest.title}`}</DialogTitle>
            <DialogDescription className="text-sm text-white/80 mt-1">
              {"Informations relatives aux bons de commande"}
            </DialogDescription>
          </DialogHeader>

          {/* Option 1: PDF Viewer (for preview) */}
          <div style={{ height: "500px", marginBottom: "20px" }}>
            <PDFViewer width="100%" height="100%">
              <DepenseDocument
                getPaymentType={payTypes}
                paymentRequest={paymentRequest}
                users={users}
                requests={requests}
                requestTypes={requestTypes}
              />
            </PDFViewer>
          </div>

          {/* Option 2: PDF Download Link */}
          <DialogFooter className="shrink-0 sticky z-10 w-full bottom-0">
            <PDFDownloadLink
              document={
                <DepenseDocument
                  getPaymentType={payTypes}
                  paymentRequest={paymentRequest}
                  users={users}
                  requests={requests}
                  requestTypes={requestTypes}
                />
              }
              fileName={`recu-transport-${paymentRequest.reference}.pdf`}
            >
              {({ loading }) => (
                <Button disabled={loading}>
                  {loading ? "Génération du PDF..." : "Télécharger le PDF"}
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
