"use client";
import { RequestStepper } from "@/components/stepper";
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
import { queryKeys } from "@/lib/query-keys";
import { cn, getRequestTypeBadge, XAF } from "@/lib/utils";
import { categoryQ } from "@/queries/categoryModule";
import { paymentQ } from "@/queries/payment";
import { projectQ } from "@/queries/projectModule";
import { purchaseQ } from "@/queries/purchase-order";
import { receptionQ } from "@/queries/reception";
import { requestQ } from "@/queries/requestModule";
import { RequestModelT, RequestType, User } from "@/types/types";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import {
  ArchiveIcon,
  ArrowBigUpIcon,
  BriefcaseBusinessIcon,
  Calendar,
  CalendarClock,
  Check,
  Clock,
  DollarSignIcon,
  FileIcon,
  FolderIcon,
  InfoIcon,
  Loader2,
  LucideHash,
  LucidePieChart,
  MessageSquareXIcon,
  SquareStackIcon,
  TextQuoteIcon,
  UserIcon,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface ViewRequestProps {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  reqId: number;
  users: Array<User>;
  requestTypes: RequestType[];
}

function ViewRequest({
  open,
  openChange,
  reqId,
  users,
  requestTypes,
}: ViewRequestProps) {
  const getReceptions = useQuery({
    queryKey: queryKeys.receptions,
    queryFn: () => receptionQ.getAll(),
  });

  const getPurchases = useQuery({
    queryKey: queryKeys.purchaseOrders,
    queryFn: () => purchaseQ.getAll(),
  });

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

  const getPriority = (
    priority: RequestModelT["priority"],
  ): {
    label: string;
    variant: VariantProps<typeof badgeVariants>["variant"];
  } => {
    switch (priority) {
      case "high":
        return { label: "Élevée", variant: "purple" };
      case "low":
        return { label: "Faible", variant: "outline" };
      case "medium":
        return { label: "Normale", variant: "amber" };
      case "urgent":
        return { label: "Urgent", variant: "destructive" };
    }
  };

  const request = useQuery({
    queryKey: queryKeys.request(reqId),
    queryFn: () => requestQ.getOne(reqId),
  });

  const projectData = useQuery({
    queryKey: queryKeys.project(reqId),
    queryFn: async () => {
      return projectQ.getProjectByRequestId(reqId as number);
    },
  });
  const category = useQuery({
    queryKey: queryKeys.category(reqId),
    queryFn: async () => {
      return categoryQ.getCategoryForRequest(reqId as number);
    },
  });

  const paiements = useQuery({
    queryKey: queryKeys.payment(reqId),
    queryFn: async () => paymentQ.getAllByRequestId(reqId as number),
  });

  const typeBadge = request.data?.data.type
    ? getRequestTypeBadge({ type: request.data?.data.type, requestTypes })
    : null;

  return !request.isSuccess ? (
    <Loader2 className="w-4 h-4 animate-spin" />
  ) : (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"default"}>
          <DialogTitle>{`Besoin - ${request.data?.data.label}`}</DialogTitle>
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
                <p className="text-primary-600 text-sm">
                  {request.data?.data.ref}
                </p>
              </div>
            </div>
          </div>

          {/**Type */}
          <div className="view-group">
            <span className="view-icon">
              <ArchiveIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Type de besoin"}</p>
              <Badge variant={typeBadge?.variant}>{typeBadge?.label}</Badge>
            </div>
          </div>

          {/**Amount */}
          {!!request.data?.data.amount && (
            <div className="view-group">
              <span className="view-icon">
                <DollarSignIcon />
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <p className="view-group-title">{"Montant"}</p>
                </div>
                <p className="font-semibold">
                  {XAF.format(request.data?.data.amount)}
                </p>
              </div>
            </div>
          )}

          {/* Project */}
          {!!request.data?.data.projectId && (
            <div className="view-group">
              <span className="view-icon">
                <BriefcaseBusinessIcon />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Projet associé"}</p>
                <p className="font-semibold">
                  {projectData.isSuccess && projectData.data.data?.label}
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
              <p
                className={cn(
                  !request.data?.data.description && "italic text-gray-600",
                )}
              >
                {request.data?.data.description ?? "Non renseigné"}
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
                {!category.isSuccess
                  ? "chargement..."
                  : category.data.data.label.toLowerCase().includes("facilita")
                    ? category.data.data.label
                    : request.data?.data.type === "facilitation"
                      ? "Facilitation"
                      : request.data?.data.type === "ressource_humaine"
                        ? "Ressources Humaines"
                        : request.data?.data.type === "speciaux" &&
                          "Besoins Spéciaux"}
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
              <Badge variant={getPriority(request.data?.data.priority).variant}>
                {request.data?.data.priority === "urgent" ? (
                  <X />
                ) : request.data?.data.priority === "medium" ? (
                  <Clock />
                ) : (
                  <Check />
                )}
                {getPriority(request.data?.data.priority).label}
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
              <Badge variant={getStatusBadge(request.data?.data.state).variant}>
                {getStatusBadge(request.data?.data.state).label}
              </Badge>
            </div>
          </div>

          {/* Motif de rejet */}
          {request.data?.data.state === "rejected" && (
            <div className="view-group">
              <span className="view-icon">
                <MessageSquareXIcon />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Motif du rejet"}</p>
                <p className="text-destructive">
                  {request.data?.data.validators
                    ?.filter((r) => r.decision?.startsWith("rejected"))
                    .map((r) =>
                      r.decision?.replace(/^rejected - \s*/i, "").trim(),
                    )
                    .join(", ") || "Aucun motif fourni"}
                </p>
              </div>
            </div>
          )}

          {/* Justificatif */}
          {request.data?.data.type !== "speciaux" &&
            request.data?.data.type !== "achat" && (
              <div className="view-group">
                <span className="view-icon">
                  <FileIcon />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Justificatif"}</p>
                  <div className="space-y-1">
                    {request.data?.data.proof ? (
                      <Link
                        href={`${
                          process.env.NEXT_PUBLIC_API
                        }/${request.data?.data.proof[0] as string}`}
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
          {(request.data?.data.type === "achat" ||
            request.data?.data.type === "settle") && (
            <div className="view-group">
              <span className="view-icon">
                <LucidePieChart />
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <p className="view-group-title">{"Quantité"}</p>
                </div>
                <p className="font-semibold">
                  {request.data?.data.quantity + " " + request.data?.data.unit}
                </p>
              </div>
            </div>
          )}

          {/* Période pour ressources humaines */}
          {request.data?.data.type === "ressource_humaine" && (
            <div className="view-group">
              <span className="view-icon">
                <CalendarClock />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Période"}</p>
                {request.data?.data.period ? (
                  <p className="font-semibold">{`Du ${format(
                    request.data?.data.period.from!,
                    "PPP",
                    { locale: fr },
                  )} au ${format(request.data?.data.period.to!, "PPP", {
                    locale: fr,
                  })}`}</p>
                ) : (
                  <p>{"Non renseigné"}</p>
                )}
              </div>
            </div>
          )}

          {/* Pour le compte de (facilitation) */}
          {request.data?.data.type === "facilitation" && (
            <div className="view-group">
              <span className="view-icon">
                <Users />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Pour le compte de"}</p>
                <div className="flex flex-col">
                  {request.data?.data.benFac?.list?.map((ben) => {
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
                {request.data?.data.user.firstName +
                  " " +
                  request.data?.data.user.lastName}
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
                {format(request.data?.data.createdAt, "dd MMMM yyyy à kk:mm", {
                  locale: fr,
                })}
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
                {format(request.data?.data.updatedAt, "dd MMMM yyyy à kk:mm", {
                  locale: fr,
                })}
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
                {format(request.data?.data.dueDate!, "PPP", { locale: fr })}
              </p>
            </div>
          </div>

          {/* Bénéficiaires */}
          {request.data?.data.type !== "speciaux" && (
            <div className="view-group">
              <span className="view-icon">
                <Users />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">
                  {request.data?.data.type === "facilitation"
                    ? "Recepteur pour compte"
                    : "Bénéficiaires"}
                </p>
                {request.data?.data.type === "facilitation" ? (
                  <p className="font-semibold capitalize">
                    {users.find(
                      (u) => u.id === Number(request.data?.data.beneficiary),
                    )?.firstName +
                      " " +
                      users.find(
                        (u) => u.id === Number(request.data?.data.beneficiary),
                      )?.lastName}
                  </p>
                ) : (
                  <div className="flex flex-col">
                    {request.data?.data.beneficiary === "me" ? (
                      <p className="font-semibold capitalize">
                        {request.data?.data.user.firstName +
                          " " +
                          request.data?.data.user.lastName}
                      </p>
                    ) : (
                      <div className="flex flex-col">
                        {request.data?.data.beficiaryList?.map((ben) => {
                          const beneficiary = users.find(
                            (x) => x.id === ben.id,
                          );
                          return (
                            <p
                              key={ben.id}
                              className="font-semibold capitalize"
                            >{`${
                              beneficiary?.firstName +
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
          {request.data?.data.type === "speciaux" ? null : (
            <div className="w-full view-group">
              <span className="view-icon">
                <SquareStackIcon />
              </span>
              <div className="w-full flex flex-col">
                <p className="view-group-title">{"Historique de validation"}</p>
                <div className="w-full grid gap-2 mt-2">
                  {request.data?.data.validators
                    .sort((a, b) => a.rank - b.rank)
                    .map((v) => {
                      return (
                        <div
                          key={v.id}
                          className={cn(
                            "w-full px-3 py-2 flex flex-col gap-1 border",
                            !v.decision
                              ? "bg-gray-50 border-gray-200"
                              : v.decision.includes("reject")
                                ? "bg-red-50 border-red-200"
                                : "bg-green-50 border-green-200",
                          )}
                        >
                          <p
                            className={cn(
                              "text-sm font-medium",
                              !v.decision
                                ? "text-gray-600"
                                : v.decision.includes("reject")
                                  ? "text-red-600"
                                  : "text-green-600",
                            )}
                          >
                            {!v.decision
                              ? "En attente"
                              : v.decision.includes("reject")
                                ? "Rejeté"
                                : "Approuvé"}
                          </p>
                          <div className="flex flex-col">
                            <span>
                              {users.find((u) => u.id === v.userId)?.firstName +
                                " " +
                                users.find((u) => u.id === v.userId)?.lastName}
                            </span>
                            {v.decision && (
                              <span className="text-xs font-medium">
                                {format(v.updatedAt, "PPP à p", { locale: fr })}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Request parours */}
          <div className="col-span-full w-full mt-4">
            {paiements.isSuccess &&
              getPurchases.isSuccess &&
              getReceptions.isSuccess && (
                <RequestStepper
                  request={request.data?.data}
                  bonCommandes={getPurchases.data.data}
                  ticket={paiements.data.data}
                  receptions={getReceptions.data.data}
                />
              )}
          </div>
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
