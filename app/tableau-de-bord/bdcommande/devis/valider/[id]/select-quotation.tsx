"use client";

import React from "react";
import { useFetchQuery } from "@/hooks/useData";
import { groupQuotationsByCommandRequest } from "@/lib/quotation-functions";
import { CommandRqstQueries } from "@/queries/commandRqstModule";
import { ProviderQueries } from "@/queries/providers";
import { QuotationQueries } from "@/queries/quotation";
import { notFound, useRouter } from "next/navigation";
import LoadingPage from "@/components/loading-page";
import { cn, XAF } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { Provider, QuotationGroup, SubmissionElement } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type SubmitPayload = Array<{
  deviId: number;
  elements: Array<{ name: string; elementIds: number[] }>;
}>;

const buildSubmitPayload = (
  quotationGroup: QuotationGroup,
  selected: Record<number, number>
): SubmitPayload => {
  // deviId -> { deviId, elements[] }
  const byDevi = new Map<number, SubmitPayload[number]>();

  for (const besoin of quotationGroup.commandRequest.besoins) {
    const providerId = selected[besoin.id];
    if (!providerId) continue;

    const quote = quotationGroup.quotations.find((q) => q.providerId === providerId);
    if (!quote) continue;

    const elementIds = (quote.element || [])
      .filter((el) => el.requestModelId === besoin.id)
      .map((el) => el.id);

    // Si aucun élément trouvé, on peut soit ignorer soit envoyer vide.
    // Je choisis d'ignorer pour éviter du bruit.
    if (elementIds.length === 0) continue;

    const existing = byDevi.get(quote.id);
    const groupItem = { name: besoin.label, elementIds };

    if (existing) {
      // éviter doublons si jamais
      const already = existing.elements.some((e) => e.name === groupItem.name);
      if (!already) existing.elements.push(groupItem);
    } else {
      byDevi.set(quote.id, { deviId: quote.id, elements: [groupItem] });
    }
  }

  return Array.from(byDevi.values());
};

function SelectQuotation({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const quotationQuery = new QuotationQueries();
  const quotations = useFetchQuery(["quotations"], quotationQuery.getAll);

  const providersQuery = new ProviderQueries();
  const providers = useFetchQuery(["providers"], providersQuery.getAll, 500000);

  const commandsQuery = new CommandRqstQueries();
  const commands = useFetchQuery(["commands"], commandsQuery.getAll, 30000);

  // ✅ State déclaré AVANT les returns
  // besoinId -> providerId (radio-like)
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

  // Map providers pour lookup rapide
  const providerMap = React.useMemo(() => {
    const list = providers.data?.data ?? [];
    return new Map<number, Provider>(list.map((p) => [p.id, p]));
  }, [providers.data]);

  // reset sélection quand on change de commande
  React.useEffect(() => {
    setSelected({});
  }, [id]);

  // ✅ CORRECTION ICI : Gérer le cas où quotationGroup est undefined
  const payload = React.useMemo(() => {
    if (!quotationGroup) return [];
    return buildSubmitPayload(quotationGroup, selected);
  }, [quotationGroup, selected]);

  const allSelected = React.useMemo(() => {
    if (!quotationGroup) return false;
    return (
      quotationGroup.commandRequest.besoins.length > 0 &&
      quotationGroup.commandRequest.besoins.every((b) => !!selected[b.id])
    );
  }, [quotationGroup, selected]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (value: SubmitPayload) => quotationQuery.validate(value),
    onSuccess: () => {
      toast.success(
        "Décision enregistrée ! Les devis sélectionnés ont été mis à jour avec succès"
      );
      queryClient.invalidateQueries({ queryKey: ["quotations", "commands"] });
      router.push("/tableau-de-bord/bdcommande/devis");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Une erreur est survenue");
    },
  });

  const handleSubmit = async () => {
    if (!allSelected || !quotationGroup) return;
    mutate(payload);
  };

  const toggleSelection = (besoinId: number, providerId: number) => {
    setSelected((prev) => ({ ...prev, [besoinId]: providerId }));
  };

  // ✅ Déplacer les vérifications de chargement et de données après tous les hooks
  if (quotations.isLoading || providers.isLoading || commands.isLoading)
    return <LoadingPage />;
  if (!quotationGroup) return notFound();

  return (
    <div className="space-y-6">
      {quotationGroup.commandRequest.besoins.map((besoin) => {
        return (
          <div key={besoin.id} className="flex flex-col gap-4">
            <h3 className="font-semibold">{besoin.label}</h3>

            <div className="grid gap-3 grid-cols-1 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-3 @min-[1280px]:grid-cols-4 @min-[1600px]:grid-cols-5">
              {quotationGroup.quotations.map((quote) => {
                // ✅ ne prendre que les éléments de CE besoin
                const elements = (quote.element || []).filter(
                  (el) => el.requestModelId === besoin.id
                );

                // Option: si un fournisseur ne propose rien pour ce besoin, on n'affiche pas sa carte
                if (elements.length === 0) return null;

                const provider = providerMap.get(quote.providerId);
                const checked = selected[besoin.id] === quote.providerId;

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
                      onCheckedChange={() =>
                        toggleSelection(besoin.id, quote.providerId)
                      }
                    />

                    <div className="grid gap-3">
                      <span className="font-semibold uppercase">
                        {provider?.name ?? "Introuvable"}
                      </span>

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
        disabled={!allSelected || isPending}
        isLoading={isPending}
      >
        {"Valider la sélection"}
      </Button>
    </div>
  );
}

export default SelectQuotation;