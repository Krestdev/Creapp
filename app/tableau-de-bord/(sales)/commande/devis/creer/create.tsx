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
import { useRouter } from "next/navigation";
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
      }),
    )
    .min(1),
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
  const router = useRouter();
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
  const { user } = useStore();

  /**Demandes de cotation */
  const cmdRqstData = useQuery({
    queryKey: ["commands"],
    queryFn: commandRqstQ.getAll,
  });

  /**Devis */
  const quotationsData = useQuery({
    queryKey: ["quotations"],
    queryFn: quotationQ.getAll,
  });

  /**Fournisseurs */
  const providersData = useQuery({
    queryKey: ["providers"],
    queryFn: providerQ.getAll,
  });

  /**Data states */
  const [dueDate, setDueDate] = React.useState<boolean>(false);

  // Utiliser useMemo pour les valeurs par défaut stables
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
          price: c.priceProposed,
          quantity: c.quantity,
          unit: c.unit,
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
  }, [quotation]); // Seulement quotation comme dépendance

  /**Quotation */
  const { mutate, isPending } = useMutation({
    mutationFn: async ({ values, id }: { values: FormValues; id?: number }) => {
      const payload = {
        devis: {
          commandRequestId: values.commandRequestId,
          providerId: values.providerId,
          proof: values.proof[0],
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
        })),
      };

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
      } else {
        // Réinitialisation complète pour un nouvel ajout
        form.reset(defaultValues);
        intentRef.current = "save";
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error("Une erreur est survenue lors de la création du devis.");
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  // Réinitialiser le formulaire quand `quotation` change
  useEffect(() => {
    if (quotation) {
      form.reset(defaultValues);
      const commandId = form.getValues("commandRequestId");
      if (commandId && cmdRqstData.data) {
        const command = cmdRqstData.data.data.find((c) => c.id === commandId);
        setSelectedNeeds(command?.besoins || []);
      }
      setPreviousCommandId(commandId);
    }
  }, [quotation, defaultValues, cmdRqstData.data, form]);

  // Mettre à jour les besoins sélectionnés quand la demande change
  useEffect(() => {
    const currentCommandId = form.getValues("commandRequestId");

    // Vérifier si la commande a réellement changé
    if (currentCommandId !== previousCommandId) {
      if (currentCommandId && cmdRqstData.data) {
        const command = cmdRqstData.data.data.find(
          (c) => c.id === currentCommandId,
        );
        setSelectedNeeds(command?.besoins || []);
      } else {
        setSelectedNeeds([]);
      }

      // Réinitialiser seulement si c'est une nouvelle sélection
      if (
        previousCommandId !== undefined &&
        currentCommandId !== previousCommandId
      ) {
        // Réinitialiser le fournisseur
        if (form.getValues("providerId") !== undefined) {
          form.setValue("providerId", undefined as any);
        }

        // Réinitialiser les éléments seulement s'il y en a
        const currentElements = form.getValues("elements");
        if (currentElements.length > 0) {
          form.setValue("elements", []);
        }

        setSearch("");
        setEditingIndex(null);
        setEditingElement(null);
      }

      setPreviousCommandId(currentCommandId);
    }
  }, [form.watch("commandRequestId")]); // Seulement dépendant de la valeur watchée

  const [search, setSearch] = React.useState("");

  const normalizeText = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filteredProviders =
    providersData.data?.data.filter((provider) =>
      normalizeText(provider.name).includes(normalizeText(search)),
    ) ?? [];

  // Fonction pour gérer l'édition d'un élément
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

  // Fonction pour gérer la suppression d'un élément
  const handleDeleteElement = useCallback(
    (index: number) => {
      const currentElements = form.getValues("elements");
      const newElements = [...currentElements];
      newElements.splice(index, 1);
      form.setValue("elements", newElements);

      // Si on supprime l'élément en cours d'édition
      if (editingIndex === index) {
        setEditingIndex(null);
        setEditingElement(null);
      } else if (editingIndex !== null && editingIndex > index) {
        setEditingIndex(editingIndex - 1);
      }
    },
    [form, editingIndex],
  );

  // Fonction pour gérer la mise à jour des éléments depuis AddElement
  const handleElementsChange = useCallback(
    (newElements: any[]) => {
      form.setValue("elements", newElements);
      setEditingIndex(null);
      setEditingElement(null);
      setOpen(false);
    },
    [form],
  );

  if (
    cmdRqstData.isLoading ||
    providersData.isLoading ||
    quotationsData.isLoading
  ) {
    return <LoadingPage />;
  }

  function onSubmit(values: FormValues) {
    mutate({ values, id: quotation?.id });
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
                <FormLabel isRequired>{"Demande de cotation"}</FormLabel>
                <FormControl>
                  <SearchableSelect
                    width="w-full"
                    allLabel=""
                    options={
                      cmdRqstData.data.data
                        .filter((request) => {
                          // 1. On récupère tous les IDs des besoins rattachés à cette demande de cotation
                          const allBesoinIds = request.besoins.map((b) => b.id);

                          // 2. On récupère les IDs des besoins qui ont déjà été validés (SELECTED) dans des devis existants
                          const validatedBesoinIds = quotationsData.data.data
                            .filter((q) => q.commandRequestId === request.id) // Uniquement les devis de cette demande
                            .flatMap((q) => q.element || []) // On aplatit tous les éléments des devis
                            .filter((el) => el.status === "SELECTED") // Uniquement ceux qui sont validés
                            .map((el) => el.requestModelId); // On récupère l'ID du besoin d'origine

                          // 3. On garde la demande SEULEMENT S'IL RESTE au moins un besoin
                          // qui n'est pas encore présent dans la liste des besoins validés.
                          const isFullyProcessed = allBesoinIds.every((id) =>
                            validatedBesoinIds.includes(id),
                          );

                          return !isFullyProcessed;
                        })
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
                <FormLabel isRequired>{"Fournisseur"}</FormLabel>

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
                            {"Aucun fournisseur trouvé"}
                          </div>
                        ) : (
                          filteredProviders.map((provider) => (
                            <SelectItem
                              key={provider.id}
                              value={String(provider.id)}
                              className="uppercase"
                              disabled={quotationsData.data.data
                                .filter(
                                  (x) =>
                                    x.commandRequestId ===
                                    form.getValues("commandRequestId"),
                                )
                                .some((u) => u.providerId === provider.id)}
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
                          {"Ajouter un fournisseur"}
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
                <FormLabel isRequired>{"Date limite de livraison"}</FormLabel>
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
                          <span className="sr-only">
                            {"Sélectionner une date"}
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
                            field.value ? new Date(field.value) : undefined
                          }
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            if (!date) return;
                            const value = format(date, "yyyy-MM-dd");
                            field.onChange(value);
                            setDueDate(false);
                          }}
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
                <FormLabel isRequired>{"Éléments"}</FormLabel>
                <FormControl>
                  <div className="grid gap-1.5">
                    {field.value.length === 0 ? (
                      <span className="px-4 py-3 w-full text-center text-muted-foreground text-sm flex flex-col gap-2 justify-center items-center">
                        <span className="inline-flex size-10 rounded-full bg-muted text-muted-foreground items-center justify-center">
                          <FolderX />
                        </span>
                        {"Aucun élément renseigné."}
                      </span>
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
                            string,
                            Array<any & { globalIndex: number }>
                          >,
                        );

                        return Object.entries(groupedElements).map(
                          ([need, elements]) => (
                            <div
                              key={need}
                              className="border p-3 rounded-lg bg-gray-50"
                            >
                              <h3 className="font-semibold mb-2">
                                {
                                  selectedNeeds?.find(
                                    (n) => n.id === Number(need),
                                  )?.label
                                }
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {elements.map((item, localIndex) => (
                                  <div
                                    key={item.globalIndex}
                                    className="w-full bg-gray-50 rounded-sm border border-gray-200 px-2 h-9 inline-flex justify-between gap-2 items-center text-sm"
                                  >
                                    <button
                                      type="button"
                                      className="inline-flex items-center gap-1.5 w-full justify-between text-left truncate cursor-pointer"
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
                                      <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-foreground text-primary-foreground">
                                        {"Modifier"}
                                      </span>
                                    </button>
                                    <X
                                      size={20}
                                      className="text-destructive cursor-pointer"
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

                    <button
                      className="add-button inline-flex items-center gap-2 text-sm text-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        setEditingElement(null);
                        setEditingIndex(null);
                        setOpen(true);
                      }}
                      disabled={!selectedNeeds || selectedNeeds.length === 0}
                    >
                      {"Ajouter un élément"}
                      <Plus className="w-4 h-4" />
                    </button>

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
                        needs={selectedNeeds.filter(n=>{
                          const validatedBesoinIds = quotationsData.data.data
                            .flatMap((q) => q.element || []) // On aplatit tous les éléments des devis
                            .filter((el) => el.status === "SELECTED") // Uniquement ceux qui sont validés
                            .map((el) => el.requestModelId); // On récupère l'ID du besoin d'origine
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
                <FormLabel isRequired>{"Justificatif"}</FormLabel>
                <FormControl>
                  <FilesUpload
                    value={field.value}
                    onChange={field.onChange}
                    name={field.name}
                    acceptTypes="images"
                    multiple={false}
                    maxFiles={1}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end col-span-2 w-full gap-2">
            <Button
              type="submit"
              disabled={isPending}
              isLoading={isPending}
              className="w-fit"
              variant={"primary"}
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
