"use client";
import LoadingPage from "@/components/loading-page";
import { ProviderDialog } from "@/components/modals/ProviderDialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
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
import { queryKeys } from "@/lib/query-keys";
import { XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { providerQ } from "@/queries/providers";
import { quotationQ } from "@/queries/quotation";
import { Quotation } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { SelectValue } from "@radix-ui/react-select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, FolderX, Plus, X } from "lucide-react";
import React, { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import AddElement from "./creer/addElement";

// ─── Schema (no proof) ───────────────────────────────────────────────────────

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
});

type FormValues = z.infer<typeof formSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  quotation: Quotation;
}

// ─── Component ────────────────────────────────────────────────────────────────

function EditQuotation({ open, openChange, quotation }: Props) {
  const [openAddElement, setOpenAddElement] = React.useState(false);
  const [openProviderDialog, setOpenProviderDialog] = React.useState(false);
  const [openProviderSelect, setOpenProviderSelect] = React.useState(false);

  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [editingElement, setEditingElement] = React.useState<any>(null);
  const [search, setSearch] = React.useState("");
  const [dueDateOpen, setDueDateOpen] = React.useState(false);

  const { user } = useStore();

  // ── Queries ─────────────────────────────────────────────────────────────────

  const commandRequestData = useQuery({
    queryKey: queryKeys.quotationRequest(quotation.commandRequestId),
    queryFn: async () => commandRqstQ.getOne(quotation.commandRequestId),
  });

  const selectedNeeds = React.useMemo(() => {
    return commandRequestData.data?.data.besoins ?? [];
  }, [commandRequestData.data]);

  const quotationsData = useQuery({
    queryKey: queryKeys.quotations,
    queryFn: quotationQ.getAll,
  });

  const providersData = useQuery({
    queryKey: queryKeys.providers,
    queryFn: providerQ.getAll,
  });

  // ── Default values ──────────────────────────────────────────────────────────

  const defaultValues = useMemo<FormValues>(
    () => ({
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
    }),
    [quotation],
  );

  // ── Form ────────────────────────────────────────────────────────────────────

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  // Reset when the dialog opens with a new/updated quotation
  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  // ── Mutation ────────────────────────────────────────────────────────────────

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      quotationQ.update(quotation.id, {
        devis: {
          commandRequestId: values.commandRequestId,
          providerId: values.providerId,
          dueDate: new Date(values.dueDate).toISOString(),
          userId: user?.id ?? 0,
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
      }),
    onSuccess: () => {
      toast.success("Votre devis a été modifié avec succès");
      openChange(false);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error("Une erreur est survenue lors de la modification du devis.");
    },
  });

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const normalizeText = useCallback(
    (value: string) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase(),
    [],
  );

  const filteredProviders = useMemo(
    () =>
      providersData.data?.data.filter((provider) =>
        normalizeText(provider.name).includes(normalizeText(search)),
      ) ?? [],
    [providersData.data?.data, search, normalizeText],
  );

  const isProviderUsed = useCallback(
    (providerId: number) => {
      const currentCommandId = form.getValues("commandRequestId");
      return quotationsData.data?.data
        .filter((x) => x.commandRequestId === currentCommandId)
        .some((u) => u.providerId === providerId && u.id !== quotation.id);
    },
    [form, quotationsData.data, quotation.id],
  );

  const handleEditElement = useCallback(
    (index: number) => {
      const elements = form.getValues("elements");
      if (index >= 0 && index < elements.length) {
        setEditingElement(elements[index]);
        setEditingIndex(index);
        setOpenAddElement(true);
      }
    },
    [form],
  );

  const handleDeleteElement = useCallback(
    (index: number) => {
      const current = form.getValues("elements");
      const next = [...current];
      next.splice(index, 1);
      form.setValue("elements", next, { shouldValidate: true });
      if (editingIndex === index) {
        setEditingIndex(null);
        setEditingElement(null);
      } else if (editingIndex !== null && editingIndex > index) {
        setEditingIndex(editingIndex - 1);
      }
    },
    [form, editingIndex],
  );

  const handleElementsChange = useCallback(
    (newElements: any[]) => {
      form.setValue("elements", newElements, { shouldValidate: true });
      setEditingIndex(null);
      setEditingElement(null);
      setOpenAddElement(false);
    },
    [form],
  );

  function onSubmit(values: FormValues) {
    if (!values.elements || values.elements.length === 0) {
      toast.error("Veuillez ajouter au moins un élément au devis");
      return;
    }
    mutate(values);
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const providerName = providersData.data?.data.find(
    (p) => p.id === quotation.providerId,
  )?.name;

  const isLoading =
    commandRequestData.isLoading ||
    providersData.isLoading ||
    quotationsData.isLoading;

  const isError =
    commandRequestData.isError ||
    providersData.isError ||
    quotationsData.isError;

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant="secondary">
          <DialogTitle className="uppercase">
            {`Devis - ${providerName ?? ""}`}
          </DialogTitle>
          <DialogDescription className="text-white/80">
            Modifiez les informations du devis
          </DialogDescription>
        </DialogHeader>

        {isLoading && <LoadingPage />}

        {isError && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-destructive">
              Erreur lors du chargement des données
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                commandRequestData.refetch();
                providersData.refetch();
                quotationsData.refetch();
              }}
            >
              Réessayer
            </Button>
          </div>
        )}

        {!isLoading && !isError && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="max-w-3xl grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2"
            >
              {/* Demande de cotation — locked in edit mode */}
              <FormField
                control={form.control}
                name="commandRequestId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>Demande de cotation</FormLabel>
                    <FormControl>
                      <Input
                        value={
                          commandRequestData.data?.data.title ??
                          field.value.toString()
                        }
                        disabled
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
                        open={openProviderSelect}
                        onOpenChange={(o) => {
                          setOpenProviderSelect(o);
                          if (!o) setSearch("");
                        }}
                      >
                        <SelectTrigger className="min-w-60 w-full uppercase">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>

                        <SelectContent className="max-h-[500px] p-0">
                          <div className="p-2 border-b">
                            <Input
                              placeholder="Rechercher un fournisseur..."
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              onKeyDown={(e) => e.stopPropagation()}
                              className="h-9"
                            />
                          </div>

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
                                  disabled={isProviderUsed(provider.id)}
                                >
                                  {provider.name}
                                </SelectItem>
                              ))
                            )}
                          </div>

                          <div
                            className="sticky bottom-0 bg-background border-t p-2"
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              onClick={() => {
                                setOpenProviderSelect(false);
                                setOpenProviderDialog(true);
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

              {/* Date limite */}
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
                          onChange={(e) => field.onChange(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              setDueDateOpen(true);
                            }
                          }}
                        />
                        <Popover
                          open={dueDateOpen}
                          onOpenChange={setDueDateOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              id="date-picker"
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
                                field.value ? new Date(field.value) : undefined
                              }
                              captionLayout="dropdown"
                              onSelect={(date) => {
                                if (!date) return;
                                field.onChange(format(date, "yyyy-MM-dd"));
                                setDueDateOpen(false);
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
                            const grouped = field.value.reduce(
                              (acc, item, idx) => {
                                const key = item.needId;
                                if (!acc[key]) acc[key] = [];
                                acc[key].push({ ...item, globalIndex: idx });
                                return acc;
                              },
                              {} as Record<
                                number,
                                Array<any & { globalIndex: number }>
                              >,
                            );

                            return Object.entries(grouped).map(
                              ([need, items]) => (
                                <div
                                  key={need}
                                  className="border p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                                >
                                  <h3 className="font-semibold mb-2">
                                    {
                                      selectedNeeds.find(
                                        (n) => n.id === Number(need),
                                      )?.label
                                    }
                                  </h3>
                                  <div className="flex flex-wrap gap-2">
                                    {items.map((item) => (
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
                                            {`${item.designation} - ${item.quantity} ${item.unit} - ${XAF.format(item.price)}`}
                                          </span>
                                          <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                                            Modifier
                                          </span>
                                        </button>
                                        <X
                                          size={20}
                                          className="text-destructive cursor-pointer hover:text-destructive/80 transition-colors"
                                          onClick={() =>
                                            handleDeleteElement(
                                              item.globalIndex,
                                            )
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
                          onClick={() => {
                            setEditingElement(null);
                            setEditingIndex(null);
                            setOpenAddElement(true);
                          }}
                          disabled={
                            !selectedNeeds || selectedNeeds.length === 0
                          }
                        >
                          Ajouter un élément
                          <Plus className="w-4 h-4" />
                        </Button>

                        {selectedNeeds.length > 0 && (
                          <AddElement
                            open={openAddElement}
                            openChange={(state) => {
                              if (!state) {
                                setEditingIndex(null);
                                setEditingElement(null);
                              }
                              setOpenAddElement(state);
                            }}
                            needs={selectedNeeds.filter((n) => {
                              const validatedIds =
                                quotationsData.data?.data
                                  .filter((q) => q.id !== quotation.id)
                                  .flatMap((q) => q.element ?? [])
                                  .filter((el) => el.status === "SELECTED")
                                  .map((el) => el.requestModelId) ?? [];
                              return !validatedIds.includes(n.id);
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

              {/* Actions */}
              <div className="flex justify-end col-span-2 w-full gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openChange(false)}
                  disabled={isPending}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !form.formState.isValid}
                  isLoading={isPending}
                  className="w-fit"
                  variant="primary"
                >
                  Modifier le devis
                </Button>
              </div>
            </form>
            <ProviderDialog
              open={openProviderDialog}
              onOpenChange={setOpenProviderDialog}
            />
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default EditQuotation;
