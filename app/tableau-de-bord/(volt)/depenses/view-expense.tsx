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
import { cn, getPaymentTypeBadge, XAF } from "@/lib/utils";
import { signatairQ } from "@/queries/signatair";
import { vehicleQ } from "@/queries/vehicule";
import {
  Invoice,
  PAY_STATUS,
  PaymentRequest,
  PayType,
  ProjectT,
  RequestModelT,
  RequestType,
  User,
} from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertCircle,
  BriefcaseBusinessIcon,
  Calendar,
  CalendarFoldIcon,
  Car,
  ChevronsUp,
  CircleUserRoundIcon,
  CreditCard,
  DollarSignIcon,
  DropletIcon,
  FileIcon,
  FuelIcon,
  LucideFile,
  LucideHash,
  RouteIcon,
  ScrollIcon,
  SquareStackIcon,
  SquareUserRoundIcon,
  TableCellsSplitIcon,
  TextQuoteIcon,
  User2,
  WalletCardsIcon,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  payment: PaymentRequest;
  invoices: Array<Invoice>;
  payTypes: PayType[];
  projects: ProjectT[];
  users: User[];
  requests: RequestModelT[];
  requestTypes: Array<RequestType>;
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

function ViewExpense({
  open,
  openChange,
  payment,
  invoices,
  payTypes,
  projects,
  users,
  requests,
  requestTypes,
}: Props) {
  const request = requests.find((r) => r.id === payment.requestId);
  const vehicleData = useQuery({
    queryKey: ["vehicle"],
    queryFn: () => vehicleQ.getOne(request?.vehiclesId!),
  });

  const invoice = invoices.find((p) => p.id === payment.invoiceId);
  const getSignataire = useQuery({
    queryKey: ["signatairs"],
    queryFn: signatairQ.getAll,
  });

  const signataires = useMemo(() => {
    if (!getSignataire.data?.data || !payment?.bankId || !payment?.methodId) {
      return undefined;
    }

    return getSignataire.data.data.find(
      (x) => x.bankId === payment.bankId && x.payTypeId === payment.methodId,
    );
  }, [getSignataire.data?.data, payment?.bankId, payment?.methodId]);

  const user = users.find((u) => u.id === payment.userId);
  const methodName =
    payTypes.find((p) => p.id === payment.methodId)?.label || "Non défini";

  // Rendu conditionnel simple
  const getStatusBadgeContent = () => {
    const { label, variant } = getStatusBadge(payment.status);
    return (
      <Badge variant={variant} className="w-fit">
        {label}
      </Badge>
    );
  };

  const initiator = users.find((u) => u.id === request?.userId);

  const getPriorityBadge = () => {
    if (!hasValue(payment.priority)) return null;

    const variant: VariantProps<typeof badgeVariants>["variant"] =
      payment.priority === "urgent"
        ? "primary"
        : payment.priority === "high"
          ? "destructive"
          : payment.priority === "medium"
            ? "sky"
            : payment.priority === "low"
              ? "outline"
              : "default";

    const label: string =
      payment.priority === "urgent"
        ? "Urgent"
        : payment.priority === "high"
          ? "Haute"
          : payment.priority === "medium"
            ? "Moyenne"
            : "Basse";

    return (
      <Badge variant={variant} className="w-fit">
        {label}
      </Badge>
    );
  };

  const signers = signataires?.user;

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-[760px]">
        {/* Header avec fond */}
        <DialogHeader>
          <DialogTitle>
            {`Ticket - ${payment.title || "Sans titre"}`}
          </DialogTitle>
          <DialogDescription>
            {"Informations relatives au ticket"}
          </DialogDescription>
        </DialogHeader>

        {/* Contenu scrollable */}
        <div className="grid grid-cols-1 @min-[640px]/dialog:grid-cols-2 gap-4">
          {/**Reference */}
          <div className="view-group">
            <span className="view-icon">
              <LucideHash />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Référence"}</p>
              <div className="w-fit bg-primary-100 flex items-center justify-center px-1.5 rounded">
                <p className="text-primary-600 text-sm">
                  {payment.reference || "N/A"}
                </p>
              </div>
            </div>
          </div>


          {/* Type */}
          <div className="view-group">
            <span className="view-icon">
              <WalletCardsIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Type"}</p>
              <Badge
                variant={
                  getPaymentTypeBadge({
                    type: payment.type,
                    typeList: requestTypes,
                  }).variant
                }
              >
                {
                  getPaymentTypeBadge({
                    type: payment.type,
                    typeList: requestTypes,
                  }).label
                }
              </Badge>
            </div>
          </div>

          {/* Montant */}
          <div className="view-group">
            <span className="view-icon">
              <DollarSignIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Montant"}</p>
              <p className="font-semibold">{XAF.format(payment.price)}</p>
            </div>
          </div>

          {request?.type === "gas" && (
            <div className="view-group">
              <span className="view-icon">
                <Car />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Véhicule"}</p>
                <p>{`${vehicleData.data?.data.mark} ${vehicleData.data?.data.label}`}</p>
              </div>
            </div>
          )}

          {/* Bénéficiaire */}
          {(hasValue(payment.benefId) || request?.type === "facilitation") && (
            <div className="view-group">
              <span className="view-icon">
                <CircleUserRoundIcon />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Bénéficiaire"}</p>
                <p>
                  {request?.type === "facilitation"
                    ? users.find((u) => u.id === request.benFac?.list[0].id)?.firstName +
                    " " +
                    users.find((u) => u.id === request.benFac?.list[0].id)?.lastName
                    : users.find((u) => u.id === payment.userId)?.firstName +
                    " " +
                    users.find((u) => u.id === payment.userId)?.lastName}
                </p>
              </div>
            </div>
          )}

          {/* Projet */}
          {hasValue(payment.projectId) && (
            <div className="view-group">
              <span className="view-icon">
                <BriefcaseBusinessIcon />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Projet"}</p>
                <p className="font-semibold">
                  {projects.find((p) => p.id === payment.projectId)?.label ??
                    "N/A"}
                </p>
              </div>
            </div>
          )}

          {/* Récepteur pour compte */}
          {hasValue(request?.beneficiary) && (
            <>
              <div className="view-group">
                <span className="view-icon">
                  <User2 />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Récepteur pour compte"}</p>
                  <p className="font-semibold">
                    {users
                      .find((x) => x.id === Number(request?.beneficiary))
                      ?.firstName.concat(
                        " ",
                        users.find(
                          (x) => x.id === Number(request?.beneficiary),
                        )!.lastName,
                      )}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Demande associée */}
          {hasValue(payment.requestId) && (
            <>
              <div className="view-group">
                <span className="view-icon">
                  <ScrollIcon />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Besoin"}</p>
                  <p className="font-semibold">
                    {requests.find((r) => r.id === payment.requestId)?.label}
                  </p>
                </div>
              </div>
              <div className="view-group">
                <span className="view-icon">
                  <CircleUserRoundIcon />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Emetteur du besoin"}</p>
                  <p className="font-semibold">
                    {initiator?.firstName.concat(" ", initiator.lastName)}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Pour les achats */}
          {payment.type === "achat" && invoice && (
            <>
              {hasValue(invoice.command.provider.name) && (
                <div className="view-group">
                  <span className="view-icon">
                    <SquareUserRoundIcon />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Fournisseur"}</p>
                    <p className="font-semibold">
                      {invoice.command.provider.name}
                    </p>
                  </div>
                </div>
              )}

              {hasValue(invoice.command.reference) && (
                <div className="view-group">
                  <span className="view-icon">
                    <TableCellsSplitIcon />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Bon de commande"}</p>
                    <p className="font-semibold">
                      {invoice.command.devi.commandRequest.title}
                    </p>
                  </div>
                </div>
              )}

              {hasValue(payment.deadline) && (
                <div className="view-group">
                  <span className="view-icon">
                    <CalendarFoldIcon />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Date limite"}</p>
                    <p>
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
                <div className="view-group">
                  <span className="view-icon">
                    <RouteIcon />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Kilométrage"}</p>
                    <p className="font-semibold">{`${payment.km} KM`}</p>
                  </div>
                </div>
              )}

              {hasValue(payment.liters) && (
                <div className="view-group">
                  <span className="view-icon">
                    <FuelIcon />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">
                      {"Prix unitaire du Litre"}
                    </p>
                    <p className="font-semibold">
                      {XAF.format(payment.liters ?? 0)}
                    </p>
                  </div>
                </div>
              )}

              {hasValue(payment.liters) && (
                <div className="view-group">
                  <span className="view-icon">
                    <DropletIcon />
                  </span>
                  <div className="flex flex-col">
                    <p className="view-group-title">{"Nombre de litres"}</p>
                    <p className="font-semibold">
                      {payment.price && payment.liters
                        ? `${parseFloat((payment.price / payment.liters).toFixed(2))} L`
                        : ""}{" "}
                    </p>
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
          <div className="view-group">
            <span className="view-icon">
              <LucideFile />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Justificatif"}</p>
              {typeof payment.proof === "string" ? (
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
                  <p className="text-foreground font-medium">{"Document"}</p>
                </Link>
              ) : typeof payment.justification === "string" ? (
                <Link
                  href={`${process.env.NEXT_PUBLIC_API}/${payment.justification}`}
                  target="_blank"
                  className="flex gap-0.5 items-center"
                >
                  <img
                    src="/images/pdf.png"
                    alt="justificatif"
                    className="h-7 w-auto aspect-square"
                  />
                  <p className="text-foreground font-medium">{"Document"}</p>
                </Link>
              ) : (
                <p className="italic">{"Aucun document"}</p>
              )}
            </div>
          </div>

          {/* Méthode de paiement */}
          {hasValue(payment.methodId) && (
            <div className="view-group">
              <span className="view-icon">
                <CreditCard />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Méthode de paiement"}</p>
                <p className="font-semibold">{methodName}</p>
              </div>
            </div>
          )}

          {/* Statut */}
          <div className="view-group">
            <span className="view-icon">
              <AlertCircle />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Statut"}</p>
              {getStatusBadgeContent()}
            </div>
          </div>

          {/* Priorité */}
          {hasValue(payment.priority) && (
            <div className="view-group">
              <div className="view-icon">
                <ChevronsUp />
              </div>
              <div className="flex flex-col">
                <p className="view-group-title">{"Priorité"}</p>
                {getPriorityBadge()}
              </div>
            </div>
          )}

          {/* Date de création */}
          <div className="view-group">
            <span className="view-icon">
              <Calendar />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Créé le"}</p>
              <p className="font-semibold">
                {format(new Date(payment.createdAt), "dd MMMM yyyy à kk:mm", {
                  locale: fr,
                })}
              </p>
            </div>
          </div>

          {/* Date de modification */}
          {hasValue(payment.updatedAt) &&
            payment.updatedAt !== payment.createdAt && (
              <div className="view-group">
                <span className="view-icon">
                  <Calendar />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Modifié le"}</p>
                  <p className="font-semibold">
                    {format(
                      new Date(payment.updatedAt),
                      "dd MMMM yyyy à kk:mm",
                      {
                        locale: fr,
                      },
                    )}
                  </p>
                </div>
              </div>
            )}

          {/* Initié par */}
          {hasValue(payment.userId) && (
            <div className="view-group">
              <span className="view-icon">
                <User2 />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Initié par"}</p>
                <p className="font-semibold">
                  {users.find((u) => u.id === payment.userId)?.firstName +
                    " " +
                    users.find((u) => u.id === payment.userId)?.lastName}
                </p>
              </div>
            </div>
          )}

          {/* Motif de rejet */}
          {payment.status === "rejected" && hasValue(payment.reason) && (
            <div className="view-group">
              <span className="view-icon">
                <AlertCircle />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Motif du rejet"}</p>
                <p className="text-red-700 font-semibold">{payment.reason}</p>
              </div>
            </div>
          )}

          {signataires && signataires.user && (
            <div className="view-group">
              <span className="view-icon">
                <AlertCircle className="h-5 w-5" />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Mode de signature"}</p>
                <p className="font-medium">
                  {signataires?.mode === "ONE"
                    ? "Un dans la liste"
                    : signataires?.mode === "BOTH" &&
                      signataires.user?.length > 1
                      ? "Tous les signataires"
                      : "Un seul signataire"}
                </p>
              </div>
            </div>
          )}

          {/* Historique de signature */}
          {signers && signers.length > 0 && (
            <div className="view-group">
              <span className="view-icon">
                <SquareStackIcon />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Historique de signature"}</p>
                <div className="grid gap-2">
                  {/* On va mettre ceux qui sont dans paiement.signer en vert */}
                  {signers.map((s: User) => {
                    const isSigned = payment.signer
                      ?.flatMap((x) => x.id)
                      .includes(s.id);
                    const signer = payment.signer?.find((x) => x.id === s.id);
                    return (
                      <div
                        key={s.id}
                        className={cn(
                          "px-3 py-2 flex flex-col gap-1 border bg-gray-50 border-gray-200",
                          isSigned ? "bg-green-50 border-green-200" : "",
                        )}
                      >
                        <p className="text-sm font-medium text-gray-600">
                          {s.firstName + " " + s.lastName}
                        </p>
                        {/* {signer && <p className="text-sm text-muted-foreground">
                              {format(new Date(signer.createdAt!), "dd MMMM yyyy à kk:mm", {
                                locale: fr,
                              })}
                            </p>} */}
                        {isSigned && signer ? (
                          <p className="text-sm text-green-600">{"Signé"}</p>
                        ) : signataires.mode === "BOTH" ? (
                          <p className="text-sm text-gray-600">
                            {"En attente de signature"}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-600">
                            {"Ne peux plus signer"}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="view-group col-span-2">
            <span className="view-icon">
              <TextQuoteIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Description"}</p>
              <p>{payment.description ?? "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{"Fermer"}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ViewExpense;
