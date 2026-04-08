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
} from "@/components/ui/select";
import { XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { providerQ } from "@/queries/providers";
import { quotationQ } from "@/queries/quotation";
import { Quotation, RequestModelT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectValue } from "@radix-ui/react-select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, FolderX, Plus, X } from "lucide-react";
import React, { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import AddElement from "./addElement";

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
        designation: z.string({
          message: "Veuillez renseigner une désignation",
        }),
        quantity: z.number(),
        unit: z.string(),
        price: z.number({ message: "Veuillez renseigner un prix" }),
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

interface Props {
  quotation?: Quotation;
  openChange?: React.Dispatch<React.SetStateAction<boolean>>;
}

function CreateQuotation({ quotation, openChange }: Props) {
  const intentRef = React.useRef<"save" | "saveAndCreate">("save");
  const [open, setOpen] = React.useState<boolean>(false);
  const [openP, setOpenP] = React.useState<boolean>(false);
  const [openS, setOpenS] = React.useState<boolean>(false);
  const [selectedNeeds, setSelectedNeeds] = React.useState<
    Array<RequestModelT>
  >([]);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [editingElement, setEditingElement] = React.useState<any>(null);
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
      console.log("Quotation data:", quotation); // Pour déboguer

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

      console.log("Payload to send:", payload); 

      if (!id) {
        return quotationQ.create(payload);
      }
      return quotationQ.update(id, payload);
    },
    onSuccess: (_data, variables) => {
      const intent = intentRef.current;
      toast.success(
        variables?.id
          ? "Votre devis a été modifié avec succès"
          : "Votre devis a été créé avec succès",
      );

      if (openChange) {
        openChange(false);
      }

      if (intent === "save" && openChange) {
        openChange(false);
      } else if (intent === "saveAndCreate") {
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
      }
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error(
        "Une erreur est survenue lors de la création/modification du devis.",
      );
    },
  });

  /** Réinitialiser le formulaire quand `quotation` change */
  useEffect(() => {
    if (quotation) {
      form.reset(defaultValues);
      const commandId = defaultValues.commandRequestId;
      if (commandId && cmdRqstData.data) {
        const command = cmdRqstData.data.data.find((c) => c.id === commandId);
        setSelectedNeeds(command?.besoins || []);
      }
      setPreviousCommandId(commandId);
    }
  }, [quotation, defaultValues, cmdRqstData.data, form]);

  /** Mettre à jour les besoins sélectionnés quand la demande change */
  const watchedCommandId = form.watch("commandRequestId");

  useEffect(() => {
    if (watchedCommandId !== previousCommandId) {
      if (watchedCommandId && cmdRqstData.data) {
        const command = cmdRqstData.data.data.find(
          (c) => c.id === watchedCommandId,
        );
        setSelectedNeeds(command?.besoins || []);
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
        // Réinitialiser les éléments
        form.setValue("elements", []);
        setEditingIndex(null);
        setEditingElement(null);
      }

      setPreviousCommandId(watchedCommandId);
    }
  }, [watchedCommandId, previousCommandId, cmdRqstData.data, form]);

  /** Fonction pour normaliser le texte (recherche) */
  const normalizeText = useCallback(
    (value: string) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
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

      const allBesoinIds = request.besoins.map((b) => b.id);
      const validatedBesoinIds =
        quotationsData.data?.data
          .filter(
            (q) => q.commandRequestId === requestId && q.id !== quotation?.id,
          ) // ← Exclure le devis actuel
          .flatMap((q) => q.element || [])
          .filter((el) => el.status === "SELECTED")
          .map((el) => el.requestModelId) || [];

      return !allBesoinIds.every((id) => validatedBesoinIds.includes(id));
    },
    [cmdRqstData.data, quotationsData.data, quotation?.id],
  );

  /** Gérer l'édition d'un élément */
  const handleEditElement = useCallback(
    (index: number) => {
      const elements = form.getValues("elements");
      if (index >= 0 && index < elements.length) {
        setEditingElement(elements[index]);
        setEditingIndex(index);
        setOpen(true);
      }
    },
    [form],
  );

  /** Gérer la suppression d'un élément */
  const handleDeleteElement = useCallback(
    (index: number) => {
      const currentElements = form.getValues("elements");
      const newElements = [...currentElements];
      newElements.splice(index, 1);
      form.setValue("elements", newElements, { shouldValidate: true });

      // Mettre à jour l'index d'édition
      if (editingIndex === index) {
        setEditingIndex(null);
        setEditingElement(null);
      } else if (editingIndex !== null && editingIndex > index) {
        setEditingIndex(editingIndex - 1);
      }
    },
    [form, editingIndex],
  );

  /** Gérer la mise à jour des éléments */
  const handleElementsChange = useCallback(
  (newElements: any[]) => {
    form.setValue("elements", newElements, { shouldValidate: true });
    setEditingIndex(null);
    setEditingElement(null);
    setOpen(false);
  },
  [form],
);

  /** Soumission du formulaire */
  function onSubmit(values: FormValues) {
    // Validation supplémentaire
    if (!values.elements || values.elements.length === 0) {
      toast.error("Veuillez ajouter au moins un élément au devis");
      return;
    }

    console.log("Form values before submit:", values); // Pour déboguer
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
          className="max-w-3xl grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2"
        >
          {/* Demande de cotation */}
          <FormField
            control={form.control}
            name="commandRequestId"
            render={({ field }) => (
              <FormItem>
                <FormLabel isRequired>Demande de cotation</FormLabel>
                <FormControl>
                  <SearchableSelect
                    width="w-full"
                    allLabel=""
                    options={
                      cmdRqstData.data?.data
                        .filter((request) => hasAvailableNeeds(request.id))
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
                    <SelectTrigger className="min-w-60 w-full uppercase">
                      <SelectValue placeholder="Sélectionner" />
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
                          filteredProviders.map((provider) => (
                            <SelectItem
                              key={provider.id}
                              value={String(provider.id)}
                              className="uppercase"
                              disabled={
                                // (!!quotation && field.value !== provider.id) ||
                                (!!watchedCommandId &&
                                  isProviderUsed(provider.id))
                              }
                            >
                              {provider.name}
                            </SelectItem>
                          ))
                        )}
                      </div>

                      {/* Footer */}
                      <div
                        className="sticky bottom-0 bg-background border-t p-2"
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setOpenS(false);
                            setOpenP(true);
                          }}
                        >
                          Ajouter un fournisseur
                        </Button>
                      </div>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date limite de livraison */}
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="@min-[640px]:col-span-2">
                <FormLabel isRequired>Date limite de livraison</FormLabel>
                <FormControl>
                  <div className="relative flex gap-2">
                    <Input
                      id={field.name}
                      value={field.value}
                      placeholder="Sélectionner une date"
                      className="bg-background pr-10"
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
                          variant="ghost"
                          className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                        >
                          <CalendarIcon className="size-3.5" />
                          <span className="sr-only">Sélectionner une date</span>
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
                            field.value ? new Date(field.value) : undefined
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

          {/* Éléments */}
          <FormField
            control={form.control}
            name="elements"
            render={({ field }) => (
              <FormItem className="h-fit @min-[640px]:col-span-2">
                <FormLabel isRequired>Éléments</FormLabel>
                <FormControl>
                  <div className="grid gap-1.5">
                    {field.value.length === 0 ? (
                      <div className="px-4 py-3 w-full text-center text-muted-foreground text-sm flex flex-col gap-2 justify-center items-center">
                        <span className="inline-flex size-10 rounded-full bg-muted text-muted-foreground items-center justify-center">
                          <FolderX className="size-5" />
                        </span>
                        Aucun élément renseigné.
                      </div>
                    ) : (
                      (() => {
                        const groupedElements = field.value.reduce(
                          (acc, item, globalIndex) => {
                            const need = item.needId;
                            if (!acc[need]) {
                              acc[need] = [];
                            }
                            acc[need].push({ ...item, globalIndex });
                            return acc;
                          },
                          {} as Record<
                            number,
                            Array<any & { globalIndex: number }>
                          >,
                        );

                        return Object.entries(groupedElements).map(
                          ([need, elements]) => (
                            <div
                              key={need}
                              className="border p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                            >
                              <h3 className="font-semibold mb-2">
                                {
                                  selectedNeeds?.find(
                                    (n) => n.id === Number(need),
                                  )?.label
                                }
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {elements.map((item) => (
                                  <div
                                    key={item.globalIndex}
                                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 px-2 h-9 inline-flex justify-between gap-2 items-center text-sm"
                                  >
                                    <button
                                      type="button"
                                      className="inline-flex items-center gap-1.5 w-full justify-between text-left truncate cursor-pointer hover:text-primary transition-colors"
                                      onClick={() =>
                                        handleEditElement(item.globalIndex)
                                      }
                                    >
                                      <span className="truncate">
                                        {`${item.designation} - ${
                                          item.quantity
                                        } ${item.unit} - ${XAF.format(
                                          item.price,
                                        )}`}
                                      </span>
                                      <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                                        Modifier
                                      </span>
                                    </button>
                                    <X
                                      size={20}
                                      className="text-destructive cursor-pointer hover:text-destructive/80 transition-colors"
                                      onClick={() =>
                                        handleDeleteElement(item.globalIndex)
                                      }
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ),
                        );
                      })()
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      className="add-button inline-flex items-center gap-2 text-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        setEditingElement(null);
                        setEditingIndex(null);
                        setOpen(true);
                      }}
                      disabled={!selectedNeeds || selectedNeeds.length === 0}
                    >
                      Ajouter un élément
                      <Plus className="w-4 h-4" />
                    </Button>

                    {!!selectedNeeds && selectedNeeds.length > 0 && (
                      <AddElement
                        open={open}
                        openChange={(state) => {
                          if (!state) {
                            setEditingIndex(null);
                            setEditingElement(null);
                          }
                          setOpen(state);
                        }}
                        needs={selectedNeeds.filter((n) => {
                          const validatedBesoinIds =
                            quotationsData.data?.data
                              .filter((q) => q.id !== quotation?.id) // ← Exclure le devis actuel
                              .flatMap((q) => q.element || [])
                              .filter((el) => el.status === "SELECTED")
                              .map((el) => el.requestModelId) || [];
                          return !validatedBesoinIds.includes(n.id);
                        })}
                        value={field.value}
                        onChange={handleElementsChange}
                        element={editingElement}
                        index={editingIndex}
                      />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Justificatif */}
          <FormField
            control={form.control}
            name="proof"
            render={({ field }) => (
              <FormItem className="@min-[640px]:col-span-2">
                <FormLabel isRequired>Justificatif</FormLabel>
                <FormControl>
                  <FilesUpload
                    value={field.value}
                    onChange={field.onChange}
                    name={field.name}
                    acceptTypes="all"
                    multiple={false}
                    maxFiles={1}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Boutons d'action */}
          <div className="flex justify-end col-span-2 w-full gap-2">
            {!quotation && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  intentRef.current = "saveAndCreate";
                  form.handleSubmit(onSubmit)();
                }}
                disabled={isPending}
              >
                Enregistrer et créer un autre
              </Button>
            )}
            <Button
              type="submit"
              disabled={isPending || !form.formState.isValid}
              isLoading={isPending}
              className="w-fit"
              variant="primary"
              onClick={() => (intentRef.current = "save")}
            >
              {quotation ? "Modifier le devis" : "Enregistrer"}
            </Button>
          </div>
        </form>
        <ProviderDialog open={openP} onOpenChange={setOpenP} />
      </Form>
    );
}

export default CreateQuotation;
