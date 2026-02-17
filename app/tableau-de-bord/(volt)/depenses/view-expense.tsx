import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import { Badge, badgeVariants } from "@/components/ui/badge";
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
import { cn, XAF } from "@/lib/utils";
import { userQ } from "@/queries/baseModule";
import { payTypeQ } from "@/queries/payType";
import { projectQ } from "@/queries/projectModule";
import { requestQ } from "@/queries/requestModule";
import { signatairQ } from "@/queries/signatair";
import {
  Invoice,
  PAY_STATUS,
  PaymentRequest,
  User
} from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Activity,
  AlertCircle,
  Briefcase,
  Building,
  Calendar,
  CalendarFold,
  CreditCard,
  FileIcon,
  FileText,
  FolderOpen,
  Fuel,
  Gift,
  Hash,
  HelpCircle,
  LucideFile,
  MapPin,
  Receipt,
  ShoppingCart,
  SquareStackIcon,
  User2,
  Users,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  payment: PaymentRequest;
  invoices: Array<Invoice>;
}

function getStatusBadge(status: PaymentRequest["status"]): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
} {
  const statusData = PAY_STATUS.find((s) => s.value === status);
  const label = statusData?.name ?? "Inconnu";

  switch (status) {
    case "pending":
      return { label, variant: "amber" };
    case "validated":
      return { label, variant: "sky" };
    case "paid":
      return { label, variant: "success" };
    case "pending_depense":
      return { label, variant: "yellow" };
    case "unsigned":
      return { label, variant: "lime" };
    default:
      return { label, variant: "outline" };
  }
}

// Fonction pour obtenir l'icône en fonction du type
function getTypeIcon(type: PaymentRequest["type"]) {
  switch (type) {
    case "facilitation":
      return <Building className="h-4 w-4" />;
    case "ressource_humaine":
      return <Users className="h-4 w-4" />;
    case "speciaux":
      return <Gift className="h-4 w-4" />;
    case "achat":
      return <ShoppingCart className="h-4 w-4" />;
    case "CURRENT":
      return <Activity className="h-4 w-4" />;
    default:
      return <Briefcase className="h-4 w-4" />;
  }
}

// Fonction pour obtenir le libellé du type
function getTypeLabel(type: PaymentRequest["type"]) {
  switch (type) {
    case "facilitation":
      return "Facilitation";
    case "ressource_humaine":
      return "Ressource Humaine";
    case "speciaux":
      return "Dépenses Spéciales";
    case "achat":
      return "Achat";
    case "CURRENT":
      return "Dépenses Courantes";
    default:
      return "Autre";
  }
}

// Helper pour vérifier si une valeur est significative
const hasValue = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") {
    return value.trim() !== "" && value !== "none" && value !== "null";
  }
  if (typeof value === "number") {
    return value > 0;
  }
  return true;
};

