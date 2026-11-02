"use client";

import { DetailBesoin } from "@/components/besoin/detail-besoin";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import { InfoCallout } from "@/components/ds/info-callout";
import { ModalWarning } from "@/components/modals/modal-warning";
import { queryKeys } from "@/lib/query-keys";
import {
  groupQuotationsByCommandRequest,
  isBesoinFullyDiscarded,
} from "@/lib/quotation-functions";
import { useStore } from "@/providers/datastore";
import { userQ } from "@/queries/baseModule";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { projectQ } from "@/queries/projectModule";
import { providerQ } from "@/queries/providers";
import { purchaseQ } from "@/queries/purchase-order";
import { quotationQ } from "@/queries/quotation";
import { receptionQ } from "@/queries/reception";
import type { Provider, QuotationGroup, RequestModelT } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notFound, useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { buildRows, summarizeRetained } from "./comparison";
import { ComparisonTable } from "./comparison-table";
import { DecisionBar } from "./decision-bar";

type SubmitPayload = Array<{
  deviId: number;
  userId: number;
  commandRequestId: number;
  elements: Array<{ name: string; elementIds: number[] }>;
}>;

/**
 * Pré-remplit la sélection basée sur le statut "SELECTED" déjà en base
 */
const computePreselected = (quotationGroup: QuotationGroup) => {
  const pre: Record<number, number> = {};
  for (const besoin of quotationGroup.commandRequest.besoins) {
    const quoteSelected = quotationGroup.quotations.find((q) =>
      (q.element || []).some(
        (el) => el.requestModelId === besoin.id && el.status === "SELECTED",
      ),
    );
    if (quoteSelected) {
      pre[besoin.id] = quoteSelected.providerId;
    }
  }
  return pre;
};

