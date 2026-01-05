"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, XAF } from "@/lib/utils";
import { Quotation } from "@/types/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CheckCircle,
  DollarSign,
  LucideBriefcaseBusiness,
  LucideCalendar,
  LucideCalendarFold,
  LucideFile,
  LucideHash,
  LucideUserCircle2,
  LucideUserRound,
  XCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { UserQueries } from "@/queries/baseModule";
import { useQuery } from "@tanstack/react-query";
import { ProviderQueries } from "@/queries/providers";
import { RequestQueries } from "@/queries/requestModule";
import React from "react";
import ShowFile from "../base/show-file";
import { DownloadFile } from "../base/downLoadFile";

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

  const [page, setPage] = React.useState(1);
  const [file, setFile] = React.useState<string | File | undefined>(undefined);

  const users = new UserQueries();
  const usersData = useQuery({
    queryKey: ["usersList"],
    queryFn: () => users.getAll(),
  });

  const providers = new ProviderQueries();
  const providersData = useQuery({
    queryKey: ["providersList"],
    queryFn: () => providers.getAll(),
  });

  const request = new RequestQueries();
  const requestsData = useQuery({
    queryKey: ["requestsList"],
    queryFn: () => request.getAll(),
  });

  // Récupérer les informations de l'utilisateur (à adapter selon votre structure)
  // const getUserName = (userId: string | number | undefined) => {
  //   // Ici, vous devriez récupérer le nom de l'utilisateur depuis votre store ou API
  //   // Pour l'instant, on retourne l'ID ou une valeur par défaut
  //   return userId ? `Utilisateur ${userId}` : "Non spécifié";
  // };

  // Récupérer le nom du fournisseur (à adapter selon votre structure)
  const getProviderName = (providerId: number | undefined) => {
    return (
      providersData.data?.data?.find((p) => p.id === providerId)?.name ||
      "Non spécifié"
    );
  };

  const getUserName = (userId: number | undefined) => {
    return (
      usersData.data?.data?.find((u) => u.id === userId)?.name ||
      "Non spécifique"
    );
  };

  const getRequestTitle = (requestId: number | undefined) => {
    return (
      requestsData.data?.data?.find((r) => r.id === requestId)?.label ||
      "Non spécifié"
    );
  };

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
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          setPage(1);
        }
      }}
    >
      <DialogContent className="sm:max-w-[90vw] lg:max-w-[920px] max-h-screen overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="uppercase">
            {`Devis - ${quotation || "Sans titre"}`}
          </DialogTitle>
          <DialogDescription>
            {page === 1
              ? "Détail du devis"
              : `Justificatif du devis ${quotation}`}
          </DialogDescription>
        </DialogHeader>

        {/* Infos générales */}
        {page === 1 ? (
          <div className="flex gap-3 p-4">
            <div className="w-full grid grid-cols-3 gap-3 py-3">
              {/* Référence */}
              <div className="view-group">
                <span className="view-icon">
                  <LucideHash />
                </span>
                <div className="flex flex-col">
                  <p className="text-gray-600">{"Référence"}</p>
                  <div className="w-fit bg-[#F2CFDE] flex items-center justify-center px-1.5 rounded">
                    <p className="text-[#9E1351] text-sm">
                      {data?.ref || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Montant */}
              <div className="view-group">
                <span className="view-icon">
                  <DollarSign />
                </span>
                <div className="flex flex-col">
                  <p className="text-gray-600">{"Montant total"}</p>
                  <p className="text-sm font-semibold">
                    {XAF.format(totalAmount)}
                  </p>
                </div>
              </div>

              {/* Fournisseur */}
              <div className="view-group">
                <span className="view-icon">
                  <LucideUserCircle2 />
                </span>
                <div className="flex flex-col">
                  <p className="text-gray-600">{"Fournisseur"}</p>
                  <p className="text-sm font-semibold">
                    {getProviderName(data?.providerId)}
                  </p>
                </div>
              </div>

              {/* Initié par */}
              <div className="view-group">
                <span className="view-icon">
                  <LucideUserRound />
                </span>
                <div className="flex flex-col">
                  <p className="text-gray-600">{"Initié par"}</p>
                  <p className="text-sm font-semibold uppercase">
                    {getUserName(data?.userId)}
                  </p>
                </div>
              </div>

              {/* Créé le */}
              <div className="view-group">
                <span className="view-icon">
                  <LucideCalendar />
                </span>
                <div className="flex flex-col">
                  <p className="text-gray-600">{"Créé le"}</p>
                  <p className="text-sm font-semibold">
                    {formatDate(data?.createdAt)}
                  </p>
                </div>
              </div>

              {/* Date limite */}
              <div className="view-group">
                <span className="view-icon">
                  <LucideCalendarFold />
                </span>
                <div className="flex flex-col">
                  <p className="text-gray-600">{"Date limite"}</p>
                  <p className="text-sm font-semibold">
                    {formatDate(data?.dueDate)}
                  </p>
                </div>
              </div>

              {/* Justificatifs */}
              <Button
                variant={"ghost"}
                className="w-full h-fit px-0 flex flex-row items-center text-start justify-start gap-2"
                disabled={!data?.proof}
                onClick={() => {
                  setPage(2);
                  setFile(data?.proof);
                }}
              >
                <span className="view-icon">
                  <LucideFile />
                </span>
                <div className="flex flex-col">
                  <p className="text-gray-600">{"Justificatifs"}</p>
                  <div className="flex gap-1.5 items-center">
                    {data?.proof ? (
                      <>
                        <img
                          src="/images/pdf.png"
                          alt="justificatif"
                          className="h-8 w-auto aspect-square"
                        />
                        <p className="text-[#2F2F2F] text-[12px] font-medium">
                          {data.proof
                            ? "Document justificatif"
                            : "Aucun justificatif"}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">
                        {"Aucun justificatif"}
                      </p>
                    )}
                  </div>
                </div>
              </Button>

              {/* Modifié le */}
              <div className="view-group">
                <span className="view-icon">
                  <LucideCalendar />
                </span>
                <div className="flex flex-col">
                  <p className="text-gray-600">{"Modifié le"}</p>
                  <p className="text-sm font-semibold">
                    {formatDate(data?.updatedAt)}
                  </p>
                </div>
              </div>

              {/* TABLEAU QUI PREND 2 COLONNES */}
              <div className="col-span-3 w-full overflow-x-auto">
                <Table className="w-full border rounded-lg bg-white">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{"Besoin"}</TableHead>
                      <TableHead>{"Élément"}</TableHead>
                      <TableHead>{"Quantité"}</TableHead>
                      <TableHead>{"Prix Unitaire"}</TableHead>
                      <TableHead>{"Total"}</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {data?.element?.map((el, index) => (
                      <TableRow
                        key={index}
                        className={cn(index % 2 === 0 ? "bg-white" : "bg-gray-50", el.status === "SELECTED" && "bg-green-50!", el.status === "REJECTED" && "bg-red-50!")}
                      >
                        <TableCell className="font-medium inline-flex gap-1 items-center">
                          {getRequestTitle(el.requestModelId) || "N/A"}
                          {el.status === "SELECTED" && <CheckCircle size={12} className="text-green-600" />}
                          {el.status === "REJECTED" && <XCircle size={12} className="text-destructive" />}
                        </TableCell>
                        <TableCell>{el.title || "N/A"}</TableCell>
                        <TableCell>
                          {el.quantity || 0} {el.unit || "unité"}
                        </TableCell>
                        <TableCell>
                          {XAF.format(el.priceProposed || 0)}
                        </TableCell>
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
            </div>
          </div>
        ) : (
          <ShowFile
            file={file}
            setPage={setPage}
            title={`Justificatif du devis ${quotation}`}
          />
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pt-0">
          {page === 2 && <DownloadFile file={file} />}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {"Fermer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
