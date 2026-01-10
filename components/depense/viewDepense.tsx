import { PaymentRequest } from "@/types/types";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import React, { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import DepenseDocument from "./depenseDoc";

interface Props {
  open: boolean;
  openChange: Dispatch<SetStateAction<boolean>>;
  paymentRequest: PaymentRequest;
}

const PaymentReceipt: React.FC<Props> = ({
  open,
  openChange,
  paymentRequest,
}) => {
  // Example payment request data
  // const [paymentRequest] = useState<PaymentRequest>({
  //   id: 1,
  //   reference: "TRANS-2023-001",
  //   proof: "proof.pdf",
  //   status: "pending",
  //   type: "PURCHASE",
  //   method: "bank-transfer",
  //   deadline: new Date("2023-12-31"),
  //   title: "Frais de transport mensuel",
  //   description: "Déplacement client pour réunion projet X - Trajet Paris-Lyon",
  //   beneficiary: {
  //     id: 1,
  //     email: "john.doe@example.com",
  //     firstName: "John",
  //     lastName: "Doe",
  //     status: "active",
  //     lastConnection: new Date().toISOString(),
  //     role: [],
  //     members: [],
  //   },
  //   model: "Peugeot 308",
  //   km: 450,
  //   liters: 35,
  //   price: 189.5,
  //   priority: "medium",
  //   isPartial: false,
  //   userId: 1,
  //   createdAt: new Date().toISOString(),
  //   updatedAt: new Date().toISOString(),
  // });

  // const handleDownloadClick = () => {
  //   // Close the dialog after download is triggered
  //   setTimeout(() => {
  //     openChange(false);
  //   }, 500);
  // };

  // (newOpen) => {
  //         // Prevent closing via ESC key or clicking outside
  //         if (!newOpen) {
  //           return;
  //         }
  //       }

  return (
    <div>
      <h2>Reçu de Transport</h2>
      <Dialog open={open} onOpenChange={openChange}>
        <DialogContent className="max-h-[750px] max-w-4xl! gap-0 overflow-hidden border-none flex flex-col">
          {/* Header with burgundy background */}
          <DialogHeader className="bg-[#8B1538] text-white mb-2 rounded-lg relative">
            <DialogTitle className="text-xl font-semibold text-white uppercase">
              {`Recu ${paymentRequest.title}`}
            </DialogTitle>
            <p className="text-sm text-white/80 mt-1">
              {"Informations relatives aux bons de commande"}
            </p>
          </DialogHeader>

          {/* Option 1: PDF Viewer (for preview) */}
          <div style={{ height: "500px", marginBottom: "20px" }}>
            <PDFViewer width="100%" height="100%">
              <DepenseDocument paymentRequest={paymentRequest} />
            </PDFViewer>
          </div>

          {/* Option 2: PDF Download Link */}
          <DialogFooter className="shrink-0 sticky z-10 w-full bottom-0">
            <PDFDownloadLink
              document={<DepenseDocument paymentRequest={paymentRequest} />}
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
