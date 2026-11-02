"use client";
import { ViewGrid, ViewGroup } from "@/components/ds/view-dialog";
import { Button } from "@/components/ui/button";
import { cn, getQuotationAmount, XAF } from "@/lib/utils";
import { Provider, Quotation, User } from "@/types/types";
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
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerEyebrow,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
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
}

export function DevisModal({
  open,
  onOpenChange,
  data,
  title,
  users,
  providers,
}: DetailModalProps) {
  const totalAmount = getQuotationAmount(data, providers);

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

  // Formater les dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non spécifié";
    try {
      return format(new Date(dateString), "dd MMMM yyyy à kk:mm", {
        locale: fr,
      });
    } catch {
      return "Date invalide";
    }
  };

  const totals = data.element.reduce(
    (acc, el) => {
      // 1. Determine the IS/IR rate
      const isIrRate =
        !el.hasIs || !provider ? 0 : provider.regem === "Réel" ? 2.2 : 5.5;

      // 2. Calculate values for the current line
      const lineBase = el.priceProposed * el.quantity;
      const lineReduction = (lineBase * el.reduction) / 100;
      const lineNet = lineBase - lineReduction; // Net amount after discount

      const lineTVA = (lineNet * el.tva) / 100;
      const lineIsIr = (lineNet * isIrRate) / 100;

      // 3. Return the updated accumulator object
      return {
        totalBase: acc.totalBase + lineBase,
        totalReduction: acc.totalReduction + lineReduction,
        totalTVA: acc.totalTVA + lineTVA,
        totalIsIR: acc.totalIsIR + lineIsIr,
      };
    },
    // 4. Correct Initial Value (must match the shape of the output)
    { totalTVA: 0, totalBase: 0, totalReduction: 0, totalIsIR: 0 },
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="sm:max-w-3xl">
        <DrawerHeader>
          <DrawerEyebrow>{"Commandes"}</DrawerEyebrow>
          <DrawerTitle>{`Devis - ${title || "Sans titre"}`}</DrawerTitle>
          <DrawerDescription>{"Détail du devis"}</DrawerDescription>
        </DrawerHeader>

        <DrawerBody>
          <ViewGrid>
            <ViewGroup icon={LucideHash} label="Référence">
              <div className="w-fit bg-primary-100 flex items-center justify-center px-1.5 rounded">
                <p className="text-primary text-sm">{data.ref ?? "N/A"}</p>
              </div>
            </ViewGroup>
            <ViewGroup icon={DollarSign} label="Montant total">
              <p className="font-semibold">{XAF.format(totalAmount)}</p>
            </ViewGroup>
            <ViewGroup icon={LucideUserCircle2} label="Fournisseur">
              <p className="font-semibold">
                {getProviderName(data.providerId)}
              </p>
            </ViewGroup>
            <ViewGroup icon={LucideUserRound} label="Initié par">
              <p className="font-semibold uppercase">
                {getUserName(data.userId)}
              </p>
            </ViewGroup>
            <ViewGroup icon={LucideCalendar} label="Créé le">
              <p className="font-semibold">{formatDate(data.createdAt)}</p>
            </ViewGroup>
            <ViewGroup icon={LucideCalendarFold} label="Date limite">
              <p className="font-semibold">{formatDate(data.dueDate)}</p>
            </ViewGroup>
            <ViewGroup icon={FileIcon} label="Justificatif">
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
                          {"Devis"}
                        </p>
                      </Link>
                    ))
                ) : (
                  <p className="italic">{"Aucune preuve jointe"}</p>
                )}
              </div>
            </ViewGroup>
            <ViewGroup icon={LucideCalendar} label="Modifié le">
              <p className="font-semibold">{formatDate(data?.updatedAt)}</p>
            </ViewGroup>

            <div className="col-span-full w-full overflow-x-auto rounded-lg border border-border-default">
              <Table className="w-full">
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
                  {data.element?.map((el, index) => {
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
                          el.status === "SELECTED" && "bg-green-50!",
                          el.status === "REJECTED" && "bg-red-50!",
                        )}
                      >
                        <TableCell className="font-medium inline-flex gap-1 items-center">
                          {el?.request?.label || "N/A"}
                          {el.status === "SELECTED" && (
                            <CheckCircle size={12} className="text-green-600" />
                          )}
                          {(el.status === "REJECTED" ||
                            el.status === "DISCARDED") && (
                            <XCircle size={12} className="text-destructive" />
                          )}
                        </TableCell>
                        <TableCell className="sm:whitespace-normal">
                          {el.title ?? "N/A"}
                        </TableCell>
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
            <div className="col-span-full flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-text-secondary">{"Total Réduction"}</span>
                <span className="font-semibold">
                  {XAF.format(totals.totalReduction)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary">{"Total HT"}</span>
                <span className="font-semibold">
                  {XAF.format(totals.totalBase - totals.totalReduction)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary">{"Total TVA"}</span>
                <span className="font-semibold">
                  {XAF.format(totals.totalTVA)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary">{"Total Is/Ir"}</span>
                <span className="font-semibold">
                  {XAF.format(totals.totalIsIR)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary">{"Total TTC"}</span>
                <span className="rounded-md bg-primary-100 px-3 py-1.5 font-semibold text-primary-700">
                  {XAF.format(
                    totals.totalBase -
                      totals.totalReduction +
                      totals.totalTVA -
                      totals.totalIsIR,
                  )}
                </span>
              </div>
            </div>
          </ViewGrid>
        </DrawerBody>

        <DrawerFooter pinned>
          <DrawerClose asChild>
            <Button variant="outline">{"Fermer"}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
