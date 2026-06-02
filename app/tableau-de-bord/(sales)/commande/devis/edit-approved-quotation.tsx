"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { queryKeys } from "@/lib/query-keys";
import { XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { modificationQ } from "@/queries/modification";
import { providerQ } from "@/queries/providers";
import { Provider, Quotation, RequestModelT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, FolderX, InfoIcon, Plus, X } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import AddElement from "./creer/addElement";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  quotation: Quotation;
}

const formSchema = z.object({
  action: z.enum(["CANCEL", "UPDATE"], {
    message: "Veuillez sélectionné une action",
  }),
  description: z
    .string()
    .min(5, { message: "Veuillez renseigner une description" }),
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

function EditApprovedQuotation({ open, openChange, quotation }: Props) {
  const [openAddElement, setOpenAddElement] = React.useState(false);
  const [selectedNeeds, setSelectedNeeds] = React.useState<
    Array<RequestModelT>
  >([]);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [editingElement, setEditingElement] = React.useState<any>(null);
  const [dueDateOpen, setDueDateOpen] = React.useState(false);

  const { user } = useStore();

  const getProviders = useQuery({
    queryKey: queryKeys.providers,
    queryFn: providerQ.getAll,
  });

  const providers = React.useMemo(() => {
    if (!getProviders.data) return [];
    return getProviders.data.data;
  }, [getProviders.data]);

  const defaultValues = React.useMemo<FormValues>(
    () => ({
      action: "UPDATE",
      description: "",
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleEditElement = React.useCallback(
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

  const handleDeleteElement = React.useCallback(
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

  const handleElementsChange = React.useCallback(
    (newElements: any[]) => {
      form.setValue("elements", newElements, { shouldValidate: true });
      setEditingIndex(null);
      setEditingElement(null);
      setOpenAddElement(false);
    },
    [form],
  );

  const submitModification = useMutation({
    mutationFn: (data: FormValues) => {
      const { action, description, ...rest } = data;
      if (data.action === "UPDATE") {
        return modificationQ.create({
          action,
          description,
          changes: {
            providerId: rest.providerId,
            dueDate: rest.dueDate,
            element: rest.elements,
          },
          devisId: quotation.id,
        });
      }
      return modificationQ.create({
        action,
        description,
        devisId: quotation.id,
        changes: {
          status: "CANCELLED",
        },
      });
    },
    onSuccess: () => {
      openChange(false);
      toast.success("Demande de modification soumise avec succès !");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: FormValues) => {
    submitModification.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"secondary"}>
          <DialogTitle>
            {quotation.commandRequest.title ?? "Modification du Devis"}
          </DialogTitle>
          <DialogDescription>
            {"Demande de modification de devis"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5 p-3 rounded bg-blue-100">
          <InfoIcon size={20} className="text-blue-600" />
          <p className="text-sm">
            {
              "Notez que ces modifications seront prises en compte uniquement après validation par un administrateur"
            }
          </p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 @min-[540px]/dialog:grid-cols-2 gap-3"
          >
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Type de modification"}</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={"Sélectionnez un type"} />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          { value: "CANCEL", label: "Annulation" },
                          { value: "UPDATE", label: "Modification" },
                        ].map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel isRequired>{"Description"}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Décrivez le motif de votre modification"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("action") === "UPDATE" && (
              <>
                <FormField
                  control={form.control}
                  name="providerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel isRequired>{"Fournisseur"}</FormLabel>
                      <FormControl>
                        <Combobox
                          items={providers}
                          value={
                            providers.find(
                              (provider) => provider.id === field.value,
                            ) ?? null
                          }
                          onValueChange={(v) => {
                            field.onChange(v?.id ?? "");
                          }}
                          itemToStringLabel={(v) => v.name}
                        >
                          <ComboboxInput placeholder="Sélectionner" />
                          <ComboboxContent>
                            <ComboboxEmpty>
                              {"Aucun fournisseur enregistré"}
                            </ComboboxEmpty>
                            <ComboboxList>
                              {(item: Provider) => (
                                <ComboboxItem key={item.id} value={item}>
                                  {item.name}
                                </ComboboxItem>
                              )}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
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
                    <FormItem>
                      <FormLabel isRequired>
                        {"Date limite de livraison"}
                      </FormLabel>
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
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
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
                                              handleEditElement(
                                                item.globalIndex,
                                              )
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
                              needs={selectedNeeds.filter(
                                (n) => n.isUsed !== true,
                              )}
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
              </>
            )}
            <DialogFooter className="col-span-full">
              <Button
                type="submit"
                isLoading={submitModification.isPending}
                disabled={
                  submitModification.isPending || form.formState.isLoading
                }
              >
                {"Soumettre"}
              </Button>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitModification.isPending}
                >
                  {"Annuler"}
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default EditApprovedQuotation;
