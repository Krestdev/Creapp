"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  CreditCard,
  FolderOpen,
  FolderTree,
  Hash,
  Building,
  Receipt,
  CalendarClock,
  Users,
  LucideFile,
} from "lucide-react";
import { BonsCommande, PaymentRequest } from "@/types/types";
import { useStore } from "@/providers/datastore";
import { useFetchQuery } from "@/hooks/useData";
import { RequestQueries } from "@/queries/requestModule";
import { UserQueries } from "@/queries/baseModule";
import { useState } from "react";
import ShowFile from "../base/show-file";
import { DownloadFile } from "../base/downLoadFile";
import { XAF } from "@/lib/utils";

interface DetailTicketProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PaymentRequest | undefined;
  action: () => void;
  commands: BonsCommande | undefined;
}

export function DetailTicket({
  open,
  onOpenChange,
  data,
  action,
  commands,
}: DetailTicketProps) {
  // Fonction pour formater le montant
  const formatMontant = (montant: number | undefined) => {
    if (!montant) return "0 FCFA";
    return `${montant.toLocaleString("fr-FR")} FCFA`;
  };
  const { user } = useStore();

  const requests = new RequestQueries();
  const users = new UserQueries();

  const usersData = useFetchQuery(["users"], users.getAll, 30000);
  const requestData = useFetchQuery(["requests"], requests.getAll, 30000);

  const [page, setPage] = useState(1);
  const [file, setFile] = useState<string | File | undefined>(undefined);

  const request = requestData.data?.data.find(
    (req) => req.id === data?.requestId
  );

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
      case "pending":
        return "En attente";
      case "gost":
        return "Brouillon";
      default:
        return state || "Inconnu";
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
      <DialogContent className="max-w-[420px] max-h-[80vh] p-0 gap-0 border-none flex flex-col">
        {/* Header avec fond bordeaux - FIXE */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative shrink-0">
          <DialogTitle className="text-xl font-semibold text-white">
            {"Détails du ticket"}
          </DialogTitle>
          <h4 className="text-sm text-white/80 mt-1">
            {page === 1
              ? `${typePaiment(data?.type)} - ${data?.title || "N/A"}`
              : `Justificatif du ticket ${data?.title}`}
          </h4>
        </DialogHeader>

        {/* Contenu - SCROLLABLE */}
        {page === 1 ? (
          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-4 pb-4">
              {/* Référence */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    Référence
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-pink-100 text-pink-900 hover:bg-pink-100 dark:bg-pink-900 dark:text-pink-100"
                  >
                    {data?.reference || "N/A"}
                  </Badge>
                </div>
              </div>

              {/* Periode */}
              {data?.type === "ressource_humaine" && (
                <>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <CalendarClock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">
                        Periode
                      </p>
                      <p className="font-semibold text-lg">
                        {request?.period ? (
                          <p className="font-semibold">{`Du ${format(
                            request?.period.from!,
                            "PPP",
                            { locale: fr }
                          )} au ${format(request?.period.to!, "PPP", {
                            locale: fr,
                          })}`}</p>
                        ) : (
                          <p>Non renseigné</p>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Bénéficiaires */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">
                        {"Bénéficiaires"}
                      </p>
                      <div className="flex flex-col">
                        {request?.beneficiary === "me" ? (
                          <p className="font-semibold capitalize">
                            {user?.lastName + " " + user?.firstName}
                          </p>
                        ) : (
                          <div className="flex flex-col">
                            {request?.beficiaryList?.map((ben) => {
                              const beneficiary = usersData.data?.data?.find(
                                (x) => x.id === ben.id
                              );
                              return (
                                <p
                                  key={ben.id}
                                  className="font-semibold capitalize"
                                >{`${beneficiary?.firstName + " " + beneficiary?.lastName || ben.id}`}</p>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {data?.type !== "ressource_humaine" && <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {request?.categoryId === 0
                      ? "Recepteur pour compte"
                      : "Bénéficiaires"}
                  </p>
                  {request?.categoryId === 0 ? (
                    <p className="font-semibold capitalize">
                      {
                        usersData.data?.data?.find(
                          (u) => u.id === Number(request?.beneficiary)
                        )?.firstName + " " + usersData.data?.data?.find(
                          (u) => u.id === Number(request?.beneficiary)
                        )?.lastName
                      }
                    </p>
                  ) : (
                    <div className="flex flex-col">
                      {request?.beneficiary === "me" ? (
                        <p className="font-semibold capitalize">{user?.lastName + " " + user?.firstName}</p>
                      ) : (
                        <div className="flex flex-col">
                          {request?.beficiaryList?.map((ben) => {
                            const beneficiary = usersData.data?.data?.find(
                              (x) => x.id === ben.id
                            );
                            return (
                              <p
                                key={ben.id}
                                className="font-semibold capitalize"
                              >{`${beneficiary?.firstName + " " + beneficiary?.lastName || ben.id}`}</p>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>}

              {data?.type === "facilitation" &&
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      {"Pour le compte de"}
                    </p>
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
              }

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <FolderOpen className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Montant</p>
                  <p className="font-semibold text-lg">
                    {formatMontant(data?.price || 0)}
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

              {/* Fournisseur */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Building className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {"Fournisseur"}
                  </p>
                  <p className="font-semibold">
                    {commands?.provider.name || "N/A"}
                  </p>
                </div>
              </div>

              {/* Bon de commande */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Receipt className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {"Bon de commande"}
                  </p>
                  <p className="text-sm">{commands?.reference || "N/A"}</p>
                </div>
              </div>

              {/* Moyen de paiement */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    Moyen de paiement
                  </p>
                  <p className="text-sm">
                    {translateMoyenPaiement(commands?.paymentMethod) || "N/A"}
                  </p>
                </div>
              </div>

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
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Statut</p>
                  <Badge className={getStateColor(data?.status)}>
                    {translateState(data?.status)}
                  </Badge>
                </div>
              </div>

              {/* Priorité */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {"Priorité"}
                  </p>
                  <Badge className={getPrioriteColor(data?.priority)}>
                    {translatePriorite(data?.priority)}
                  </Badge>
                </div>
              </div>

              {/* Date de création */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Créé le</p>
                  <p className="font-semibold">
                    {data?.createdAt
                      ? format(new Date(data.createdAt), "PPP", { locale: fr })
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Date de modification */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    Modifié le
                  </p>
                  <p className="font-semibold">
                    {data?.updatedAt
                      ? format(new Date(data.updatedAt), "PPP", { locale: fr })
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
        <div className="flex gap-3 p-6 pt-0 shrink-0 w-full justify-end">
          {page === 2 && file && <DownloadFile file={file} />}
          {user?.role.flatMap((x) => x.label).includes("VOLT") && (
            <Button
              onClick={action}
              className="bg-[#003D82] hover:bg-[#002D62] text-white"
              disabled={!data || data.status === "paid"}
            >
              {data?.status === "paid" ? "Déjà payé" : "Payer"}
            </Button>
          )}
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
