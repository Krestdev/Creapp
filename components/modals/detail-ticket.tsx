"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import {
  Invoice,
  PaymentRequest,
  PayType,
  RequestModelT,
  User,
} from "@/types/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertCircle,
  Building,
  Calendar,
  CalendarClock,
  ChevronsUp,
  CreditCard,
  FileIcon,
  FileText,
  FolderOpen,
  Hash,
  LucideFile,
  Receipt,
  ScrollIcon,
  UserRoundIcon,
  Users,
} from "lucide-react";
import { useState } from "react";
import { DownloadFile } from "../base/downLoadFile";
import ShowFile from "../base/show-file";
import Link from "next/link";

interface DetailTicketProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PaymentRequest;
  invoice?: Invoice;
  requests: RequestModelT[];
  users: User[];
  types: PayType[];
}

export function DetailTicket({
  open,
  onOpenChange,
  data,
  invoice,
  users,
  types,
  requests,
}: DetailTicketProps) {
  // Fonction pour formater le montant
  const formatMontant = (montant: number | undefined) => {
    if (!montant) return "0 FCFA";
    return `${montant.toLocaleString("fr-FR")} FCFA`;
  };
  const { user } = useStore();

  const [page, setPage] = useState(1);
  const [file, setFile] = useState<string | File | undefined>(undefined);

  const request = requests.find((req) => req.id === data?.requestId);
  const emitter = users.find((u) => u.id === request?.userId);

  // Fonction pour obtenir la couleur du badge selon la priorité
  const getPrioriteColor = (priorite: string | undefined) => {
    switch (priorite) {
      case "urgent":
        return "bg-red-100 text-red-900 hover:bg-red-100 dark:bg-red-900 dark:text-red-100";
      case "high":
        return "bg-orange-100 text-orange-900 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-100";
      case "medium":
        return "bg-yellow-100 text-yellow-900 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100";
      case "low":
        return "bg-green-100 text-green-900 hover:bg-green-100 dark:bg-green-900 dark:text-green-100";
      default:
        return "bg-gray-100 text-gray-900 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  // Fonction pour obtenir la couleur du badge selon l'état
  const getStateColor = (state: string | undefined) => {
    switch (state) {
      case "paid":
        return "bg-green-100 text-green-900 hover:bg-green-100 dark:bg-green-900 dark:text-green-100";
      case "approved":
        return "bg-blue-100 text-blue-900 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100";
      case "pending":
        return "bg-yellow-100 text-yellow-900 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100";
      case "gost":
        return "bg-gray-100 text-gray-900 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-100";
      default:
        return "bg-gray-100 text-gray-900 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  // Fonction pour traduire les états
  const translateState = (state: string | undefined) => {
    switch (state) {
      case "paid":
        return "Payé";
      case "approved":
        return "Approuvé";
      default:
        return "En attente";
    }
  };

  // Fonction pour traduire les priorités
  const translatePriorite = (priorite: string | undefined) => {
    switch (priorite) {
      case "urgent":
        return "Urgent";
      case "high":
        return "Élevée";
      case "medium":
        return "Moyenne";
      case "low":
        return "Basse";
      default:
        return priorite || "Non défini";
    }
  };

  // Fonction pour traduire les moyens de paiement
  const translateMoyenPaiement = (moyen: string | undefined) => {
    switch (moyen?.toLowerCase()) {
      case "virement":
        return "Virement bancaire";
      case "cheque":
        return "Chèque";
      case "especes":
        return "Espèces";
      case "carte":
        return "Carte bancaire";
      case "cash":
        return "Espèce";
      default:
        return moyen || "Non spécifié";
    }
  };

  // Fonction pour traduire les moyens de paiement
  const typePaiment = (type: string | undefined) => {
    switch (type) {
      case "FAC":
        return "Facilitation";
      case "RH":
        return "Resource Humain";
      case "SPECIAL":
        return "Special";
      case "PURCHASE":
        return "Normal";
      default:
        return "Diver";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Header avec fond bordeaux - FIXE */}
        <DialogHeader>
          <DialogTitle>{"Ticket" + " - " + data?.title}</DialogTitle>
          <DialogDescription>
            {page === 1
              ? `Détail du ticket`
              : `Justificatif du ticket ${data?.title}`}
          </DialogDescription>
        </DialogHeader>

        {/* Contenu - SCROLLABLE */}
        {page === 1 ? (
          <div className="grid gap-3">
            <div className="space-y-4 pb-4">
              {/* Référence */}
              <div className="view-group">
                <span className="view-icon">
                  <Hash />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Référence"}</p>
                  <div className="w-fit bg-primary-100 flex items-center justify-center px-1.5 rounded">
                    <p className="text-primary text-sm">
                      {data?.reference ?? "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {data?.description && (
                <div className="view-group">
                  <span className="view-icon">
                    <FileText />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Description"}</p>
                    <p>{data?.description ?? "N/A"}</p>
                  </div>
                </div>
              )}

              {/* Periode */}
              {data?.type === "ressource_humaine" && (
                <>
                  <div className="view-group">
                    <span className="view-cion">
                      <CalendarClock />
                    </span>
                    <div className="flex flex-col">
                      <p className="view-group-title">{"Période"}</p>
                      <p className="font-semibold">
                        {request?.period ? (
                          <p className="font-semibold">{`Du ${format(
                            request?.period.from!,
                            "PPP",
                            { locale: fr },
                          )} au ${format(request?.period.to!, "PPP", {
                            locale: fr,
                          })}`}</p>
                        ) : (
                          <p>{"Non renseigné"}</p>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Bénéficiaires */}
                  {
                    <div className="view-group">
                      <span className="view-icon">
                        <Users />
                      </span>
                      <div className="flex flex-col">
                        <p className="view-group-title">{"Bénéficiaires"}</p>
                        <div className="flex flex-col">
                          {request?.beneficiary === "me" ? (
                            <p className="font-semibold capitalize">
                              {users.find(
                                (x) => x.id === Number(request?.beneficiary),
                              )?.lastName +
                                " " +
                                users.find(
                                  (x) => x.id === Number(request?.beneficiary),
                                )?.firstName}
                            </p>
                          ) : (
                            <div className="flex flex-col">
                              {request?.beficiaryList?.map((ben) => {
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
                      </div>
                    </div>
                  }
                </>
              )}

              {data?.type !== "ressource_humaine" && (
                <div className="view-group">
                  <span className="view-icon">
                    <Users />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">
                      {request?.categoryId === 0
                        ? "Recepteur pour compte"
                        : "Bénéficiaires"}
                    </p>
                    {request?.categoryId === 0 ? (
                      <p className="font-semibold capitalize">
                        {users.find(
                          (u) => u.id === Number(request?.beneficiary),
                        )?.firstName +
                          " " +
                          users.find(
                            (u) => u.id === Number(request?.beneficiary),
                          )?.lastName}
                      </p>
                    ) : (
                      <div className="flex flex-col">
                        {request?.beneficiary === "me" ? (
                          <p className="font-semibold capitalize">
                            {user?.lastName + " " + user?.firstName}
                          </p>
                        ) : (
                          <div className="flex flex-col">
                            {request?.beficiaryList?.map((ben) => {
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

              {data?.type === "facilitation" && (
                <div className="view-group">
                  <div className="view-icon">
                    <Users />
                  </div>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Pour le compte de"}</p>
                    {
                      <div className="flex flex-col">
                        <div className="flex flex-col">
                          {request?.benFac?.list?.map((ben) => {
                            return (
                              <p
                                key={ben.id}
                                className="font-semibold capitalize"
                              >{`${ben?.name} - ${XAF.format(ben?.amount)}`}</p>
                            );
                          })}
                        </div>
                      </div>
                    }
                  </div>
                </div>
              )}

              <div className="view-group">
                <div className="view-icon">
                  <FolderOpen />
                </div>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Montant"}</p>
                  <p className="font-semibold text-primary-700">
                    {formatMontant(data?.price || 0)}
                  </p>
                </div>
              </div>

              {/* Justificatifs */}
              {/* <Button
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
                  <p className="view-group-title">{"Justificatifs"}</p>
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
              </Button> */}
              {/**Justificatif */}
              <div className="view-group">
                <span className="view-icon">
                  <FileIcon />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Justificatif"}</p>
                  {!!data.justification ? (
                    <Link
                      href={`${
                        process.env.NEXT_PUBLIC_API
                      }/${data.justification}`}
                      target="_blank"
                      className="flex gap-0.5 items-center"
                    >
                      <img
                        src="/images/pdf.png"
                        alt="justificatif"
                        className="h-7 w-auto aspect-square"
                      />
                      <p className="text-foreground font-medium">
                        {data.justification
                          ? "Document justificatif"
                          : "Aucun justificatif"}
                      </p>
                    </Link>
                  ) : !!data.proof ? (
                    <Link
                      href={`${process.env.NEXT_PUBLIC_API}/${data.proof}`}
                      target="_blank"
                      className="flex gap-0.5 items-center"
                    >
                      <img
                        src="/images/pdf.png"
                        alt="justificatif"
                        className="h-7 w-auto aspect-square"
                      />
                      <p className="text-foreground font-medium">
                        {data.proof
                          ? "Document justificatif"
                          : "Aucun justificatif"}
                      </p>
                    </Link>
                  ) : (
                    <p className="italic">{"Aucun justificatif"}</p>
                  )}
                </div>
              </div>

              {/* Fournisseur */}
              {data?.type === "achat" && (
                <div className="view-group">
                  <span className="view-icon">
                    <Building />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Fournisseur"}</p>
                    <p className="font-semibold">
                      {invoice?.command.provider.name ?? "N/A"}
                    </p>
                  </div>
                </div>
              )}

              {/* Bon de commande */}
              {data?.type === "achat" && (
                <div className="view-group">
                  <span className="view-icon">
                    <Receipt />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Bon de commande"}</p>
                    <p className="font-semibold">
                      {invoice?.command.reference ?? "N/A"}
                    </p>
                  </div>
                </div>
              )}

              {/* Moyen de paiement */}
              {data?.type === "achat" && (
                <div className="view-group">
                  <span className="view-icon">
                    <CreditCard />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Moyen de paiement"}</p>
                    <p className="font-semibold">
                      {translateMoyenPaiement(
                        types.find((p) => p.id === data.methodId)?.label ||
                          "N/A",
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Compte Payeur */}
              {/* <div className="flex items-start gap-3">
              <div className="mt-1">
                <FolderTree className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Compte Payeur
                </p>
                <p className="font-semibold">{commands. || "N/A"}</p>
              </div>
            </div> */}

              {/* Statut */}
              <div className="view-group">
                <span className="view-icon">
                  <AlertCircle />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Statut"}</p>
                  <Badge className={getStateColor(data?.status)}>
                    {translateState(data?.status)}
                  </Badge>
                </div>
              </div>

              {/* Priorité */}
              <div className="view-group">
                <span className="view-icon">
                  <ChevronsUp />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Priorité"}</p>
                  <Badge className={getPrioriteColor(data?.priority)}>
                    {translatePriorite(data?.priority)}
                  </Badge>
                </div>
              </div>

              {/* Date limite de paiement */}
              <div className="view-group">
                <span className="view-icon">
                  <Calendar />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">
                    {"Date limite de paiement"}
                  </p>
                  <p className="font-semibold">
                    {data?.createdAt
                      ? format(new Date(data.deadline), "PPP", { locale: fr })
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/**Besoin associé */}
              {!!data.requestId && (
                <>
                  <div className="view-group">
                    <span className="view-icon">
                      <ScrollIcon />
                    </span>
                    <div className="flex flex-col">
                      <p className="view-group-title">{"Besoin associé"}</p>
                      <p className="font-semibold">{request?.label}</p>
                    </div>
                  </div>
                  <div className="view-group">
                    <span className="view-icon">
                      <UserRoundIcon />
                    </span>
                    <div className="flex flex-col">
                      <p className="view-group-title">{"Emetteur du besoin"}</p>
                      <p className="font-semibold">
                        {emitter?.firstName.concat(" ", emitter.lastName)}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Date de création */}
              <div className="view-group">
                <span className="view-icon">
                  <Calendar />
                </span>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {"Créé le"}
                  </p>
                  <p className="font-semibold">
                    {data?.createdAt
                      ? format(
                          new Date(data.createdAt),
                          "dd MMMM yyyy à kk:mm",
                          { locale: fr },
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Date de modification */}
              <div className="view-group">
                <span className="view-icon">
                  <Calendar />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Modifié le"}</p>
                  <p className="font-semibold">
                    {data?.updatedAt
                      ? format(
                          new Date(data.updatedAt),
                          "dd MMMM yyyy à kk:mm",
                          { locale: fr },
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ShowFile
            file={file}
            setPage={setPage}
            title={`Justificatif du ticket ${data?.title}`}
          />
        )}

        {/* Boutons du footer - FIXE */}
        <DialogFooter>
          {page === 2 && file && <DownloadFile file={file} />}
          {/* {user?.role.flatMap((x) => x.label).includes("VOLT") && (
            <Button
              onClick={action}
              className="bg-[#003D82] hover:bg-[#002D62] text-white"
              disabled={!data || data.status === "paid"}
            >
              {data?.status === "paid" ? "Déjà payé" : "Payer"}
            </Button>
          )} */}
          <DialogClose asChild>
            <Button variant="outline">{"Fermer"}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
