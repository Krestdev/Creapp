"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, getQuotationAmount, XAF } from "@/lib/utils";
import { Provider, Quotation, RequestModelT, User } from "@/types/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CheckCircle,
  DollarSign,
  FileIcon,
  LucideCalendar,
  LucideCalendarFold,
  LucideHash,
  LucideUserCircle2,
  LucideUserRound,
  XCircle,
} from "lucide-react";
import Link from "next/link";
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
  data: Quotation;
  title: string | undefined;
  users: Array<User>;
  providers: Array<Provider>;
  requests: Array<RequestModelT>;
}

export function DevisModal({
  open,
  onOpenChange,
  data,
  title,
  users,
  providers,
  requests,
}: DetailModalProps) {
  const totalAmount = getQuotationAmount(data, providers);

  // Récupérer les informations de l'utilisateur (à adapter selon votre structure)
  // const getUserName = (userId: string | number | undefined) => {
  //   // Ici, vous devriez récupérer le nom de l'utilisateur depuis votre store ou API
  //   // Pour l'instant, on retourne l'ID ou une valeur par défaut
  //   return userId ? `Utilisateur ${userId}` : "Non spécifié";
  // };

  // Récupérer le nom du fournisseur (à adapter selon votre structure)
  const getProviderName = (providerId?: number) => {
    return providers.find((p) => p.id === providerId)?.name || "Non spécifié";
  };
  const provider = providers.find((p) => p.id === data.providerId);

  const getUserName = (userId?: number) => {
    return (
      users.find((u) => u.id === userId)?.firstName +
        " " +
        users.find((u) => u.id === userId)?.lastName || "Non spécifique"
    );
  };

  const getRequestTitle = (requestId?: number) => {
    return requests.find((r) => r.id === requestId)?.label || "Non spécifié";
  };

  // Formater les dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non spécifié";
    try {
      return format(new Date(dateString), "PPP", { locale: fr });
    } catch {
      return "Date invalide";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] lg:max-w-[920px] max-h-screen overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="uppercase">
            {`Devis - ${title || "Sans titre"}`}
          </DialogTitle>
          <DialogDescription>{"Détail du devis"}</DialogDescription>
        </DialogHeader>

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
                  <p className="text-[#9E1351] text-sm">{data.ref ?? "N/A"}</p>
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
                  {getProviderName(data.providerId)}
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
                  {getUserName(data.userId)}
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
                  {formatDate(data.createdAt)}
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
                  {formatDate(data.dueDate)}
                </p>
              </div>
            </div>
            {/**Justificatif */}
            <div className="view-group">
              <span className="view-icon">
                <FileIcon />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Justificatif"}</p>
                <div className="space-y-1">
                  {data.proof && typeof data.proof === "string" ? (
                    data.proof
                      .split(";")
                      .filter((x) => !!x)
                      .map((proof, index) => (
                        <Link
                          key={index}
                          href={`${process.env.NEXT_PUBLIC_API}/${proof}`}
                          target="_blank"
                          className="flex gap-0.5 items-center"
                        >
                          <img
                            src="/images/pdf.png"
                            alt="preuve"
                            className="h-7 w-auto aspect-square"
                          />
                          <p className="text-foreground font-medium">
                            {"Document de preuve"}
                          </p>
                        </Link>
                      ))
                  ) : (
                    <p className="italic">{"Aucune preuve jointe"}</p>
                  )}
                </div>
              </div>
            </div>

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
                    <TableHead>{"Prix HT"}</TableHead>
                    <TableHead>{"Réduction"}</TableHead>
                    <TableHead>{"TVA"}</TableHead>
                    <TableHead>{"IS/IR"}</TableHead>
                    <TableHead>{"Total"}</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data?.element?.map((el, index) => {
                    //IS/IR
                    const isIr = !el.hasIs
                      ? 0
                      : !provider
                        ? 0
                        : provider.regem === "Réel"
                          ? 2.2
                          : 5.5;
                    //Lines
                    const lineBase = el.priceProposed * el.quantity;
                    const lineReduction = (lineBase * el.reduction) / 100;
                    const lineTVA = ((lineBase - lineReduction) * el.tva) / 100;
                    const lineIsIr = ((lineBase - lineReduction) * isIr) / 100;
                    return (
                      <TableRow
                        key={index}
                        className={cn(
                          index % 2 === 0 ? "bg-white" : "bg-gray-50",
                          el.status === "SELECTED" && "bg-green-50!",
                          el.status === "REJECTED" && "bg-red-50!",
                        )}
                      >
                        <TableCell className="font-medium inline-flex gap-1 items-center">
                          {getRequestTitle(el.requestModelId) || "N/A"}
                          {el.status === "SELECTED" && (
                            <CheckCircle size={12} className="text-green-600" />
                          )}
                          {el.status === "REJECTED" && (
                            <XCircle size={12} className="text-destructive" />
                          )}
                        </TableCell>
                        <TableCell>{el.title ?? "N/A"}</TableCell>
                        <TableCell>{`${XAF.format(el.priceProposed ?? 0)} x(${el.quantity})`}</TableCell>
                        <TableCell>{XAF.format(lineReduction)}</TableCell>
                        <TableCell>{XAF.format(lineTVA)}</TableCell>
                        <TableCell>{XAF.format(lineIsIr)}</TableCell>
                        <TableCell>
                          {XAF.format(
                            lineBase - lineReduction + lineTVA - lineIsIr,
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {"Fermer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
