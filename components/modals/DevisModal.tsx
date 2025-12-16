"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { XAF } from "@/lib/utils";
import { Quotation } from "@/types/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  DollarSign,
  LucideBriefcaseBusiness,
  LucideCalendar,
  LucideCalendarFold,
  LucideFile,
  LucideHash,
  LucideUserCircle2,
  LucideUserRound,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface DetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Quotation | undefined;
  quotation: string | undefined;
}

export function DevisModal({
  open,
  onOpenChange,
  data,
  quotation,
}: DetailModalProps) {
  const totalAmount =
    data?.element?.reduce((acc, curr) => acc + curr.priceProposed, 0) || 0;

  // Récupérer les informations de l'utilisateur (à adapter selon votre structure)
  // const getUserName = (userId: string | number | undefined) => {
  //   // Ici, vous devriez récupérer le nom de l'utilisateur depuis votre store ou API
  //   // Pour l'instant, on retourne l'ID ou une valeur par défaut
  //   return userId ? `Utilisateur ${userId}` : "Non spécifié";
  // };

  // Récupérer le nom du fournisseur (à adapter selon votre structure)
  const getProviderName = (providerId: number | undefined) => {
    // Ici, vous devriez récupérer le nom du fournisseur depuis votre store ou API
    // Pour l'instant, on retourne une valeur par défaut
    return providerId ? `Fournisseur ${providerId}` : "Non spécifié";
  };

  // Récupérer les projets associés (à adapter selon votre structure)
  // const getAssociatedProjects = () => {
  //   // Ici, vous devriez récupérer les projets depuis votre store ou API
  //   // Pour l'instant, on retourne une valeur par défaut
  //   return data?.projectNames || "Créaconsult, Médiatech";
  // };

  // Formater les dates
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Non spécifié";
    try {
      return format(new Date(dateString), "PPP", { locale: fr });
    } catch {
      return "Date invalide";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]! max-h-screen overflow-y-auto p-0 gap-0 overflow-x-hidden border-none">
        {/* Header */}
        <DialogHeader className="bg-linear-to-r from-[#9E1351] to-[#700032] text-white p-6 m-4 rounded-lg pb-8 relative">
          <DialogTitle className="text-xl font-semibold text-white">
            {`Devis - ${quotation || "Sans titre"}`}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#FAFAFA]">
            Détail du devis
          </DialogDescription>
        </DialogHeader>

        {/* Infos générales */}
        <div className="flex gap-3 p-4">
          <div className="w-full grid grid-cols-2 gap-3 py-3">
            {/* Référence */}
            <div className="w-full flex flex-row items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-[#E4E4E7] size-10">
                <LucideHash size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-[#52525B]">Référence</p>
                <div className="w-fit bg-[#F2CFDE] flex items-center justify-center px-1.5 rounded">
                  <p className="text-[#9E1351] text-sm">{data?.ref || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Projet */}
            <div className="w-full flex flex-row items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-[#E4E4E7] size-10">
                <LucideBriefcaseBusiness size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-[#52525B]">Projets associés</p>
                {/* <p className="text-sm font-semibold">{getAssociatedProjects()}</p> */}
              </div>
            </div>

            {/* Montant */}
            <div className="w-full flex flex-row items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-[#E4E4E7] size-10">
                <DollarSign size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-[#52525B]">Montant total</p>
                <p className="text-sm font-semibold">
                  {XAF.format(totalAmount)}
                </p>
              </div>
            </div>

            {/* Fournisseur */}
            <div className="w-full flex flex-row items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-[#E4E4E7] size-10">
                <LucideUserCircle2 size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-[#52525B]">Fournisseur</p>
                <p className="text-sm font-semibold">
                  {getProviderName(data?.providerId)}
                </p>
              </div>
            </div>

            {/* TABLEAU QUI PREND 2 COLONNES */}
            <div className="col-span-2 w-full overflow-x-auto">
              <Table className="w-full border rounded-lg bg-white">
                <TableHeader>
                  <TableRow>
                    <TableHead>{"Besoin"}</TableHead>
                    <TableHead>{"Désignation"}</TableHead>
                    <TableHead>{"Quantité"}</TableHead>
                    <TableHead>{"Prix Unitaire"}</TableHead>
                    <TableHead>{"Total"}</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data?.element?.map((el, index) => (
                    <TableRow
                      key={index}
                      className={`${index % 2 === 0 ? "bg-[#FAFAFA]" : ""}`}
                    >
                      <TableCell className="font-medium">
                        {el.requestModelId || "N/A"}
                      </TableCell>
                      <TableCell>{el.title || "N/A"}</TableCell>
                      <TableCell>
                        {el.quantity || 0} {el.unit || "unité"}
                      </TableCell>
                      <TableCell>{XAF.format(el.priceProposed || 0)}</TableCell>
                      <TableCell>
                        {XAF.format(
                          (el.quantity || 0) * (el.priceProposed || 0)
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Initié par */}
            <div className="w-full flex flex-row items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-[#E4E4E7] size-10">
                <LucideUserRound size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-[#52525B]">Initié par</p>
                {/* <p className="text-sm font-semibold">{getUserName(data?.userId)}</p> */}
              </div>
            </div>

            {/* Créé le */}
            <div className="w-full flex flex-row items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-[#E4E4E7] size-10">
                <LucideCalendar size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-[#52525B]">Créé le</p>
                <p className="text-sm font-semibold">
                  {formatDate(data?.createdAt)}
                </p>
              </div>
            </div>

            {/* Date limite */}
            <div className="w-full flex flex-row items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-[#E4E4E7] size-10">
                <LucideCalendarFold size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-[#52525B]">Date limite</p>
                <p className="text-sm font-semibold">
                  {formatDate(data?.dueDate)}
                </p>
              </div>
            </div>

            {/* Justificatifs */}
            <div className="w-full flex flex-row items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-[#E4E4E7] size-10">
                <LucideFile size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-[#52525B]">Justificatifs</p>
                <div className="flex gap-1.5 items-center">
                  {data?.proof ? (
                    <>
                      <img
                        src="/images/pdf.png"
                        alt="justificatif"
                        className="h-8 w-auto aspect-square"
                      />
                      <div>
                        {/* <p className="text-[#2F2F2F] text-[12px] font-medium">
                          {data.proof.name || "Document justificatif"}
                        </p>
                        <p className="text-[#A1A1AA] text-[12px]">
                          {data.proof.size ? `${(data.proof.size / 1024).toFixed(1)} ko` : "Taille inconnue"}
                        </p> */}
                        <p className="text-[#2F2F2F] text-[12px] font-medium">
                          {"Document justificatif"}
                        </p>
                        <p className="text-[#A1A1AA] text-[12px]">
                          {true
                            ? `${(20 / 1024).toFixed(1)} ko`
                            : "Taille inconnue"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Aucun justificatif</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modifié le */}
            <div className="w-full flex flex-row items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-[#E4E4E7] size-10">
                <LucideCalendar size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-[#52525B]">Modifié le</p>
                <p className="text-sm font-semibold">
                  {formatDate(data?.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pt-0">
          <Button
            variant="primary"
            onClick={() => {
              // Logique pour modifier le devis
              console.log("Modifier le devis:", data);
              onOpenChange(false);
            }}
          >
            Modifier
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
