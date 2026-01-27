"use client";

import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { groupQuotationsByCommandRequest } from "@/lib/quotation-functions";
import { cn, XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { providerQ } from "@/queries/providers";
import { purchaseQ } from "@/queries/purchase-order";
import { quotationQ } from "@/queries/quotation";
import type { Provider, QuotationGroup } from "@/types/types";
import { useMutation, useQuery } from "@tanstack/react-query";
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

  // --- QUERIES ---
  const quotations = useQuery({ queryKey: ["quotations"], queryFn: quotationQ.getAll });
  const providers = useQuery({ queryKey: ["providers"], queryFn: providerQ.getAll });
  const commands = useQuery({ queryKey: ["commands"], queryFn: commandRqstQ.getAll });
  const purchaseOrders = useQuery({ queryKey: ["purchaseOrders"], queryFn: purchaseQ.getAll });

  const [selected, setSelected] = React.useState<Record<number, number>>({});

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

  // Sync de la sélection initiale
  React.useEffect(() => {
    if (!quotationGroup) return;
    setSelected(computePreselected(quotationGroup));
  }, [quotationGroup?.commandRequest?.id]);

  // --- ACTIONS ---
  const { mutate, isPending } = useMutation({
    mutationFn: async (value: SubmitPayload) => quotationQ.validate(value),
    onSuccess: () => {
      toast.success("Décisions enregistrées avec succès !");
      router.push("/tableau-de-bord/commande/devis/approbation");
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

      const quote = quotationGroup.quotations.find((q) => q.providerId === providerId);
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

  const toggleSelection = (besoinId: number, providerId: number, isDisabled: boolean) => {
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
  if (quotations.isLoading || providers.isLoading || commands.isLoading || purchaseOrders.isLoading)
    return <LoadingPage />;
  
  if (quotations.isError || providers.isError || commands.isError || purchaseOrders.isError)
    return <ErrorPage />;

  if (!quotationGroup) return notFound();

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Approbation des devis</h1>
        <p className="text-muted-foreground">Réf: {quotationGroup.commandRequest.title}</p>
      </div>

      {quotationGroup.commandRequest.besoins.map((besoin, index) => {
        const isBesoinLocked = lockedBesoinIds.has(besoin.id);

        return (
          <div key={besoin.id} className={cn("flex flex-col gap-4", isBesoinLocked && "bg-slate-50/50")}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg"><u>{`Besoin ${index + 1}:`}</u>{` ${besoin.label}`}</h3>
              {isBesoinLocked && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
                  {"Verrouillé"}
                </Badge>
              )}
            </div>

            {!quotationGroup.quotations.some(q => q.element?.some(el => el.requestModelId === besoin.id)) && <p className="text-gray-600 italic">{"Aucun devis ne remplis ce besoin."}</p>}
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {quotationGroup.quotations.map((quote) => {
                const elements = (quote.element || []).filter((el) => el.requestModelId === besoin.id);
                if (elements.length === 0) return null;

                const provider = providerMap.get(quote.providerId);
                const isSelected = selected[besoin.id] === quote.providerId;
                
                // On bloque la carte si :
                // 1. Le devis (quote) est déjà dans un BC.
                // 2. OU si le besoin est déjà satisfait par une autre ligne dans un BC.
                const isUsedInPO = usedQuotationIds.has(quote.id);
                const isCardDisabled = isUsedInPO || isBesoinLocked;

                return (
                  <div
                    key={`${besoin.id}-${quote.providerId}`}
                    className={cn(
                      "relative rounded-lg p-4 flex flex-col gap-3 border transition-all select-none",
                      isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-white",
                      isCardDisabled ? "opacity-60 cursor-not-allowed grayscale-[0.5]" : "cursor-pointer hover:shadow-md hover:border-primary/40"
                    )}
                    onClick={() => toggleSelection(besoin.id, quote.providerId, isCardDisabled)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={isSelected} 
                          disabled={isCardDisabled} 
                          className={cn(isCardDisabled && "opacity-50")}
                        />
                        <span className="font-bold text-sm uppercase truncate max-w-[150px]">
                          {provider?.name ?? "Fournisseur inconnu"}
                        </span>
                      </div>
                      {isUsedInPO && (
                        <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4">BC Émis</Badge>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                      {elements.map((element) => (
                        <div key={element.id} className="flex flex-col gap-0.5">
                          <span className="text-xs text-muted-foreground line-clamp-1">{element.title}</span>
                          <span className="text-sm font-semibold text-primary">
                            {XAF.format(element.priceProposed || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Barre d'action flottante */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
        <div className="bg-white/80 backdrop-blur-md border shadow-2xl rounded-2xl p-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {Object.keys(selected).length} besoin(s) sélectionné(s)
            </span>
            <span className="text-[10px] text-muted-foreground italic">
              Les éléments déjà en Bon de Commande ne peuvent plus être modifiés.
            </span>
          </div>
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={Object.keys(selected).length === 0 || isPending}
            isLoading={isPending}
            className="shadow-lg shadow-primary/20"
          >
            Enregistrer les décisions
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SelectQuotation;