import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { CommandRequestT, Quotation, Reception, RECEPTION_STATUS, User } from "@/types/types";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarFold,
  CalendarIcon,
  CheckIcon,
  FileIcon,
  FileTextIcon,
  HelpCircle,
  LucideHash,
  MessageSquareQuoteIcon,
  ScrollText,
  SquareUser,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface Props {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  reception: Reception;
  devis: Quotation[];
  cmdReqst: CommandRequestT[];
}

function ViewReception({ open, onOpenChange, reception, devis, cmdReqst }: Props) {
  const getStatusBadge = (
    status: Reception["Status"],
  ): {
    label: string;
    variant: VariantProps<typeof badgeVariants>["variant"];
  } => {
    const statusData = RECEPTION_STATUS.find((s) => s.value === status);
    const label = statusData?.name ?? "Inconnu";
    switch (status) {
      case "PENDING":
        return { label, variant: "amber" };
      case "PARTIAL":
        return { label, variant: "primary" };
      case "COMPLETED":
        return { label, variant: "success" };
      default:
        return { label: "Inconnu", variant: "outline" };
    }
  };

  const devi = devis.find((d) => d.id === reception.Command?.deviId)
  const cmdReqs = cmdReqst.find((c) => c.id === devi?.commandRequestId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`${cmdReqs?.title ?? "Non défini"}`}</DialogTitle>
          <DialogDescription>
            {"Réception du bon de commande"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="view-group">
            <span className="view-icon">
              <LucideHash />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Référence"}</p>
              <div className="w-fit bg-primary-100 flex items-center justify-center px-1.5 rounded">
                <p className="text-primary-600 text-sm">
                  {reception.Reference || "N/A"}
                </p>
              </div>
            </div>
          </div>
          {/**Fournisseur */}
          <div className="view-group">
            <span className="view-icon">
              <SquareUser />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Fournisseur"}</p>
              <p className="font-semibold">
                {reception.Provider?.name ?? "Non défini"}
              </p>
            </div>
          </div>
          {/**Status */}
          <div className="view-group">
            <span className="view-icon">
              <HelpCircle />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Statut"}</p>
              <Badge variant={getStatusBadge(reception.Status).variant}>
                {getStatusBadge(reception.Status).label}
              </Badge>
            </div>
          </div>
          {/**Reference Bon */}
          <div className="view-group">
            <span className="view-icon">
              <FileTextIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Référence Bon"}</p>
              <Badge variant={"outline"}>
                {reception.Command?.reference || "N/A"}
              </Badge>
            </div>
          </div>
          {/**Date limite */}
          <div className="view-group">
            <span className="view-icon">
              <CalendarFold />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Date limite"}</p>
              <p className="font-semibold">
                {format(new Date(reception.Deadline), "dd MMMM yyyy", {
                  locale: fr,
                })}
              </p>
            </div>
          </div>
          {/**Livrables */}
          <div className="view-group">
            <span className="view-icon">
              <ScrollText />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Livrables"}</p>
              <div className="grid gap-1">
                {reception.Deliverables.map((item, id) => (
                  <span
                    className="w-full inline-flex gap-1.5 items-center text-sm font-medium"
                    key={id}
                  >
                    <Badge
                      variant={item.delivered === 0 ? "destructive" : item.delivered === item.quantity ? "success" : "amber"}
                    >
                      {`${item.delivered}/${item.quantity}`}
                    </Badge>
                    {item.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/**Note */}
          <div className="view-group">
            <span className="view-icon">
              <MessageSquareQuoteIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Commentaires"}</p>
              <p className="font-semibold">
                {!!reception.note && reception.note.length > 0 ? reception.note : "Aucune note enregistrée"}
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
                {!!reception.Proof ? (
                  reception.Proof.split(";").map((proof, index) => (
                    <Link
                      key={index}
                      href={`${process.env.NEXT_PUBLIC_API
                        }/${proof}`}
                      target="_blank"
                      className="flex gap-0.5 items-center"
                    >
                      <img
                        src="/images/pdf.png"
                        alt="justificatif"
                        className="h-7 w-auto aspect-square"
                      />
                      <p className="text-foreground font-medium">
                        {`Fichier_${index + 1}`}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="italic">{"Aucun justificatif"}</p>
                )}
              </div>
            </div>
          </div>
          {/**Created/Updated */}
          <div className="view-group">
            <span className="view-icon">
              <CalendarIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">
                {reception.updatedAt ? "Mis à jour le" : "Créé le"}
              </p>
              <p className="font-semibold">
                {format(
                  new Date(reception.updatedAt || reception.createdAt),
                  "dd MMMM yyyy",
                  { locale: fr },
                )}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"}>{"Fermer"}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ViewReception;
