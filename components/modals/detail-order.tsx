"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CommandRequestT } from "@/types/types";
import { DownloadButton } from "../bdcommande/TéléchargeButton";

interface DetailOrderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CommandRequestT | null;
}

export function DetailOrder({ open, onOpenChange, data }: DetailOrderProps) {
  // const request = new RequestQueries();
  // const user = new UserQueries();

  // const userData = useQuery({
  //   queryKey: ["users"],
  //   queryFn: async () => user.getAll(),
  // });

  // const requestData = useQuery({
  //   queryKey: ["requests"],
  //   queryFn: async () => request.getAll(),
  // });

  if (!data) return null;

  // const statusConfig = {
  //   pending: {
  //     label: "En attente",
  //     color:
  //       "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  //   },
  //   approved: {
  //     label: "Approuvé",
  //     color:
  //       "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  //   },
  //   rejected: {
  //     label: "Rejeté",
  //     color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  //   },
  //   "in-review": {
  //     label: "En révision",
  //     color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  //   },
  // };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[750px] overflow-y-auto p-0 gap-0 overflow-x-hidden border-none flex flex-col">
        {/* Header with burgundy background */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative">
          <DialogTitle className="text-xl font-semibold text-white">
            {data.title}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Informations relatives à la commande"}
          </p>
        </DialogHeader>
        {/* <div className="m-4">
          <CotationPDF data={data} />
        </div> */}
        <div className="w-full p-6 text-sm leading-relaxed">
          {/* TITRE */}
          <div className="mb-3">
            <h2 className="text-[16px] font-bold uppercase tracking-wide text-[#8A0035]">
              Demande de Cotation
            </h2>
          </div>

          {/* INFORMATIONS */}
          <div className="flex flex-col mb-6 space-y-2">
            <div className="flex gap-2">
              <p className="w-fit font-semibold underline text-[10px]">
                Objet :
              </p>
              <p className="flex-1 text-[10px]">{data.title}</p>
            </div>

            <div className="flex gap-2">
              <p className="w-fit font-semibold underline text-[10px]">
                Référence :
              </p>
              <p className="flex-1 text-[10px]">{data.reference}</p>
            </div>

            <div className="flex gap-2">
              <p className="w-fit font-semibold underline text-[10px]">
                Date limite :
              </p>
              <p className="flex-1 text-[10px]">
                {data.dueDate
                  ? new Date(data.dueDate).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </p>
            </div>

            {/* CONTACT */}
            <div className="flex flex-col mt-4 space-y-1">
              <div className="flex gap-2">
                <p className="w-fit font-semibold underline text-[10px]">
                  Contact principal :
                </p>
                <p className="flex-1 text-[10px]">
                  M. Jean Phillipe (Responsable Achat)
                </p>
              </div>

              <div className="flex gap-2">
                <p className="w-fit font-semibold underline text-[10px]">
                  Téléphone :
                </p>
                <p className="flex-1 text-[10px]">+33 35 45 45</p>
              </div>
            </div>
          </div>

          {/* TITRE SECTION */}
          <div className="mb-3">
            <h3 className="text-[14px] font-semibold uppercase tracking-wide">
              Liste des éléments
            </h3>
          </div>

          {/* TABLEAU */}
          {/* TABLEAU */}
          <div className="border border-blacK mb-6">
            {/* HEADER */}
            <div className="flex bg-gray-100 border-b border-black text-[12px] leading-tight font-bold uppercase">
              <div className="border-black p-2 w-[31%]">TITRE DU BESOIN</div>

              <div className="border-black p-2 w-[39%]">
                DESCRIPTION DÉTAILLÉE & SPÉCIFICATIONS
              </div>

              <div className="border-black p-2 w-[13%]">UNITE</div>

              <div className="p-2 w-[13%]">QUANTITÉ</div>
            </div>

            {/* ROWS */}
            {data.besoins?.map((item, i) => (
              <div
                key={i}
                className="flex border-b border-gray-300 text-[12px] leading-snug"
              >
                <div className="border-black p-2 w-[31%]">
                  {item.label || "-"}
                </div>

                <div className="border-black p-2 w-[39%]">
                  {item.description || "-"}
                </div>

                <div className="border-black p-2 w-[13%]">
                  {item.unit || "-"}
                </div>

                <div className="border-black p-2 w-[13%]">
                  {item.quantity || "-"}
                </div>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div className="pt-4 text-left text-xs italic text-gray-600">
            Créé le{" "}
            {new Date(data.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            .
          </div>
        </div>
        {/* Footer buttons */}
        <div className="flex w-full justify-end gap-3 p-6 pt-0">
          <DownloadButton data={data} />

          <Button className="bg-primary hover:bg-primary/80 text-white">
            {"Modifier"}
          </Button>

          <Button
            variant="outline"
            className="bg-transparent"
            onClick={() => onOpenChange(false)}
          >
            {"Fermer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