function SelectQuotation({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useStore();
  const queryClient = useQueryClient();

  // --- QUERIES ---
  const quotations = useQuery({
    queryKey: queryKeys.quotations,
    queryFn: quotationQ.getAll,
  });
  const providers = useQuery({
    queryKey: queryKeys.providers,
    queryFn: providerQ.getAll,
  });
  const commands = useQuery({
    queryKey: queryKeys.quotationRequests,
    queryFn: commandRqstQ.getAll,
  });
  const purchaseOrders = useQuery({
    queryKey: queryKeys.purchaseOrders,
    queryFn: purchaseQ.getAll,
  });
  const users = useQuery({
    queryKey: queryKeys.users,
    queryFn: userQ.getAll,
  });
  const projects = useQuery({
    queryKey: queryKeys.projects,
    queryFn: projectQ.getAll,
  });
  const receptions = useQuery({
    queryKey: queryKeys.receptions,
    queryFn: receptionQ.getAll,
  });

  const [selected, setSelected] = React.useState<Record<number, number>>({});
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [selectedBesoin, setSelectedBesoin] =
    React.useState<RequestModelT | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
  const [besoinToCancel, setBesoinToCancel] =
    React.useState<RequestModelT | null>(null);

  // --- LOGIQUE DE VERROUILLAGE ---

  // 1. IDs des cotations (Devis) déjà transformées en Bon de Commande
  const usedQuotationIds = React.useMemo(() => {
    return new Set(purchaseOrders.data?.data.map((po) => po.deviId) || []);
  }, [purchaseOrders.data]);

  // 2. IDs des besoins (RequestModel) déjà "couverts" par un Bon de Commande
  const lockedBesoinIds = React.useMemo(() => {
    const locked = new Set<number>();
    if (!quotations.data) return locked;

    quotations.data.data.forEach((q) => {
      if (usedQuotationIds.has(q.id)) {
        q.element?.forEach((el) => {
          locked.add(el.requestModelId);
        });
      }
    });
    return locked;
  }, [usedQuotationIds, quotations.data]);

  // --- MEMOS DE DONNÉES ---
  const groups: Array<QuotationGroup> = React.useMemo(() => {
    if (!quotations.data || !providers.data || !commands.data) return [];
    return groupQuotationsByCommandRequest(
      commands.data.data,
      quotations.data.data,
      providers.data.data,
    );
  }, [commands.data, quotations.data, providers.data]);

  const quotationGroup = React.useMemo(() => {
    return groups.find((x) => x.commandRequest.id === Number(id));
  }, [groups, id]);

  const providerMap = React.useMemo(() => {
    const list = providers.data?.data ?? [];
    return new Map<number, Provider>(list.map((p) => [p.id, p]));
  }, [providers.data]);

  const [prevQuotationGroupId, setPrevQuotationGroupId] = React.useState<number | null>(null);

  if (quotationGroup && quotationGroup.commandRequest.id !== prevQuotationGroupId) {
    setPrevQuotationGroupId(quotationGroup.commandRequest.id);
    setSelected(computePreselected(quotationGroup));
  }

  // --- ACTIONS ---
  const { mutate, isPending } = useMutation({
    mutationFn: async (value: SubmitPayload) => quotationQ.validate(value),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Décisions enregistrées avec succès !");
      router.push("/tableau-de-bord/commande/devis/approbation");
    },
    onError: (error: any) => {
      toast.error(error.message ?? "Une erreur est survenue");
    },
  });

  const { mutate: rejectBesoin, isPending: isRejectingBesoin } = useMutation({
    mutationFn: async (besoin: RequestModelT) => {
      await quotationQ.RejectRequestFromQuotation(besoin.id);
    },
    onSuccess: () => {
      toast.success("Le besoin a été annulé avec succès !");
      queryClient.invalidateQueries({ queryKey: queryKeys.quotations });
      setBesoinToCancel(null);
    },
    onError: (error: any) => {
      toast.error(error.message ?? "Une erreur est survenue");
    },
  });

  const buildSubmitPayload = (): SubmitPayload => {
    if (!quotationGroup) return [];
    const byDevi = new Map<number, SubmitPayload[number]>();

    for (const besoin of quotationGroup.commandRequest.besoins) {
      const providerId = selected[besoin.id];
      if (!providerId) continue;

      const quote = quotationGroup.quotations.find(
        (q) => q.providerId === providerId,
      );
      if (!quote) continue;

      const elementIds = (quote.element || [])
        .filter((el) => el.requestModelId === besoin.id)
        .map((el) => el.id);

      if (elementIds.length === 0) continue;

      const existing = byDevi.get(quote.id);
      const groupItem = { name: besoin.label, elementIds };

      if (existing) {
        if (!existing.elements.some((e) => e.name === groupItem.name)) {
          existing.elements.push(groupItem);
        }
      } else {
        byDevi.set(quote.id, {
          deviId: quote.id,
          userId: user?.id ?? 0,
          commandRequestId: quote.commandRequestId,
          elements: [groupItem],
        });
      }
    }
    return Array.from(byDevi.values());
  };

  const handleSubmit = () => {
    const payload = buildSubmitPayload();
    if (payload.length === 0) {
      toast.error("Veuillez sélectionner au moins un nouveau besoin.");
      return;
    }
    mutate(payload);
  };

  const toggleSelection = (
    besoinId: number,
    providerId: number,
    isDisabled: boolean,
  ) => {
    if (isDisabled) return;
    setSelected((prev) => {
      if (prev[besoinId] === providerId) {
        const next = { ...prev };
        delete next[besoinId];
        return next;
      }
      return { ...prev, [besoinId]: providerId };
    });
  };

  // --- RENDERING ---
  if (
    quotations.isLoading ||
    providers.isLoading ||
    commands.isLoading ||
    purchaseOrders.isLoading ||
    users.isLoading ||
    projects.isLoading ||
    receptions.isLoading
  )
    return <LoadingPage />;

  if (
    quotations.isError ||
    providers.isError ||
    commands.isError ||
    purchaseOrders.isError ||
    users.isError ||
    projects.isError ||
    receptions.isError
  )
    return <ErrorPage />;

  if (!quotationGroup) return notFound();

  const rows = buildRows(
    quotationGroup.commandRequest.besoins,
    quotationGroup.quotations,
  );
  const retained = summarizeRetained(rows, quotationGroup.quotations, selected);
  // Rien à décider si toutes les lignes retenues sont déjà figées (en BC ou annulées).
  const hasEditableSelection = rows.some(
    (row) =>
      selected[row.besoin.id] !== undefined &&
      !lockedBesoinIds.has(row.besoin.id) &&
      !isBesoinFullyDiscarded(row.besoin.id, quotationGroup.quotations),
  );
  const notRetainedQuotes =
    quotationGroup.quotations.length - retained.retainedQuotes;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-body text-text-secondary">
        {"Demande de cotation : "}
        <span className="text-body-medium text-text-primary">
          {quotationGroup.commandRequest.title}
        </span>
        {` · ${quotationGroup.commandRequest.reference}`}
      </p>

      <ComparisonTable
        besoins={quotationGroup.commandRequest.besoins}
        quotations={quotationGroup.quotations}
        providerMap={providerMap}
        users={users.data?.data ?? []}
        selected={selected}
        lockedBesoinIds={lockedBesoinIds}
        usedQuotationIds={usedQuotationIds}
        cancellingBesoinId={isRejectingBesoin ? besoinToCancel?.id : null}
        onToggle={(besoinId, providerId) =>
          toggleSelection(besoinId, providerId, false)
        }
        onView={(besoin) => {
          setSelectedBesoin(besoin);
          setIsDetailModalOpen(true);
        }}
        onCancel={(besoin) => {
          setBesoinToCancel(besoin);
          setIsCancelModalOpen(true);
        }}
      />

      <InfoCallout tone="info">
        {retained.retainedQuotes > 1
          ? `Un même besoin peut être servi par plusieurs fournisseurs : les lignes retenues sont réparties entre ${retained.retainedQuotes} devis, un par fournisseur retenu.`
          : "Retenez, pour chaque ligne, l’offre d’un seul fournisseur : les lignes d’une même demande peuvent être servies par des fournisseurs différents."}
        {lockedBesoinIds.size > 0 &&
          " Les lignes déjà en bon de commande sont verrouillées et ne peuvent plus être modifiées."}
      </InfoCallout>

      <DecisionBar
        total={retained.total}
        lines={retained.lines}
        retainedQuotes={retained.retainedQuotes}
        notRetainedQuotes={notRetainedQuotes}
        disabled={!hasEditableSelection}
        isPending={isPending}
        onSubmit={handleSubmit}
      />

      {selectedBesoin && (
        <DetailBesoin
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          data={selectedBesoin}
          users={users.data?.data ?? []}
          projects={projects.data?.data ?? []}
          receptions={receptions.data?.data ?? []}
          purchaseOrders={purchaseOrders.data?.data ?? []}
        />
      )}

      <ModalWarning
        open={isCancelModalOpen}
        onOpenChange={setIsCancelModalOpen}
        title="Annuler le besoin"
        name={besoinToCancel?.label}
        description="Cette action est irréversible."
        message="Le besoin sera retiré de tous les devis associés à cette demande et ne pourra plus être restauré."
        warning="Cette action est irréversible !"
        actionText="Confirmer l'annulation"
        variant="error"
        onAction={() => {
          if (besoinToCancel) rejectBesoin(besoinToCancel);
        }}
      />
    </div>
  );
}

export default SelectQuotation;
