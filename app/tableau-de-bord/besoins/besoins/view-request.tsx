"use client";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { cn, getUserName, XAF } from "@/lib/utils";
import {
  Category,
  PaymentRequest,
  ProjectT,
  RequestModelT,
  User,
} from "@/types/types";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { ArrowBigUpIcon, BriefcaseBusinessIcon, Calendar, CalendarClock, Check, Clock, DollarSignIcon, Edit, FileIcon, FolderIcon, InfoIcon, LucideHash, LucidePieChart, MessageSquareXIcon, SquareStackIcon, TextQuoteIcon, UserIcon, Users, X } from "lucide-react";
import Link from "next/link";
import React from "react";

interface ViewRequestProps {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  request: RequestModelT;
  payments: Array<PaymentRequest>;
  users: Array<User>;
  projects: Array<ProjectT>;
  categories: Array<Category>;
}

function ViewRequest({
  open,
  openChange,
  request,
  payments,
  users,
  projects,
  categories,
}: ViewRequestProps) {

    const getStatusBadge = (
    status: RequestModelT["state"],
  ): {
    label: string;
    variant: VariantProps<typeof badgeVariants>["variant"];
  } => {
    switch (status) {
      case "pending":
        return { label: "En attente", variant: "amber" };
      case "cancel":
        return { label: "Annulé", variant: "dark" };
      case "validated":
        return { label: "Approuvé", variant: "success" };
      case "rejected":
        return { label: "Rejeté", variant: "destructive" };
      case "in-review":
        return { label: "En révision", variant: "lime" };
      case "store":
        return { label: "Déstocké", variant: "blue" };
      default:
        return { label: status, variant: "default" };
    }
  };

  const getPriority = (priority :RequestModelT["priority"]):{
    label: string;
    variant: VariantProps<typeof badgeVariants>["variant"];
  } => {
    switch(priority){
        case "high" :
            return {label: "Élevée", variant: "purple"};
        case "low" :
            return {label: "Faible", variant: "outline"};
        case "medium":
            return {label: "Normale", variant: "amber"};
        case "urgent":
            return {label: "Urgent", variant: "destructive"}
    }
  }

  // Fonctions pour récupérer les noms
  const getProjectName = (projectId: string) => {
    const project = projects.find(
      (proj) => proj.id === Number(projectId),
    );
    return project?.label || projectId;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(
      (cat) => cat.id === Number(categoryId),
    );
    return category?.label || categoryId;
  };

   const paiement = payments.find(
    (x) => x.requestId === request.id,
  );

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"default"}>
            <DialogTitle>{`Besoin - ${request.label}`}</DialogTitle>
            <DialogDescription>{"Description du besoin"}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 @min-[540px]/dialog:grid-cols-2 gap-3">
            {/**Reference */}
            <div className="view-group">
              <span className="view-icon">
                <LucideHash />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Référence"}</p>
                <div className="w-fit bg-primary-100 flex items-center justify-center px-1.5 rounded">
                  <p className="text-primary-600 text-sm">{request.ref}</p>
                </div>
              </div>
            </div>

            {/**Amount */}
            {!!request.amount && (
              <div className="view-group">
                <span className="view-icon">
                  <DollarSignIcon />
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <p className="view-group-title">{"Montant"}</p>
                  </div>
                  <p className="font-semibold">{XAF.format(request.amount)}</p>
                </div>
              </div>
            )}

            {/* Project */}
            {!!request.projectId && (
              <div className="view-group">
                <span className="view-icon">
                  <BriefcaseBusinessIcon />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Projet associé"}</p>
                  <p className="font-semibold">
                    {getProjectName(String(request.projectId))}
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="view-group">
              <span className="view-icon">
                <TextQuoteIcon />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Description"}</p>
                <p className={cn(!request.description && "italic text-gray-600")}>
                  {request.description ?? "Non renseigné"}
                </p>
              </div>
            </div>

            {/* Catégorie */}
            <div className="view-group">
              <span className="view-icon">
                <FolderIcon />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Catégorie"}</p>
                <p className="font-semibold">
                  {!getCategoryName(String(request.categoryId)).includes("facilita")
                    ? getCategoryName(String(request.categoryId))
                    : request.type === "facilitation"
                      ? "Facilitation"
                      : request.type === "ressource_humaine"
                        ? "Ressources Humaines"
                        : request.type === "speciaux" && "Besoins Spéciaux"}
                </p>
              </div>
            </div>

            {/* Priorité */}
            <div className="view-group">
              <span className="view-icon">
                <ArrowBigUpIcon />
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <p className="view-group-title">{"Priorité"}</p>
                </div>
                <Badge
                  variant={getPriority(request.priority).variant}
                >
                  {request.priority === "urgent" ? (
                    <X />
                  ) : request.priority === "medium" ? (
                    <Clock />
                  ) : (
                    <Check />
                  )}
                  {getPriority(request.priority).label}
                </Badge>
              </div>
            </div>

            {/* Statut */}
            <div className="view-group">
              <span className="view-icon">
                <InfoIcon />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Statut"}</p>
                <Badge variant={getStatusBadge(request.state).variant}>
                  {getStatusBadge(request.state).label}
                </Badge>
              </div>
            </div>

            {/* Motif de rejet */}
            {request.state === "rejected" && (
              <div className="view-group">
                <span className="view-icon">
                  <MessageSquareXIcon />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Motif du rejet"}</p>
                  <p className="text-destructive">
                    {request.validators
                      ?.filter((r) => r.decision?.startsWith("rejected"))
                      .map((r) => r.decision?.replace(/^rejected - \s*/i, "").trim())
                      .join(", ") || "Aucun motif fourni"}
                  </p>
                </div>
              </div>
            )}

            {/* Justificatif */}
            {request.type !== "speciaux" && request.type !== "achat" && (
              <div className="view-group">
                <span className="view-icon">
                  <FileIcon />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Justificatif"}</p>
                  <div className="space-y-1">
                    {!!paiement?.proof ? (
                      <Link
                        href={`${process.env.NEXT_PUBLIC_API
                          }/${paiement?.proof as string}`}
                        target="_blank"
                        className="flex gap-0.5 items-center"
                      >
                        <img
                          src="/images/pdf.png"
                          alt="justificatif"
                          className="h-7 w-auto aspect-square"
                        />
                      </Link>
                    ) : (
                      <p className="italic">{"Aucun justificatif"}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quantité pour achat */}
            {request.type === "achat" && (
              <div className="view-group">
                <span className="view-icon">
                  <LucidePieChart />
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <p className="view-group-title">{"Quantité"}</p>
                  </div>
                  <p className="font-semibold">
                    {request.quantity + " " + request.unit}
                  </p>
                </div>
              </div>
            )}

            {/* Période pour ressources humaines */}
            {request.type === "ressource_humaine" && (
              <div className="view-group">
                <span className="view-icon">
                  <CalendarClock />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Période"}</p>
                  {request.period ? (
                    <p className="font-semibold">{`Du ${format(
                      request.period.from!,
                      "PPP",
                      { locale: fr },
                    )} au ${format(request.period.to!, "PPP", {
                      locale: fr,
                    })}`}</p>
                  ) : (
                    <p>{"Non renseigné"}</p>
                  )}
                </div>
              </div>
            )}

            {/* Pour le compte de (facilitation) */}
            {request.type === "facilitation" && (
              <div className="view-group">
                <span className="view-icon">
                  <Users />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Pour le compte de"}</p>
                  <div className="flex flex-col">
                    {request.benFac?.list?.map((ben) => {
                      return (
                        <p
                          key={ben.id}
                          className="font-semibold capitalize"
                        >{`${ben?.name} - ${XAF.format(ben?.amount)}`}</p>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Initié par */}
            <div className="view-group">
              <span className="view-icon">
                <UserIcon />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Initié par"}</p>
                <p className="font-semibold capitalize">
                  {getUserName(users, request.userId)}
                </p>
              </div>
            </div>

            {/* Date de création */}
            <div className="view-group">
              <span className="view-icon">
                <Calendar />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Créé le"}</p>
                <p className="font-semibold">
                  {format(request.createdAt, "PPP", { locale: fr })}
                </p>
              </div>
            </div>

            {/* Date de modification */}
            <div className="view-group">
              <span className="view-icon">
                <Calendar />
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <p className="view-group-title">{"Modifié le"}</p>
                </div>
                <p className="font-semibold">
                  {format(request.updatedAt, "PPP", { locale: fr })}
                </p>
              </div>
            </div>

            {/* Date limite */}
            <div className="view-group">
              <span className="view-icon">
                <Calendar />
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <p className="view-group-title">{"Date limite"}</p>
                </div>
                <p className="font-semibold">
                  {format(request.dueDate!, "PPP", { locale: fr })}
                </p>
              </div>
            </div>

            {/* Bénéficiaires */}
            {request.type !== "speciaux" && (
              <div className="view-group">
                <span className="view-icon">
                  <Users />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">
                    {request.type === "facilitation"
                      ? "Recepteur pour compte"
                      : "Bénéficiaires"}
                  </p>
                  {request.type === "facilitation" ? (
                    <p className="font-semibold capitalize">
                      {users.find(
                        (u) => u.id === Number(request.beneficiary),
                      )?.firstName +
                        " " +
                        users.find(
                          (u) => u.id === Number(request.beneficiary),
                        )?.lastName}
                    </p>
                  ) : (
                    <div className="flex flex-col">
                      {request.beneficiary === "me" ? (
                        <p className="font-semibold capitalize">
                          {request.requestOlds && request.requestOlds[0].id ? getUserName(users, request.requestOlds[0].id) : "Introuvable"}
                        </p>
                      ) : (
                        <div className="flex flex-col">
                          {request.beficiaryList?.map((ben) => {
                            const beneficiary = users.find(
                              (x) => x.id === ben.id,
                            );
                            return (
                              <p
                                key={ben.id}
                                className="font-semibold capitalize"
                              >{`${beneficiary?.firstName +
                                " " +
                                beneficiary?.lastName || ben.id
                                }`}</p>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Validation History */}
            {
              request.type === "speciaux" ? null : (
                <div className="view-group">
                  <span className="view-icon">
                    <SquareStackIcon />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Historique de validation"}</p>
                    <div className="grid gap-2">
                      {request.validators.sort((a, b) => a.rank - b.rank).map(v => {
                        return (
                          <div key={v.id} className={cn("px-3 py-2 flex flex-col gap-1 border", !v.decision ? "bg-gray-50 border-gray-200" : v.decision.includes("reject") ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200")}>
                            <p className={cn("text-sm font-medium", !v.decision ? "text-gray-600" : v.decision.includes("reject") ? "text-red-600" : "text-green-600")}>{!v.decision ? "En attente" : v.decision.includes("reject") ? "Rejeté" : "Approuvé"}</p>
                            <span>{users.find(u => u.id === v.userId)?.firstName + " " + users.find(u => u.id === v.userId)?.lastName}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
          </div>
          {/* Boutons du footer */}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{"Fermer"}</Button>
            </DialogClose>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ViewRequest;