function ViewExpense({ open, openChange, payment, invoices }: Props) {
  const getUsers = useQuery({ queryKey: ["users"], queryFn: userQ.getAll });
  const getProjects = useQuery({ queryKey: ["projects"], queryFn: projectQ.getAll });
  const requestData = useQuery({ queryKey: ["requests"], queryFn: requestQ.getAll, });
  const invoice = invoices.find((p) => p.id === payment.invoiceId);
  const getPaymentType = useQuery({
    queryKey: ["paymentType"],
    queryFn: payTypeQ.getAll,
  });
  const getSignataire = useQuery({
    queryKey: ["signatairs"],
    queryFn: signatairQ.getAll,
  });


  const signataires = useMemo(() => {
    if (!getSignataire.data?.data || !payment?.bankId || !payment?.methodId) {
      return undefined;
    }

    return getSignataire.data.data.find(
      x =>
        x.bankId === payment.bankId &&
        x.payTypeId === payment.methodId
    );
  }, [
    getSignataire.data?.data,
    payment?.bankId,
    payment?.methodId,
  ]);

  if (!payment) return null;

  if (getUsers.isLoading || getPaymentType.isLoading) {
    return <LoadingPage />;
  }
  if (getUsers.isError || getPaymentType.isError) {
    return <ErrorPage error={getUsers.error || getPaymentType.error!} />;
  }

  if (getUsers.isSuccess && getPaymentType.isSuccess) {
    const user = getUsers.data.data.find((u) => u.id === payment.userId);
    const methodName = getPaymentType.data?.data.find((p) => p.id === payment.methodId)?.label || "Non défini";

    // Rendu conditionnel simple
    const getStatusBadgeContent = () => {
      const { label, variant } = getStatusBadge(payment.status);
      return <Badge variant={variant} className="w-fit">{label}</Badge>;
    };

    const getPriorityBadge = () => {
      if (!hasValue(payment.priority)) return null;

      const variant = payment.priority === "urgent"
        ? "destructive"
        : payment.priority === "high"
          ? "default"
          : payment.priority === "medium"
            ? "outline"
            : "secondary";

      const label = payment.priority === "urgent"
        ? "Urgent"
        : payment.priority === "high"
          ? "Haute"
          : payment.priority === "medium"
            ? "Moyenne"
            : "Basse";

      return <Badge variant={variant} className="w-fit">{label}</Badge>;
    };

    const users = signataires?.user;
    return (
      <Dialog open={open} onOpenChange={openChange}>
        <DialogContent className="sm:max-w-[720px]! max-h-[80vh] p-0 gap-0 border-none flex flex-col">
          {/* Header avec fond */}
          <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative shrink-0">
            <DialogTitle className="text-xl font-semibold text-white">
              {`Ticket - ${payment.title || "Sans titre"}`}
            </DialogTitle>
            <DialogDescription className="text-white/80">
              Détail du ticket
            </DialogDescription>
          </DialogHeader>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto px-6">
            <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 gap-4">
              {/* Référence */}
              {hasValue(payment.reference) && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Hash className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      Référence
                    </p>
                    <Badge className="bg-pink-100 text-pink-900 hover:bg-pink-100">
                      {payment.reference}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Description */}
              {hasValue(payment.description) && payment.description !== "none" && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      Description
                    </p>
                    <p className="font-semibold text-lg">
                      {payment.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Type */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getTypeIcon(payment.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    Type de dépense
                  </p>
                  <Badge variant="outline" className="w-fit">
                    {getTypeLabel(payment.type)}
                  </Badge>
                </div>
              </div>

              {/* Montant */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <FolderOpen className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Montant</p>
                  <p className="font-semibold text-lg">
                    {XAF.format(payment.price)}
                  </p>
                </div>
              </div>

              {/* Bénéficiaire */}
              {
                hasValue(payment.benefId) && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <User2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">
                        Bénéficiaire
                      </p>
                      <p className="font-semibold">
                        {getUsers.data?.data.find((u) => u.id === payment.benefId)?.firstName +
                          " " +
                          getUsers.data?.data.find((u) => u.id === payment.benefId)?.lastName}
                      </p>
                    </div>
                  </div>
                )
              }

              {/* Projet */}
              {hasValue(payment.projectId) && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Projet</p>
                    <p className="font-semibold">{getProjects.data?.data.find((p) => p.id === payment.projectId)?.label}</p>
                  </div>
                </div>
              )}

              {/* Demande associée */}
              {hasValue(payment.requestId) && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      Demande associée
                    </p>
                    <p className="font-semibold">{requestData.data?.data.find((r) => r.id === payment.requestId)?.label}</p>
                  </div>
                </div>
              )}

              {/* Pour les achats */}
              {payment.type === "achat" && invoice && (
                <>
                  {hasValue(invoice.command.provider.name) && (
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Building className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">
                          {"Fournisseur"}
                        </p>
                        <p className="font-semibold">{invoice.command.provider.name}</p>
                      </div>
                    </div>
                  )}

                  {hasValue(invoice.command.reference) && (
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Receipt className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">
                          {"Bon de commande"}
                        </p>
                        <p className="font-semibold">{invoice.command.reference}</p>
                      </div>
                    </div>
                  )}

                  {hasValue(payment.deadline) && (
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <CalendarFold className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">
                          {"Date limite"}
                        </p>
                        <p className="font-semibold">
                          {format(new Date(payment.deadline), "dd MMMM yyyy", {
                            locale: fr,
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Pour les dépenses courantes */}
              {payment.type === "CURRENT" && (
                <>
                  {hasValue(payment.km) && (
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">
                          {"Kilométrage"}
                        </p>
                        <p className="font-semibold">{`${payment.km} KM`}</p>
                      </div>
                    </div>
                  )}

                  {hasValue(payment.liters) && (
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Fuel className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">
                          {"Prix unitaire du litre"}
                        </p>
                        <p className="font-semibold">{XAF.format(payment.liters ?? 0)}</p>
                      </div>
                    </div>
                  )}

                  {hasValue(payment.liters) && (
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Fuel className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">
                          {"Nombre de litres consommés"}
                        </p>
                        <p className="font-semibold">{payment.price && payment.liters ? `${parseFloat((payment.price / payment.liters).toFixed(2))} L` : ""} </p>
                      </div>
                    </div>
                  )}

                  {hasValue(payment.justification) && (
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">
                          {"Justification"}
                        </p>
                        <Link
                          href={`${process.env.NEXT_PUBLIC_API}/${payment.justification}`}
                          target="_blank"
                          className="flex gap-0.5 items-center"
                        >
                          <img
                            src="/images/pdf.png"
                            alt="justification"
                            className="h-7 w-auto aspect-square"
                          />
                          <p className="text-foreground font-medium">
                            {"Document de justification"}
                          </p>
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Justificatif */}
              {hasValue(payment.proof) && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <LucideFile className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      {"Justificatif"}
                    </p>
                    <Link
                      href={`${process.env.NEXT_PUBLIC_API}/${payment.proof}`}
                      target="_blank"
                      className="flex gap-0.5 items-center"
                    >
                      <img
                        src="/images/pdf.png"
                        alt="justificatif"
                        className="h-7 w-auto aspect-square"
                      />
                      <p className="text-foreground font-medium">
                        Document justificatif
                      </p>
                    </Link>
                  </div>
                </div>
              )}

              {/* Méthode de paiement */}
              {hasValue(payment.methodId) && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      {"Méthode de paiement"}
                    </p>
                    <p className="font-semibold">{methodName}</p>
                  </div>
                </div>
              )}

              {/* Statut */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Statut</p>
                  {getStatusBadgeContent()}
                </div>
              </div>

              {/* Priorité */}
              {hasValue(payment.priority) && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      Priorité
                    </p>
                    {getPriorityBadge()}
                  </div>
                </div>
              )}

              {/* Date de création */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Créé le</p>
                  <p className="font-semibold">
                    {format(new Date(payment.createdAt), "dd MMMM yyyy à HH:mm", {
                      locale: fr,
                    })}
                  </p>
                </div>
              </div>

              {/* Date de modification */}
              {hasValue(payment.updatedAt) && payment.updatedAt !== payment.createdAt && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      {"Modifié le"}
                    </p>
                    <p className="font-semibold">
                      {format(new Date(payment.updatedAt), "dd MMMM yyyy à HH:mm", {
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Initié par */}
              {hasValue(payment.userId) && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <User2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      Initié par
                    </p>
                    <p className="font-semibold">
                      {getUsers.data?.data.find((u) => u.id === payment.userId)?.firstName +
                        " " +
                        getUsers.data?.data.find((u) => u.id === payment.userId)?.lastName}
                    </p>
                  </div>
                </div>
              )}

              {/* Motif de rejet */}
              {payment.status === "rejected" && hasValue(payment.reason) && (
                <div className="flex items-start gap-3 bg-red-50 p-3 rounded-md border border-red-200">
                  <div className="mt-1">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-red-700 mb-1">
                      {"Motif du rejet"}
                    </p>
                    <p className="text-red-800 font-medium">{payment.reason}</p>
                  </div>
                </div>
              )}

              {signataires && signataires.user && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm text-muted-foreground mb-1">
                      {"Mode de signature"}
                    </p>
                    <p className="font-medium">
                      {signataires?.mode === "ONE" ?
                        "Un dans la liste" :
                        signataires?.mode === "BOTH" && signataires.user?.length > 1 ?
                          "Tous les signataires" :
                          "Un seul signataire"}
                    </p>
                  </div>
                </div>
              )}

              {/* Historique de signature */}
              {users && users.length > 0 && (
                <div className="view-group">
                  <span className="view-icon">
                    <SquareStackIcon />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Historique de signature"}</p>
                    <div className="grid gap-2">
                      {/* On va mettre ceux qui sont dans paiement.signer en vert */}
                      {users.map((s: User) => {
                        const isSigned = payment.signer?.flatMap(x => x.id).includes(s.id);
                        const signer = payment.signer?.find(x => x.id === s.id);
                        return (
                          <div key={s.id} className={cn("px-3 py-2 flex flex-col gap-1 border bg-gray-50 border-gray-200", isSigned ? "bg-green-50 border-green-200" : "")}>
                            <p className="text-sm font-medium text-gray-600">
                              {s.firstName + " " + s.lastName}
                            </p>
                            {/* {signer && <p className="text-sm text-muted-foreground">
                              {format(new Date(signer.createdAt!), "dd MMMM yyyy à HH:mm", {
                                locale: fr,
                              })}
                            </p>} */}
                            {isSigned && signer ? (
                              <p className="text-sm text-green-600">
                                {"Signé"}
                              </p>
                            ) : (
                              signataires.mode === "BOTH" ?
                                <p className="text-sm text-gray-600">
                                  {"En attente de signature"}
                                </p>
                                :
                                <p className="text-sm text-gray-600">
                                  {"Ne peux plus signer"}
                                </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="flex gap-3 p-6 pt-0 shrink-0 w-full justify-end">
            <DialogClose asChild>
              <Button variant="outline" className="bg-transparent">
                {"Fermer"}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
}

export default ViewExpense;