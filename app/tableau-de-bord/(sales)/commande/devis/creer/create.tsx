"use client";
import { SearchableSelect } from "@/components/base/searchableSelect";
import FilesUpload from "@/components/comp-547";
import LoadingPage from "@/components/loading-page";
import { ProviderDialog } from "@/components/modals/ProviderDialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { units } from "@/data/unit";
import { formatNumber } from "@/lib/format";
import { isBesoinFullyDiscarded } from "@/lib/quotation-functions";
import { cn } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { providerQ } from "@/queries/providers";
import { quotationQ } from "@/queries/quotation";
import { Quotation, RequestModelT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, PlusIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  commandRequestId: z.number({ message: "Requis" }),
  providerId: z.number({ message: "Requis" }),
  dueDate: z.string({ message: "Veuillez définir une date" }).refine(
    (val) => {
      const d = new Date(val);
      return !isNaN(d.getTime());
    },
    { message: "Date invalide" },
  ),
  elements: z
    .array(
      z.object({
        id: z.number().optional(),
        needId: z.number({ message: "Veuillez sélectionner un besoin" }),
        designation: z
          .string({ message: "Veuillez renseigner une désignation" })
          .trim()
          .min(1, { message: "Veuillez renseigner une désignation" }),
        quantity: z
          .number()
          .positive({ message: "Veuillez entrer une quantité supérieure à 0" }),
        unit: z.string(),
        price: z
          .number({ message: "Veuillez renseigner un prix" })
          .min(0, { message: "Le prix ne peut pas être négatif" }),
        hasIs: z.boolean(),
        reduction: z.number().nonnegative(),
        tva: z.number().nonnegative(),
      }),
    )
    .min(1, { message: "Veuillez ajouter au moins un élément" }),
  proof: z.array(
    z.union([
      z.instanceof(File, { message: "Doit être un fichier valide" }),
      z.string(),
    ]),
  ),
});

type FormValues = z.infer<typeof formSchema>;
type ElementValues = FormValues["elements"][number];

const DEFAULT_TVA = 19.25;
const TVA_RATES = [0, DEFAULT_TVA];

/** Colonnes de la table des lignes (Figma · Lignes du devis). */
const GRID =
  "grid grid-cols-[150px_minmax(150px,1fr)_100px_88px_110px_92px_104px_96px_110px_16px] items-start gap-2";

const rate = (value: number) => `${String(value).replace(".", ",")} %`;

const fieldClass = "h-8 min-w-0 rounded-md px-2.5 text-body";

interface Props {
  quotation?: Quotation;
  openChange?: React.Dispatch<React.SetStateAction<boolean>>;
}

