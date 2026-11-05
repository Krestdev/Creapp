"use client";

import { StatusBadge, type StatusTone } from "@/components/ds/status-badge";
import { UserAvatar } from "@/components/ds/user-avatar";
import {
  ViewDrawer,
  ViewField,
  ViewFile,
  ViewGrid,
} from "@/components/ds/view-drawer";
import { queryKeys } from "@/lib/query-keys";
import { cn, XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { categoryQ } from "@/queries/categoryModule";
import { paymentQ } from "@/queries/payment";
import {
  BonsCommande,
  ProjectT,
  Reception,
  RequestModelT,
  User,
} from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { RequestCircuit, ValidationCircuit } from "./request-circuit";

interface DetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: RequestModelT;
  users: User[];
  projects: ProjectT[];
  receptions: Array<Reception>;
  purchaseOrders: Array<BonsCommande>;
}

const PRIORITY_LABELS: Record<string, string> = {
  urgent: "Urgent",
  high: "Élevé",
  medium: "Moyen",
  low: "Faible",
};

const STATUS: Record<string, { label: string; tone: StatusTone }> = {
  pending: { label: "En attente", tone: "warning" },
  validated: { label: "Validé", tone: "success" },
  rejected: { label: "Rejeté", tone: "danger" },
  cancel: { label: "Annulé", tone: "danger" },
  DISCARDED: { label: "Annulé", tone: "danger" },
  store: { label: "Déstocké", tone: "info" },
};

const dateTime = (value: Date | string) =>
  format(new Date(value), "dd MMMM yyyy à HH:mm", { locale: fr });

