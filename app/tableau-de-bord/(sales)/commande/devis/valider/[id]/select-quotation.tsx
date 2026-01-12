"use client";

import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useFetchQuery } from "@/hooks/useData";
import { groupQuotationsByCommandRequest } from "@/lib/quotation-functions";
import { cn, XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { providerQ } from "@/queries/providers";
import { purchaseQ } from "@/queries/purchase-order";
import { quotationQ } from "@/queries/quotation";
import type { Provider, QuotationGroup } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notFound, useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

type SubmitPayload = Array<{
  deviId: number;
  userId: number;
  commandRequestId: number;
  elements: Array<{ name: string; elementIds: number[] }>;
}>;

/**
 * ✅ Preload:
 * besoinId -> providerId, basé sur element.status === "SELECTED"
 */
const computePreselected = (quotationGroup: QuotationGroup) => {
  const pre: Record<number, number> = {};

  for (const besoin of quotationGroup.commandRequest.besoins) {
    const quoteSelected = quotationGroup.quotations.find((q) =>
      (q.element || []).some(
        (el) => el.requestModelId === besoin.id && el.status === "SELECTED"
      )
    );

    if (quoteSelected) {
      pre[besoin.id] = quoteSelected.providerId;
    }
  }

  return pre;
};

function SelectQuotation({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { user } = useStore();

  const buildSubmitPayload = (
    quotationGroup: QuotationGroup,
    selected: Record<number, number>
  ): SubmitPayload => {
    const byDevi = new Map<number, SubmitPayload[number]>();

    for (const besoin of quotationGroup.commandRequest.besoins) {
      const providerId = selected[besoin.id];
      if (!providerId) continue;

      const quote = quotationGroup.quotations.find(
        (q) => q.providerId === providerId
      );
      if (!quote) continue;

      const elementIds = (quote.element || [])
        .filter((el) => el.requestModelId === besoin.id)
        .map((el) => el.id);

      if (elementIds.length === 0) continue;

      const existing = byDevi.get(quote.id);
      const groupItem = { name: besoin.label, elementIds };

      if (existing) {
        const already = existing.elements.some(
          (e) => e.name === groupItem.name
        );
        if (!already) existing.elements.push(groupItem);
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

  const quotations = useFetchQuery(["quotations"], quotationQ.getAll);

  const providers = useFetchQuery(["providers"], providerQ.getAll, 500000);

  const commands = useFetchQuery(["commands"], commandRqstQ.getAll, 30000);

  const purchaseOrder = useFetchQuery(["purchaseOrders"], purchaseQ.getAll);

  // besoinId -> providerId
  const [selected, setSelected] = React.useState<Record<number, number>>({});

  const groups: Array<QuotationGroup> = React.useMemo(() => {
    if (!quotations.data || !providers.data || !commands.data) return [];
    return groupQuotationsByCommandRequest(
      commands.data.data,
      quotations.data.data,
      providers.data.data
    );
  }, [commands.data, quotations.data, providers.data]);

  const quotationGroup = React.useMemo(() => {
    return groups.find((x) => x.commandRequest.id === Number(id));
  }, [groups, id]);

  const providerMap = React.useMemo(() => {
    const list = providers.data?.data ?? [];
    return new Map<number, Provider>(list.map((p) => [p.id, p]));
  }, [providers.data]);

  /**
   * ✅ IMPORTANT:
   * on preload la sélection existante (validation déjà faite)
   * et on évite de reset à {} (sinon tu perds le preload)
   */
  React.useEffect(() => {
    if (!quotationGroup) return;
    setSelected(computePreselected(quotationGroup));
  }, [quotationGroup?.commandRequest?.id]); // basé sur la demande

  const payload = React.useMemo(() => {
    if (!quotationGroup) return [];
    return buildSubmitPayload(quotationGroup, selected);
  }, [quotationGroup, selected]);

  /**
   * ✅ Validation partielle:
   * on autorise la soumission si au moins 1 besoin est sélectionné
   */
  const hasAtLeastOneSelection = React.useMemo(() => {
    return Object.keys(selected).length > 0;
  }, [selected]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (value: SubmitPayload) => quotationQ.validate(value),
    onSuccess: () => {
      toast.success("Décision enregistrée !");
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["commands"] });
      router.push("/tableau-de-bord/commande/devis/approbation");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Une erreur est survenue");
    },
  });

  const handleSubmit = () => {
    if (!quotationGroup) return;

    if (payload.length === 0) {
      toast.error("Sélectionnez au moins un besoin à valider.");
      return;
    }

    mutate(payload);
  };

  const toggleSelection = (besoinId: number, providerId: number) => {
    setSelected((prev) => {
      // si on clique sur le même provider déjà choisi => déselection
      if (prev[besoinId] === providerId) {
        const next = { ...prev };
        delete next[besoinId];
        return next;
      }
      // sinon, on sélectionne / remplace
      return { ...prev, [besoinId]: providerId };
    });
  };

  if (
    quotations.isLoading ||
    providers.isLoading ||
    commands.isLoading ||
    purchaseOrder.isLoading
  )
    return <LoadingPage />;
  if (
    quotations.isError ||
    providers.isError ||
    commands.isError ||
    purchaseOrder.isError
  )
    return <ErrorPage />;
  if (
    purchaseOrder.data &&
    quotationGroup &&
    purchaseOrder.data.data.find((x) =>
      quotationGroup.quotations.some((y) => y.id === x.deviId)
    )
  )
    return (
      <ErrorPage
        statusCode={401}
        message="Un bon de commande a déjà été crée avec un devis appartenant à ce groupe"
      />
    );
  if (!quotationGroup) return notFound();

  return (
    <div className="space-y-6">
      {quotationGroup.commandRequest.besoins.map((besoin) => {
        return (
          <div key={besoin.id} className="flex flex-col gap-4">
            <h3 className="font-semibold">{besoin.label}</h3>

            <div className="grid gap-3 grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-3 @min-[1280px]:grid-cols-4 @min-[1600px]:grid-cols-5">
              {quotationGroup.quotations.map((quote) => {
                const elements = (quote.element || []).filter(
                  (el) => el.requestModelId === besoin.id
                );
                if (elements.length === 0) return null;

                const provider = providerMap.get(quote.providerId);
                const checked = selected[besoin.id] === quote.providerId;

                // ✅ indique si ce fournisseur est déjà validé pour ce besoin
                const alreadyValidated = elements.some(
                  (e) => e.status === "SELECTED"
                );

                return (
                  <div
                    key={`${besoin.id}-${quote.providerId}`}
                    className={cn(
                      "rounded-lg shadow-sm p-4 flex flex-row gap-3 items-start border cursor-pointer",
                      checked && "border-primary ring-2 ring-primary/30"
                    )}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleSelection(besoin.id, quote.providerId)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        toggleSelection(besoin.id, quote.providerId);
                      }
                    }}
                  >
                    <Checkbox
                      checked={checked}
                      className="z-10"
                    />

                    <div className="grid gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold uppercase">
                          {provider?.name ?? "Introuvable"}
                        </span>
                        {alreadyValidated && (
                          <Badge variant={"primary"}>{"Déjà validé"}</Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {elements.map((element) => (
                          <div
                            key={element.id}
                            className="flex flex-col gap-1.5 text-sm"
                          >
                            <span>{element.title}</span>
                            <span className="text-primary-600 font-medium">
                              {XAF.format(element.priceProposed || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <Button
        type="button"
        variant={"primary"}
        onClick={handleSubmit}
        disabled={!hasAtLeastOneSelection || isPending}
        isLoading={isPending}
      >
        {"Valider la sélection"}
      </Button>
    </div>
  );
}

export default SelectQuotation;
