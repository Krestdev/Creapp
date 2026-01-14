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
import { useFetchQuery } from "@/hooks/useData";
import { XAF } from "@/lib/utils";
import { userQ } from "@/queries/baseModule";
import {
  BonsCommande,
  PAY_STATUS,
  PAYMENT_METHOD,
  PaymentRequest,
} from "@/types/types";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Building,
  Calendar,
  CalendarFold,
  Car,
  DollarSign,
  FileIcon,
  Fuel,
  HelpCircle,
  LucideHash,
  MapPin,
  Percent,
  SquareUser,
  User,
  Wallet,
  Briefcase,
  Users,
  Gift,
  ShoppingCart,
  Activity,
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  payment: PaymentRequest;
  purchases: Array<BonsCommande>;
}

function getStatusBadge(status: PaymentRequest["status"]): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
} {
  const statusData = PAY_STATUS.find((s) => s.value === status);
  const label = statusData?.name ?? "Inconnu";

  switch (status) {
    case "paid":
      return { label, variant: "success" };
    case "validated":
      return { label: "Non payé", variant: "destructive" };
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
  if (typeof value === 'string') {
    return value.trim() !== '' && value !== 'none' && value !== 'null';
  }
  if (typeof value === 'number') {
    return value > 0;
  }
  return true;
};

function ViewExpense({ open, openChange, payment, purchases }: Props) {
  const getUsers = useFetchQuery(["users"], userQ.getAll, 50000);
  const purchase = purchases.find((p) => p.id === payment.commandId);

  if (getUsers.isLoading) {
    return <LoadingPage />;
  }
  if (getUsers.isError) {
    return <ErrorPage error={getUsers.error} />;
  }
  if (getUsers.isSuccess) {
    const user = getUsers.data.data.find((u) => u.id === payment.userId);

    // Rendu conditionnel selon le type
    const renderFieldsByType = () => {
      switch (payment.type) {
        case "facilitation":
          return (
            <>
              {/* Champs spécifiques pour facilitation */}
              {hasValue(payment.projectId) && (
                <div className="view-group">
                  <span className="view-icon">
                    <Briefcase />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Projet"}</p>
                    <p className="font-semibold">Projet #{payment.projectId}</p>
                  </div>
                </div>
              )}
              {hasValue(payment.requestId) && (
                <div className="view-group">
                  <span className="view-icon">
                    <HelpCircle />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Demande associée"}</p>
                    <p className="font-semibold">ID: {payment.requestId}</p>
                  </div>
                </div>
              )}
              {hasValue(payment.description) && (
                <div className="view-group @min-[540px]/dialog:col-span-2">
                  <span className="view-icon">
                    <HelpCircle />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Description détaillée"}</p>
                    <p className="text-foreground">{payment.description}</p>
                  </div>
                </div>
              )}
            </>
          );

        case "ressource_humaine":
          return (
            <>
              {/* Champs spécifiques pour ressources humaines */}
              {hasValue(payment.projectId) && (
                <div className="view-group">
                  <span className="view-icon">
                    <Briefcase />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Projet"}</p>
                    <p className="font-semibold">Projet #{payment.projectId}</p>
                  </div>
                </div>
              )}
              {hasValue(payment.requestId) && (
                <div className="view-group">
                  <span className="view-icon">
                    <HelpCircle />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Demande associée"}</p>
                    <p className="font-semibold">ID: {payment.requestId}</p>
                  </div>
                </div>
              )}
              <div className="view-group">
                <span className="view-icon">
                  <Users />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Type de dépense"}</p>
                  <p className="font-semibold">{"Salaires et charges sociales"}</p>
                </div>
              </div>
            </>
          );

        case "speciaux":
          return (
            <>
              {/* Champs spécifiques pour dépenses spéciales */}
              {hasValue(payment.benefId) && (
                <div className="view-group">
                  <span className="view-icon">
                    <User />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Bénéficiaire"}</p>
                    <p className="font-semibold">{getUsers.data?.data.find((u) => u.id === payment.benefId)?.firstName + " " + getUsers.data?.data.find((u) => u.id === payment.benefId)?.lastName}</p>
                  </div>
                </div>
              )}
              {hasValue(payment.requestId) && (
                <div className="view-group">
                  <span className="view-icon">
                    <HelpCircle />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Demande associée"}</p>
                    <p className="font-semibold">ID: {payment.requestId}</p>
                  </div>
                </div>
              )}
              {hasValue(payment.description) && (
                <div className="view-group @min-[540px]/dialog:col-span-2">
                  <span className="view-icon">
                    <HelpCircle />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Raison spéciale"}</p>
                    <p className="text-foreground">{payment.description}</p>
                  </div>
                </div>
              )}
            </>
          );

        case "achat":
          return (
            <>
              {/* Champs spécifiques pour achats */}
              {purchase && (
                <>
                  {hasValue(purchase.provider?.name) && (
                    <div className="view-group">
                      <span className="view-icon">
                        <SquareUser />
                      </span>
                      <div className="flex flex-col">
                        <p className="view-group-title">{"Fournisseur"}</p>
                        <p className="font-semibold">{purchase.provider.name}</p>
                      </div>
                    </div>
                  )}
                  {hasValue(purchase.reference) && (
                    <div className="view-group">
                      <span className="view-icon">
                        <LucideHash />
                      </span>
                      <div className="flex flex-col">
                        <p className="view-group-title">{"Référence commande"}</p>
                        <p className="font-semibold">{purchase.reference}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
              {hasValue(payment.commandId) && (
                <div className="view-group">
                  <span className="view-icon">
                    <ShoppingCart />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Commande associée"}</p>
                    <p className="font-semibold">ID: {payment.commandId}</p>
                  </div>
                </div>
              )}
              {hasValue(payment.deadline) && (
                <div className="view-group">
                  <span className="view-icon">
                    <CalendarFold />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Date limite"}</p>
                    <p className="font-semibold">
                      {format(new Date(payment.deadline), "dd MMMM yyyy", {
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>
              )}
            </>
          );

        case "CURRENT":
          const showCurrentSpecificFields =
            hasValue(payment.benefId) ||
            hasValue(payment.justification) ||
            hasValue(payment.km) ||
            hasValue(payment.liters) ||
            hasValue(payment.description);

          if (!showCurrentSpecificFields) return null;

          return (
            <>
              {/* Champs spécifiques pour dépenses courantes */}
              {hasValue(payment.benefId) && (
                <div className="view-group">
                  <span className="view-icon">
                    <User />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Bénéficiaire"}</p>
                    <p className="font-semibold">{getUsers.data?.data.find((u) => u.id === payment.benefId)?.firstName + " " + getUsers.data?.data.find((u) => u.id === payment.benefId)?.lastName}</p>
                  </div>
                </div>
              )}
              {hasValue(payment.justification) && (
                <div className="view-group">
                  <span className="view-icon">
                    <FileIcon />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Justification"}</p>
                    <Link
                      href={`${process.env.NEXT_PUBLIC_API
                        }/uploads/${payment.justification}`}
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
              {hasValue(payment.km) && (
                <div className="view-group">
                  <span className="view-icon">
                    <MapPin />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Kilométrage"}</p>
                    <p className="font-semibold">{payment.km} km</p>
                  </div>
                </div>
              )}
              {hasValue(payment.liters) && (
                <div className="view-group">
                  <span className="view-icon">
                    <Fuel />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Litres de carburant"}</p>
                    <p className="font-semibold">{payment.liters} L</p>
                  </div>
                </div>
              )}
              {hasValue(payment.description) && (
                <div className="view-group @min-[540px]/dialog:col-span-2">
                  <span className="view-icon">
                    <HelpCircle />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Description"}</p>
                    <p className="text-foreground">{payment.description}</p>
                  </div>
                </div>
              )}
            </>
          );

        default:
          return null;
      }
    };

    // Fonction pour afficher les champs communs seulement s'ils ont des valeurs
    const renderCommonFields = () => {
      const fields = [];

      // Type (toujours affiché)
      fields.push(
        <div key="type" className="view-group">
          <span className="view-icon">
            {getTypeIcon(payment.type)}
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Type de dépense"}</p>
            <Badge variant="outline" className="w-fit">
              {getTypeLabel(payment.type)}
            </Badge>
          </div>
        </div>
      );

      // Référence
      if (hasValue(payment.reference)) {
        fields.push(
          <div key="reference" className="view-group">
            <span className="view-icon">
              <LucideHash />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Référence"}</p>
              <div className="w-fit bg-primary-100 flex items-center justify-center px-1.5 rounded">
                <p className="text-primary-600 text-sm">
                  {payment.reference}
                </p>
              </div>
            </div>
          </div>
        );
      }

      // Titre
      if (hasValue(payment.title)) {
        fields.push(
          <div key="title" className="view-group">
            <span className="view-icon">
              <Briefcase />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Titre"}</p>
              <p className="font-semibold">{payment.title}</p>
            </div>
          </div>
        );
      }

      // Montant (toujours affiché)
      fields.push(
        <div key="amount" className="view-group">
          <span className="view-icon">
            <DollarSign />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Montant"}</p>
            <p className="font-semibold text-lg">{XAF.format(payment.price)}</p>
          </div>
        </div>
      );

      // Priorité
      if (hasValue(payment.priority)) {
        fields.push(
          <div key="priority" className="view-group">
            <span className="view-icon">
              <Activity />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Priorité"}</p>
              <Badge
                variant={
                  payment.priority === "urgent" ? "destructive" :
                    payment.priority === "high" ? "default" :
                      payment.priority === "medium" ? "outline" : "secondary"
                }
                className="w-fit"
              >
                {payment.priority === "urgent" ? "Urgent" :
                  payment.priority === "high" ? "Haute" :
                    payment.priority === "medium" ? "Moyenne" : "Basse"}
              </Badge>
            </div>
          </div>
        );
      }

      // Statut (toujours affiché)
      fields.push(
        <div key="status" className="view-group">
          <span className="view-icon">
            <HelpCircle />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Statut"}</p>
            <Badge
              variant={
                payment.status === "paid" ? "success" :
                  payment.status === "validated" ? "sky" :
                    payment.status === "pending" ? "amber" :
                      payment.status === "pending_depense" ? "yellow" :
                        payment.status === "rejected" ? "destructive" : "outline"
              }
              className="w-fit"
            >
              {payment.status === "paid" ? "Payé" :
                payment.status === "validated" ? "Validé" :
                  payment.status === "pending" ? "En attente" :
                    payment.status === "pending_depense" ? "En attente" :
                      payment.status === "rejected" ? "Rejeté" : payment.status}
            </Badge>
          </div>
        </div>
      );

      // Reason for rejection
      if (payment.status === "rejected" && hasValue(payment.reason)) {
        fields.push(
          <div key="reason" className="view-group @min-[540px]/dialog:col-span-2 bg-red-50 p-3 rounded-md border border-red-200">
            <span className="view-icon text-red-600">
              <HelpCircle />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title text-red-700">{"Motif du rejet"}</p>
              <p className="text-red-800 font-medium">{payment.reason}</p>
            </div>
          </div>
        );
      }

      return fields;
    };

    // Fonction pour afficher les champs additionnels
    const renderAdditionalFields = () => {
      const fields = [];

      // Méthode de paiement
      if (hasValue(payment.method)) {
        const methodName = PAYMENT_METHOD.find((p) => p.value === payment.method)?.name || "Non défini";
        fields.push(
          <div key="method" className="view-group">
            <span className="view-icon">
              <Wallet />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Méthode de paiement"}</p>
              <p className="font-semibold">{methodName}</p>
            </div>
          </div>
        );
      }

      // Justificatif
      if (hasValue(payment.proof)) {
        fields.push(
          <div key="proof" className="view-group">
            <span className="view-icon">
              <FileIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Justificatif"}</p>
              <Link
                href={`${process.env.NEXT_PUBLIC_API
                  }/uploads/${encodeURIComponent(payment.proof as string)}`}
                target="_blank"
                className="flex gap-0.5 items-center"
              >
                <img
                  src="/images/pdf.png"
                  alt="justificatif"
                  className="h-7 w-auto aspect-square"
                />
                <p className="text-foreground font-medium">
                  {"Document justificatif"}
                </p>
              </Link>
            </div>
          </div>
        );
      }

      // Date de création
      fields.push(
        <div key="createdAt" className="view-group">
          <span className="view-icon">
            <Calendar />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Créé le"}</p>
            <p className="font-semibold">
              {format(new Date(payment.createdAt), "dd MMMM yyyy à HH:mm", {
                locale: fr,
              })}
            </p>
          </div>
        </div>
      );

      // Date de modification
      if (hasValue(payment.updatedAt) && payment.updatedAt !== payment.createdAt) {
        fields.push(
          <div key="updatedAt" className="view-group">
            <span className="view-icon">
              <Calendar />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Dernière modification"}</p>
              <p className="font-semibold">
                {format(new Date(payment.updatedAt), "dd MMMM yyyy à HH:mm", {
                  locale: fr,
                })}
              </p>
            </div>
          </div>
        );
      }

      // Créé par
      if (hasValue(payment.userId)) {
        const userData = getUsers.data?.data.find((u) => u.id === payment.userId);
        if (userData) {
          fields.push(
            <div key="userId" className="view-group">
              <span className="view-icon">
                <User />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Initié par"}</p>
                <p className="font-semibold">
                  {`${userData.firstName || ''} ${userData.lastName || ''}`.trim()}
                </p>
              </div>
            </div>
          );
        }
      }

      return fields;
    };

    return (
      <Dialog open={open} onOpenChange={openChange}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader variant={"default"}>
            <div className="flex items-center gap-2">
              <DialogTitle className="uppercase">{`${getTypeLabel(payment.type)} - ${hasValue(payment.title) ? payment.title : "Sans titre"
                }`}</DialogTitle>
            </div>
            <DialogDescription>{`Voir les informations détaillées`}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 @min-[540px]/dialog:grid-cols-2">
            {/* Champs communs */}
            {renderCommonFields()}

            {/* Champs spécifiques selon le type */}
            {renderFieldsByType()}

            {/* Champs additionnels */}
            {renderAdditionalFields()}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{"Fermer"}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
}

export default ViewExpense;