export function DetailBesoin({
  open,
  onOpenChange,
  data,
  users,
  projects,
  receptions,
  purchaseOrders,
}: DetailModalProps) {
  const { user } = useStore();

  const paiements = useQuery({
    queryKey: queryKeys.payment(data.id),
    queryFn: async () => paymentQ.getAllByRequestId(data.id),
  });

  //Get old values
  const initialValues = data.requestOlds?.find((r) => r.userId !== user?.id);

  const getCategory = useQuery({
    queryKey: ["category", data.categoryId],
    queryFn: () => categoryQ.getCategory(data.categoryId!),
    enabled: !!data.categoryId,
  });

  const userName = (id?: number | string) => {
    const u = users.find((x) => x.id === Number(id));
    return u ? `${u.lastName} ${u.firstName}` : String(id ?? "");
  };

  const status = STATUS[data.state] ?? {
    label: String(data.state),
    tone: "neutral" as StatusTone,
  };

  // Valeurs précédentes (besoin modifié par un autre utilisateur)
  const oldestRequest = initialValues;
  const hasAmountChanged =
    !!data.amount && !!initialValues && initialValues.amount !== data.amount;
  const hasPriorityChanged =
    !!initialValues && initialValues.priority !== data.priority;
  const hasDueDateChanged =
    !!initialValues && initialValues.dueDate !== data.dueDate;
  const hasQuantityChanged =
    data.type === "achat" &&
    !!initialValues &&
    initialValues.quantity !== data.quantity;
  const modifier = users.find((u) => u.id === oldestRequest?.id);
  const author = users.find((u) => u.id === data.userId);
  const authorName = author
    ? `${author.firstName} ${author.lastName}`
    : "Non spécifié";

  const previous = (text: string) => (
    <p className="mt-1 text-caption text-text-tertiary">{text}</p>
  );

  const receiverLabel =
    data.type === "facilitation"
      ? "Récepteur pour compte"
      : data.type === "achat"
        ? "À réceptionner par"
        : "Bénéficiaire";

  const receivers = () => {
    if (data.beneficiary && data.beneficiary.length > 0) {
      return (
        <p className="font-semibold capitalize">
          {data.beneficiary === "me"
            ? userName(data.userId)
            : userName(data.beneficiary)}
        </p>
      );
    }
    if (data.beficiaryList && data.beficiaryList.length > 0) {
      return data.beficiaryList.map((ben) => (
        <p key={ben.id} className="font-semibold capitalize">
          {`${ben.firstName} ${ben.lastName}`}
        </p>
      ));
    }
    if (data.benFac) {
      return data.benFac.list.map((ben) => (
        <p key={ben.id} className="font-semibold capitalize">
          {`${ben?.name} - ${XAF.format(ben?.amount)}`}
        </p>
      ));
    }
    return <p className="italic">{"Non renseigné"}</p>;
  };

  const categoryLabel = (() => {
    if (!getCategory.isSuccess) return null;
    const label = getCategory.data.data.label;
    if (!label.includes("facilita")) return label;
    return data.type === "facilitation"
      ? "Facilitation"
      : data.type === "ressource_humaine"
        ? "Ressources humaines"
        : data.type === "speciaux"
          ? "Besoins spéciaux"
          : label;
  })();

  const proof = paiements.isSuccess
    ? (paiements.data.data?.proof as string | undefined)
    : undefined;
  const showCircuit = data.type !== "speciaux";

  return (
    <ViewDrawer
      open={open}
      onOpenChange={onOpenChange}
      eyebrow="Besoin"
      title={data.label}
      description="Consultez les informations associées au besoin"
    >
      <ViewGrid>
        <ViewField label="Référence">
          <p className="text-body-medium text-text-link">{data.ref}</p>
        </ViewField>
        <ViewField label="Statut">
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        </ViewField>

        <ViewField label="Type de besoin">
          <p className="font-semibold">
            {getCategory.isSuccess
              ? (getCategory.data.data.type?.label ?? "—")
              : getCategory.isLoading
                ? "Chargement…"
                : "—"}
          </p>
        </ViewField>
        <ViewField label="Catégorie">
          <p className="font-semibold">
            {getCategory.isLoading ? "Chargement…" : (categoryLabel ?? "—")}
          </p>
        </ViewField>

        <ViewField label="Priorité">
          <p
            className={cn(
              "font-semibold",
              data.priority === "urgent" && "text-status-danger-fg",
            )}
          >
            {PRIORITY_LABELS[data.priority] ?? data.priority}
          </p>
          {hasPriorityChanged &&
            oldestRequest?.priority &&
            previous(
              `Ancienne valeur : ${PRIORITY_LABELS[oldestRequest.priority] ?? oldestRequest.priority}`,
            )}
        </ViewField>
        {!!data.amount && (
          <ViewField label="Montant">
            <p className="font-semibold">{XAF.format(data.amount)}</p>
            {hasAmountChanged &&
              oldestRequest?.amount &&
              previous(`Ancienne valeur : ${XAF.format(oldestRequest.amount)}`)}
          </ViewField>
        )}

        {!!data.projectId && (
          <ViewField label="Projet" wide>
            <p className="font-semibold">
              {projects.find((p) => p.id === data.projectId)?.label ??
                data.projectId}
            </p>
          </ViewField>
        )}

        <ViewField label="Description" wide>
          <p className={cn(!data.description && "italic text-text-tertiary")}>
            {data.description || "Non renseigné"}
          </p>
        </ViewField>

        {data.state === "rejected" && (
          <ViewField label="Motif du rejet" wide>
            <p className="text-status-danger-fg">
              {data.validators?.find((x) => x.decision === "rejected")
                ?.comment ?? "Non renseigné"}
            </p>
          </ViewField>
        )}

        {(data.type === "achat" || data.type === "settle") && (
          <ViewField label="Quantité">
            <p className="font-semibold">{`${data.quantity} ${data.unit}`}</p>
            {hasQuantityChanged &&
              oldestRequest?.quantity &&
              previous(
                `Ancienne valeur : ${oldestRequest.quantity} ${oldestRequest.unit}`,
              )}
          </ViewField>
        )}

        {data.type === "ressource_humaine" && (
          <ViewField label="Période">
            {data.period ? (
              <p className="font-semibold">{`Du ${format(data.period.from!, "PPP", { locale: fr })} au ${format(data.period.to!, "PPP", { locale: fr })}`}</p>
            ) : (
              <p>{"Non renseigné"}</p>
            )}
          </ViewField>
        )}

        {data.type !== "speciaux" && data.beneficiary !== undefined && (
          <ViewField label={receiverLabel}>
            <div className="flex flex-col">{receivers()}</div>
          </ViewField>
        )}

        {data.type === "facilitation" && !!data.benFac?.list?.length && (
          <ViewField label="Pour le compte de" wide>
            <div className="flex flex-col">
              {data.benFac.list.map((ben) => (
                <p key={ben.id} className="font-semibold capitalize">
                  {`${ben?.name} - ${XAF.format(ben?.amount)}`}
                </p>
              ))}
            </div>
          </ViewField>
        )}

        <ViewField label="Date limite">
          <p className="font-semibold">
            {format(data.dueDate!, "dd MMMM yyyy", { locale: fr })}
          </p>
          {hasDueDateChanged &&
            oldestRequest?.dueDate &&
            previous(
              `Ancienne date : ${format(oldestRequest.dueDate, "dd MMMM yyyy", { locale: fr })}`,
            )}
        </ViewField>
        <ViewField label="Créé le">
          <p className="font-semibold">{dateTime(data.createdAt)}</p>
        </ViewField>
        <ViewField label="Modifié le">
          <p className="font-semibold">{dateTime(data.updatedAt)}</p>
          {!!oldestRequest &&
            !!modifier &&
            previous(
              `Modifié par ${modifier.firstName} ${modifier.lastName}`,
            )}
        </ViewField>
        <ViewField label="Initié par">
          <div className="flex items-center gap-1.5">
            <UserAvatar name={authorName} size="sm" />
            <p className="font-semibold">{authorName}</p>
          </div>
        </ViewField>
      </ViewGrid>

      {/* Pièce jointe */}
      {data.type !== "speciaux" && data.type !== "achat" && (
        <ViewField label="Pièce jointe" wide>
          {proof ? (
            <ViewFile
              name={proof.split("/").pop() ?? proof}
              meta={proof.includes(".") ? proof.split(".").pop()?.toUpperCase() : undefined}
              href={`${process.env.NEXT_PUBLIC_API}/${proof}`}
            />
          ) : (
            <p className="italic">{"Aucun justificatif"}</p>
          )}
        </ViewField>
      )}

      {/* Circuit de validation */}
      {showCircuit && !!data.validators?.length && (
        <ViewField label="Circuit de validation" wide>
          <ValidationCircuit validators={data.validators} users={users} />
        </ViewField>
      )}

      {/* Circuit du besoin */}
      {paiements.isSuccess && (
        <ViewField label="Circuit du besoin" wide>
          <RequestCircuit
            request={data}
            bonCommandes={purchaseOrders}
            ticket={paiements.data.data}
            receptions={receptions}
          />
        </ViewField>
      )}
    </ViewDrawer>
  );
}