function Card({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col gap-3.5 rounded-xl border border-border-default bg-surface px-6 py-5",
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <h2 className="text-title text-text-primary">{title}</h2>
        {description && (
          <p className="text-caption text-text-tertiary">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function TotalRow({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start py-1 text-body">
      <span className="flex-1 text-text-secondary">{label}</span>
      <span className="text-body-medium whitespace-nowrap text-text-primary">
        {value}
      </span>
    </div>
  );
}

function CreateQuotation({ quotation, openChange }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const intentRef = React.useRef<"save" | "saveAndCreate">("save");
  const [openP, setOpenP] = React.useState<boolean>(false);
  const [openS, setOpenS] = React.useState<boolean>(false);
  const [selectedNeeds, setSelectedNeeds] = React.useState<
    Array<RequestModelT>
  >([]);
  const [previousCommandId, setPreviousCommandId] = React.useState<
    number | undefined
  >(undefined);
  const [search, setSearch] = React.useState("");
  const [dueDate, setDueDate] = React.useState<boolean>(false);
  const { user } = useStore();

  /** Demandes de cotation */
  const cmdRqstData = useQuery({
    queryKey: ["commands"],
    queryFn: commandRqstQ.getAll,
  });

  /** Devis */
  const quotationsData = useQuery({
    queryKey: ["quotations"],
    queryFn: quotationQ.getAll,
  });

  /** Fournisseurs */
  const providersData = useQuery({
    queryKey: ["providers"],
    queryFn: providerQ.getAll,
  });

  /** Valeurs par défaut du formulaire - CORRIGÉ POUR CORRESPONDRE À LA STRUCTURE */
  const defaultValues = useMemo(() => {
    const today = new Date();
    today.setDate(today.getDate() + 3);

    if (quotation) {
      return {
        commandRequestId: quotation.commandRequestId,
        providerId: quotation.providerId,
        elements: quotation.element.map((c) => ({
          id: c.id,
          needId: c.requestModelId,
          designation: c.title,
          quantity: c.quantity,
          unit: c.unit,
          price: c.priceProposed,
          hasIs: c.hasIs ?? false,
          reduction: c.reduction ?? 0,
          tva: c.tva ?? 0,
        })),
        dueDate: format(new Date(quotation.dueDate), "yyyy-MM-dd"),
        proof: quotation.proof ? [quotation.proof] : [],
      };
    }

    return {
      commandRequestId: undefined,
      providerId: undefined,
      elements: [],
      dueDate: format(today, "yyyy-MM-dd"),
      proof: [],
    };
  }, [quotation]);

  /** Formulaire */
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
    mode: "onChange",
  });

  /** Mutation pour créer/modifier un devis */
  const { mutate, isPending } = useMutation({
    mutationFn: async ({ values, id }: { values: FormValues; id?: number }) => {
      // Gestion du fichier justificatif
      const proofValue = values.proof[0];

      const payload = {
        devis: {
          commandRequestId: values.commandRequestId,
          providerId: values.providerId,
          proof: proofValue,
          dueDate: new Date(values.dueDate).toISOString(),
          userId: user && user.id ? user.id : 0,
        },
        elements: values.elements.map((e) => ({
          id: e.id,
          requestModelId: e.needId,
          title: e.designation,
          quantity: e.quantity,
          unit: e.unit,
          priceProposed: e.price,
          hasIs: e.hasIs,
          tva: e.tva,
          reduction: e.reduction,
        })),
      };

      if (!id) {
        return quotationQ.create(payload);
      }
      return quotationQ.update(id, payload);
    },
    onSuccess: (_data, variables) => {
      const intent = intentRef.current;
      queryClient.invalidateQueries();
      toast.success(
        variables?.id
          ? "Votre devis a été modifié avec succès"
          : "Votre devis a été créé avec succès",
      );
      if (openChange) {
        openChange(false);
      }

      if (variables?.id) {
        // Modification : retour à la liste des devis.
        router.push("/tableau-de-bord/commande/devis");
      } else if (intent === "save") {
        // Réinitialisation pour un nouvel ajout
        form.reset({
          commandRequestId: undefined,
          providerId: undefined,
          elements: [],
          dueDate: format(
            new Date(new Date().setDate(new Date().getDate() + 3)),
            "yyyy-MM-dd",
          ),
          proof: [],
        });
        setSelectedNeeds([]);
        setPreviousCommandId(undefined);
        intentRef.current = "save";
      } else {
        router.push("/tableau-de-bord/commande/devis");
      }
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error(
        "Une erreur est survenue lors de la création/modification du devis.",
      );
    },
  });

  /** Tous les besoins d'une demande, y compris ceux entièrement annulés */
  const getCommandBesoins = useCallback(
    (commandId: number) => {
      const command = cmdRqstData.data?.data.find((c) => c.id === commandId);
      if (command) return command.besoins ?? [];
      // Demande absente de la liste (modification) : besoins déjà chargés avec le devis.
      return quotation?.commandRequestId === commandId
        ? (quotation.commandRequest?.besoins ?? [])
        : [];
    },
    [cmdRqstData.data, quotation],
  );

  /**
   * Besoins que ce devis peut encore chiffrer : ni déjà retenus dans un autre
   * devis, ni entièrement annulés par un approbateur.
   */
  const getEligibleNeeds = useCallback(
    (commandId: number) => {
      const others =
        quotationsData.data?.data.filter(
          (q) => q.commandRequestId === commandId && q.id !== quotation?.id,
        ) ?? [];
      const validated = new Set(
        (quotationsData.data?.data ?? [])
          .filter((q) => q.id !== quotation?.id)
          .flatMap((q) => q.element || [])
          .filter((el) => el.status === "SELECTED")
          .map((el) => el.requestModelId),
      );
      return getCommandBesoins(commandId).filter(
        (n) => !validated.has(n.id) && !isBesoinFullyDiscarded(n.id, others),
      );
    },
    [getCommandBesoins, quotationsData.data, quotation?.id],
  );

  /** Réinitialiser le formulaire quand `quotation` change */
  useEffect(() => {
    if (quotation) {
      form.reset(defaultValues);
      const commandId = defaultValues.commandRequestId;
      if (commandId && cmdRqstData.data) {
        setSelectedNeeds(getCommandBesoins(commandId));
      }
      setPreviousCommandId(commandId);
    }
  }, [quotation, defaultValues, cmdRqstData.data, form, getCommandBesoins]);

  /** Mettre à jour les besoins sélectionnés quand la demande change */
  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedCommandId = form.watch("commandRequestId");

  useEffect(() => {
    if (watchedCommandId !== previousCommandId) {
      if (watchedCommandId && cmdRqstData.data) {
        setSelectedNeeds(getCommandBesoins(watchedCommandId));
      } else {
        setSelectedNeeds([]);
      }

      // Réinitialisation lors du changement de demande
      if (
        previousCommandId !== undefined &&
        watchedCommandId !== previousCommandId
      ) {
        // Réinitialiser le fournisseur
        form.setValue("providerId", undefined as any);
      }

      // Nouvelle demande : une ligne préparée par besoin encore à chiffrer.
      if (!quotation) {
        form.setValue(
          "elements",
          watchedCommandId && cmdRqstData.data
            ? getEligibleNeeds(watchedCommandId).map((n) => ({
                needId: n.id,
                designation: n.label,
                quantity: n.quantity,
                unit: n.unit || "piece",
                price: 0,
                hasIs: false,
                reduction: 0,
                tva: DEFAULT_TVA,
              }))
            : [],
          { shouldValidate: true },
        );
      }

      setPreviousCommandId(watchedCommandId);
    }
  }, [
    watchedCommandId,
    previousCommandId,
    cmdRqstData.data,
    form,
    getCommandBesoins,
    getEligibleNeeds,
    quotation,
  ]);

  /** Besoins entièrement annulés de la demande sélectionnée (à désactiver dans la liste) */
  const discardedNeedIds = useMemo(() => {
    const commandId = watchedCommandId ?? defaultValues.commandRequestId;
    if (!commandId) return new Set<number>();

    const relevantQuotations =
      quotationsData.data?.data.filter(
        (q) => q.commandRequestId === commandId && q.id !== quotation?.id,
      ) ?? []; // ← Exclure le devis actuel

    const ids = new Set<number>();
    for (const besoin of selectedNeeds) {
      if (isBesoinFullyDiscarded(besoin.id, relevantQuotations)) {
        ids.add(besoin.id);
      }
    }
    return ids;
  }, [
    selectedNeeds,
    watchedCommandId,
    defaultValues.commandRequestId,
    quotationsData.data,
    quotation?.id,
  ]);

  /** Besoins proposés dans les lignes (hors ceux déjà retenus ailleurs) */
  const lineNeeds = useMemo(() => {
    const validated = new Set(
      (quotationsData.data?.data ?? [])
        .filter((q) => q.id !== quotation?.id)
        .flatMap((q) => q.element || [])
        .filter((el) => el.status === "SELECTED")
        .map((el) => el.requestModelId),
    );
    return selectedNeeds.filter((n) => !validated.has(n.id));
  }, [selectedNeeds, quotationsData.data, quotation?.id]);

  /** Fonction pour normaliser le texte (recherche) */
  const normalizeText = useCallback(
    (value: string) =>
      value
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase(),
    [],
  );

  /** Fournisseurs filtrés */
  const filteredProviders = useMemo(
    () =>
      providersData.data?.data.filter((provider) =>
        normalizeText(provider.name).includes(normalizeText(search)),
      ) ?? [],
    [providersData.data?.data, search, normalizeText],
  );

  /** Vérifier si un fournisseur est déjà utilisé pour cette demande */
  const isProviderUsed = useCallback(
    (providerId: number) => {
      const currentCommandId = form.getValues("commandRequestId");
      return quotationsData.data?.data
        .filter((x) => x.commandRequestId === currentCommandId)
        .some((u) => u.providerId === providerId && u.id !== quotation?.id); // ← Exclure le devis actuel
    },
    [form, quotationsData.data, quotation?.id],
  );

  /** Vérifier si une demande de cotation a encore des besoins disponibles */
  const hasAvailableNeeds = useCallback(
    (requestId: number) => {
      const request = cmdRqstData.data?.data.find((r) => r.id === requestId);
      if (!request) return false;

      const relevantQuotations =
        quotationsData.data?.data.filter(
          (q) => q.commandRequestId === requestId && q.id !== quotation?.id,
        ) ?? []; // ← Exclure le devis actuel

      // Si tous les besoins de la demande sont annulés, plus rien à coter.
      if (
        request.besoins.length > 0 &&
        request.besoins.every((b) =>
          isBesoinFullyDiscarded(b.id, relevantQuotations),
        )
      ) {
        return false;
      }

      const allBesoinIds = request.besoins.map((b) => b.id);
      const validatedBesoinIds = relevantQuotations
        .flatMap((q) => q.element || [])
        .filter((el) => el.status === "SELECTED")
        .map((el) => el.requestModelId);

      return !allBesoinIds.every((id) => validatedBesoinIds.includes(id));
    },
    [cmdRqstData.data, quotationsData.data, quotation?.id],
  );

  /** Lignes : modification, ajout, retrait */
  const elements = form.watch("elements");
  const providerId = form.watch("providerId");

  const lineErrors = form.formState.errors.elements;
  const invalid = (index: number, key: keyof ElementValues) =>
    Array.isArray(lineErrors) ? !!lineErrors[index]?.[key] : false;

  const updateElement = (index: number, patch: Partial<ElementValues>) => {
    form.setValue(
      "elements",
      elements.map((el, i) => (i === index ? { ...el, ...patch } : el)),
      { shouldValidate: true, shouldDirty: true },
    );
  };
  const removeElement = (index: number) => {
    form.setValue(
      "elements",
      elements.filter((_, i) => i !== index),
      { shouldValidate: true, shouldDirty: true },
    );
  };
  const addElement = () => {
    form.setValue(
      "elements",
      [
        ...elements,
        {
          needId: undefined as unknown as number,
          designation: "",
          quantity: 1,
          unit: "piece",
          price: 0,
          hasIs: false,
          reduction: 0,
          tva: DEFAULT_TVA,
        },
      ],
      { shouldValidate: true, shouldDirty: true },
    );
  };

  /** Taux d'IS/IR : 2,2 % pour un fournisseur au réel, 5,5 % sinon. */
  const provider = providersData.data?.data.find((p) => p.id === providerId);
  const isIrRate = provider ? (provider.regem === "Réel" ? 2.2 : 5.5) : 5.5;

  const lineHt = (el: ElementValues) => {
    const base = (el.quantity || 0) * (el.price || 0);
    return base - (base * (el.reduction || 0)) / 100;
  };
  const totals = elements.reduce(
    (acc, el) => {
      const base = (el.quantity || 0) * (el.price || 0);
      const reduction = (base * (el.reduction || 0)) / 100;
      const ht = base - reduction;
      return {
        brut: acc.brut + base,
        reductions: acc.reductions + reduction,
        tva: acc.tva + (ht * (el.tva || 0)) / 100,
        isIr: acc.isIr + (el.hasIs ? (ht * isIrRate) / 100 : 0),
      };
    },
    { brut: 0, reductions: 0, tva: 0, isIr: 0 },
  );
  const totalHt = totals.brut - totals.reductions;
  const net = totalHt + totals.tva - totals.isIr;
  const priced = totals.brut > 0;
  const money = (value: number) => (priced ? formatNumber(value) : "—");

  /** Soumission du formulaire */
  function onSubmit(values: FormValues) {
    // Validation supplémentaire
    if (!values.elements || values.elements.length === 0) {
      toast.error("Veuillez ajouter au moins un élément au devis");
      return;
    }
    mutate({ values, id: quotation?.id });
  }

  // États de chargement
  if (
    cmdRqstData.isLoading ||
    providersData.isLoading ||
    quotationsData.isLoading
  ) {
    return <LoadingPage />;
  }

  // Gestion des erreurs
  if (cmdRqstData.isError || providersData.isError || quotationsData.isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-destructive">
          Erreur lors du chargement des données
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            cmdRqstData.refetch();
            providersData.refetch();
            quotationsData.refetch();
          }}
        >
          Réessayer
        </Button>
      </div>
    );
  }

  if (cmdRqstData.isSuccess && quotationsData.isSuccess)
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-5 @min-[1024px]:flex-row">
            {/* Document du devis */}
            <Card
              title="Document du devis"
              className="@min-[1024px]:w-[480px] @min-[1024px]:shrink-0"
            >
              <FormField
                control={form.control}
                name="proof"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FilesUpload
                        value={field.value}
                        onChange={field.onChange}
                        name={field.name}
                        acceptTypes="all"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple={false}
                        maxFiles={1}
                        maxSizeMB={10}
                        title="Déposez le devis du fournisseur"
                        hint="PDF, JPG ou PNG · 10 Mo maximum"
                        browseLabel="Choisir un fichier"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            {/* Informations du devis */}
            <Card title="Informations du devis" className="flex-1">
              <div className="grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2">
                {/* Demande de cotation */}
                <FormField
                  control={form.control}
                  name="commandRequestId"
                  render={({ field }) => (
                    <FormItem className="@min-[640px]:col-span-2">
                      <FormLabel isRequired>Demande de cotation</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          width="w-full"
                          allLabel=""
                          options={
                            cmdRqstData.data?.data
                              .filter(
                                (request) =>
                                  hasAvailableNeeds(request.id) ||
                                  request.id === quotation?.commandRequestId,
                              )
                              .map((request) => ({
                                label: `${request.title} - ${request.reference}`,
                                value: request.id.toString(),
                              })) ?? []
                          }
                          value={field.value?.toString() || ""}
                          onChange={(value) => {
                            field.onChange(parseInt(value));
                          }}
                          placeholder="Sélectionner"
                          disabled={!!quotation} // ← Désactiver en mode édition
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fournisseur */}
                <FormField
                  control={form.control}
                  name="providerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel isRequired>Fournisseur</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value ? String(field.value) : undefined}
                          onValueChange={(v) => field.onChange(Number(v))}
                          open={openS}
                          onOpenChange={(open) => {
                            setOpenS(open);
                            if (!open) setSearch("");
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choisir un fournisseur…" />
                          </SelectTrigger>

                          <SelectContent className="max-h-[500px] p-0">
                            {/* Champ de recherche */}
                            <div className="p-2 border-b">
                              <Input
                                placeholder="Rechercher un fournisseur..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                                className="h-9"
                              />
                            </div>

                            {/* Liste scrollable */}
                            <div className="max-h-[380px] overflow-y-auto">
                              {filteredProviders.length === 0 ? (
                                <div className="p-3 text-sm text-muted-foreground text-center">
                                  Aucun fournisseur trouvé
                                </div>
                              ) : (
                                filteredProviders.map((p) => (
                                  <SelectItem
                                    key={p.id}
                                    value={String(p.id)}
                                    disabled={
                                      !!watchedCommandId && isProviderUsed(p.id)
                                    }
                                  >
                                    {p.name}
                                  </SelectItem>
                                ))
                              )}
                            </div>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setOpenP(true)}
                        className="flex w-fit cursor-pointer items-center gap-1.5 rounded-xs text-caption text-text-link outline-none hover:underline focus-visible:shadow-focus-ring"
                      >
                        <PlusIcon aria-hidden className="size-3.5" />
                        {"Créer un fournisseur"}
                      </button>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Délai de livraison */}
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel isRequired>Délai de livraison</FormLabel>
                      <FormControl>
                        <div className="relative flex gap-2">
                          <Input
                            id={field.name}
                            value={field.value}
                            placeholder="Sélectionner une date"
                            className="pr-10"
                            onChange={(e) => {
                              field.onChange(e.target.value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "ArrowDown") {
                                e.preventDefault();
                                setDueDate(true);
                              }
                            }}
                          />
                          <Popover open={dueDate} onOpenChange={setDueDate}>
                            <PopoverTrigger asChild>
                              <Button
                                id="date-picker"
                                type="button"
                                variant="ghost"
                                className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                              >
                                <CalendarIcon className="size-3.5" />
                                <span className="sr-only">
                                  Sélectionner une date
                                </span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto overflow-hidden p-0"
                              align="end"
                              alignOffset={-8}
                              sideOffset={10}
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
                                }
                                captionLayout="dropdown"
                                onSelect={(date) => {
                                  if (!date) return;
                                  const value = format(date, "yyyy-MM-dd");
                                  field.onChange(value);
                                  setDueDate(false);
                                }}
                                disabled={(date) => date < new Date()}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>
          </div>

          {/* Lignes du devis */}
          <Card
            title={`Lignes du devis · ${elements.length}`}
            description="Lignes préparées à partir des besoins de la demande : saisissez les prix, ou déposez le devis pour les remplir."
          >
            <div className="overflow-x-auto">
              <div className="flex min-w-[1040px] flex-col gap-3">
                <div
                  className={cn(
                    GRID,
                    "rounded-lg bg-surface-muted px-3 py-2.5 text-caption text-text-tertiary",
                  )}
                >
                  <span>Besoin</span>
                  <span>Article</span>
                  <span>Quantité</span>
                  <span>Unité</span>
                  <span className="text-right">Prix unitaire HT</span>
                  <span>Réduction</span>
                  <span>TVA</span>
                  <span>IS/IR</span>
                  <span className="text-right">Total HT</span>
                  <span />
                </div>

                {elements.length === 0 && (
                  <p className="px-3 py-4 text-center text-body text-text-tertiary">
                    {watchedCommandId
                      ? "Aucune ligne. Ajoutez-en une pour chiffrer un besoin."
                      : "Sélectionnez une demande de cotation pour préparer les lignes."}
                  </p>
                )}

                {elements.map((el, index) => {
                  const need = selectedNeeds.find((n) => n.id === el.needId);
                  const unitKnown = units.some((u) => u.value === el.unit);
                  const tvaRates = TVA_RATES.includes(el.tva)
                    ? TVA_RATES
                    : [...TVA_RATES, el.tva];
                  return (
                    <div
                      key={index}
                      className={cn(GRID, "border-t border-border-default px-3 pt-2.5")}
                    >
                      <Select
                        value={el.needId ? String(el.needId) : ""}
                        onValueChange={(v) => {
                          const picked = selectedNeeds.find(
                            (n) => n.id === Number(v),
                          );
                          // Ligne encore vide : on la renseigne depuis le besoin.
                          updateElement(
                            index,
                            el.designation.trim() === "" && picked
                              ? {
                                  needId: picked.id,
                                  designation: picked.label,
                                  quantity: picked.quantity,
                                  unit: picked.unit || el.unit,
                                }
                              : { needId: Number(v) },
                          );
                        }}
                      >
                        <SelectTrigger
                          size="sm"
                          aria-label="Besoin"
                          aria-invalid={invalid(index, "needId")}
                          className={cn(fieldClass, "w-full")}
                        >
                          <SelectValue placeholder="Besoin" />
                        </SelectTrigger>
                        <SelectContent className="max-w-sm min-w-64">
                          {lineNeeds.map((n) => (
                            <SelectItem
                              key={n.id}
                              value={String(n.id)}
                              disabled={discardedNeedIds.has(n.id)}
                              hint={
                                discardedNeedIds.has(n.id)
                                  ? `${n.ref} · annulé`
                                  : n.ref
                              }
                            >
                              {n.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        aria-label="Article"
                        aria-invalid={invalid(index, "designation")}
                        value={el.designation}
                        placeholder="Libellé du produit"
                        className={fieldClass}
                        onChange={(e) =>
                          updateElement(index, { designation: e.target.value })
                        }
                      />

                      <div className="flex flex-col gap-1">
                        <Input
                          aria-label="Quantité"
                          aria-invalid={invalid(index, "quantity")}
                          type="number"
                          min="0.01"
                          step="any"
                          value={el.quantity ?? ""}
                          className={cn(fieldClass, "text-right")}
                          onChange={(e) =>
                            updateElement(index, {
                              quantity:
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value),
                            })
                          }
                        />
                        {need && (
                          <span className="text-caption text-text-tertiary">
                            {`Demandé : ${need.quantity}`}
                          </span>
                        )}
                      </div>

                      <Select
                        value={el.unit}
                        onValueChange={(v) => updateElement(index, { unit: v })}
                      >
                        <SelectTrigger
                          size="sm"
                          aria-label="Unité"
                          className={cn(fieldClass, "w-full")}
                        >
                          <SelectValue placeholder="Unité" />
                        </SelectTrigger>
                        <SelectContent>
                          {!unitKnown && el.unit && (
                            <SelectItem value={el.unit}>{el.unit}</SelectItem>
                          )}
                          {units.map((u) => (
                            <SelectItem key={u.value} value={u.value}>
                              {u.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        aria-label="Prix unitaire HT"
                        aria-invalid={invalid(index, "price")}
                        type="number"
                        min="0"
                        value={el.price ?? ""}
                        className={cn(fieldClass, "text-right")}
                        onChange={(e) =>
                          updateElement(index, {
                            price:
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value),
                          })
                        }
                      />

                      <div className="relative">
                        <Input
                          aria-label="Réduction (%)"
                          type="number"
                          min="0"
                          value={el.reduction ?? ""}
                          className={cn(fieldClass, "pr-7 text-right")}
                          onChange={(e) =>
                            updateElement(index, {
                              reduction:
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value),
                            })
                          }
                        />
                        <span
                          aria-hidden
                          className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-body text-text-tertiary"
                        >
                          %
                        </span>
                      </div>

                      <Select
                        value={String(el.tva)}
                        onValueChange={(v) => updateElement(index, { tva: Number(v) })}
                      >
                        <SelectTrigger
                          size="sm"
                          aria-label="TVA"
                          className={cn(fieldClass, "w-full")}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tvaRates.map((t) => (
                            <SelectItem key={t} value={String(t)}>
                              {rate(t)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={el.hasIs ? "yes" : "no"}
                        onValueChange={(v) =>
                          updateElement(index, { hasIs: v === "yes" })
                        }
                      >
                        <SelectTrigger
                          size="sm"
                          aria-label="IS/IR"
                          className={cn(fieldClass, "w-full")}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">Non</SelectItem>
                          <SelectItem value="yes">{rate(isIrRate)}</SelectItem>
                        </SelectContent>
                      </Select>

                      <span className="pt-1.5 text-right text-body-medium whitespace-nowrap text-text-primary">
                        {el.price > 0 ? formatNumber(lineHt(el)) : "—"}
                      </span>

                      <button
                        type="button"
                        aria-label="Retirer la ligne"
                        onClick={() => removeElement(index)}
                        className="mt-2 flex size-4 cursor-pointer items-center justify-center rounded-xs text-text-tertiary outline-none hover:text-status-danger-fg focus-visible:shadow-focus-ring"
                      >
                        <XIcon aria-hidden className="size-4" />
                      </button>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={addElement}
                  disabled={selectedNeeds.length === 0}
                  className="flex w-fit cursor-pointer items-center gap-1.5 rounded-xs px-3 pt-1 text-body-medium text-text-link outline-none hover:underline focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:text-text-disabled disabled:no-underline"
                >
                  <PlusIcon aria-hidden className="size-4" />
                  {"Ajouter une ligne"}
                </button>
              </div>
            </div>
            {form.formState.errors.elements?.message && (
              <p className="text-caption text-status-danger-fg">
                {form.formState.errors.elements.message}
              </p>
            )}
          </Card>

          {/* Bas de page : calcul et totaux */}
          <div className="flex flex-col gap-5 @min-[1024px]:flex-row @min-[1024px]:items-start">
            <div className="flex flex-1 flex-col gap-2 rounded-[10px] bg-surface-muted px-4 py-3.5 text-caption">
              <p className="text-label text-text-primary">{"Calcul"}</p>
              <p className="text-text-secondary">
                {"Total HT de la ligne = quantité × prix unitaire HT − réduction."}
              </p>
              <p className="text-text-secondary">
                {
                  "TVA : taux de la ligne (19,25 % par défaut), ajoutée au total HT."
                }
              </p>
              <p className="text-text-secondary">
                {
                  "IS/IR : précompte retenu à la source sur le HT, déduit du net à payer au fournisseur."
                }
              </p>
            </div>
            <section className="flex w-full flex-col gap-1.5 rounded-xl border border-border-default bg-surface px-6 py-5 @min-[1024px]:w-[460px]">
              <TotalRow label="Total brut HT" value={money(totals.brut)} />
              <TotalRow label="Réductions" value={money(totals.reductions)} />
              <TotalRow label="Total HT" value={money(totalHt)} />
              <TotalRow label="TVA" value={money(totals.tva)} />
              <TotalRow
                label={`IS/IR (${rate(isIrRate)})`}
                value={money(totals.isIr)}
              />
              <div className="flex items-start border-t border-border-default pt-2.5 pb-1">
                <span className="flex-1 text-body-medium text-text-primary">
                  {"Net à payer"}
                </span>
                <span className="text-title whitespace-nowrap text-brand">
                  {`${priced ? formatNumber(net) : 0} XAF`}
                </span>
              </div>
            </section>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-wrap justify-end gap-2.5 pt-1">
            <Button
              type="submit"
              disabled={isPending || !form.formState.isValid}
              isLoading={isPending}
              variant="primary"
              onClick={() => (intentRef.current = "save")}
            >
              {quotation ? "Modifier le devis" : "Enregistrer le devis"}
            </Button>
            {!quotation && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  intentRef.current = "saveAndCreate";
                  form.handleSubmit(onSubmit)();
                }}
                disabled={isPending || !form.formState.isValid}
              >
                Enregistrer et créer un autre
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Annuler
            </Button>
          </div>
        </form>
        <ProviderDialog open={openP} onOpenChange={setOpenP} />
      </Form>
    );
}

export default CreateQuotation;
