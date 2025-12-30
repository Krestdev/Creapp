"use client";
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
import { useFetchQuery } from "@/hooks/useData";
import { useStore } from "@/providers/datastore";
import { CommandRqstQueries } from "@/queries/commandRqstModule";
import { ProviderQueries } from "@/queries/providers";
import { QuotationQueries } from "@/queries/quotation";
import { Quotation, RequestModelT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectValue } from "@radix-ui/react-select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, FolderX, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import AddElement from "./addElement";
import { format } from "date-fns";
import { SearchableSelect } from "@/components/base/searchableSelect";
import { XAF } from "@/lib/utils";

const formSchema = z.object({
  commandRequestId: z.number({ message: "Requis" }),
  providerId: z.number({ message: "Requis" }),
  dueDate: z.string({ message: "Veuillez définir une date" }).refine(
    (val) => {
      const d = new Date(val);
      return !isNaN(d.getTime());
    },
    { message: "Date invalide" }
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
      })
    )
    .min(1),
  proof: z.array(
    z.union([
      z.instanceof(File, { message: "Doit être un fichier valide" }),
      z.string(),
    ])
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  quotation?: Quotation;
  openChange?: React.Dispatch<React.SetStateAction<boolean>>;
}

function CreateQuotation({ quotation, openChange }: Props) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const intentRef = React.useRef<"save" | "saveAndCreate">("save");
  const [open, setOpen] = React.useState<boolean>(false);
  const [openP, setOpenP] = React.useState<boolean>(false);
  const [openS, setOpenS] = React.useState<boolean>(false);
  const [selectedNeeds, setSelectedNeeds] =
    React.useState<Array<RequestModelT>>();
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const { user } = useStore();

  /**Demandes de cotation */
  const requestsQuery = new CommandRqstQueries();
  const requestsData = useFetchQuery(
    ["commands"],
    requestsQuery.getAll,
    500000
  );
  /**Devis */
  const quotationQuery = new QuotationQueries();
  const quotationsData = useFetchQuery(["quotations"], quotationQuery.getAll)
  /**Fournisseurs */
  const providerQuery = new ProviderQueries();
  const providersData = useFetchQuery(
    ["providers"],
    providerQuery.getAll,
    15000
  );

  /**Data states */
  const [dueDate, setDueDate] = React.useState<boolean>(false);
  const today = new Date(); //On part sur 3 jours de delai de base :)
  today.setDate(today.getDate() + 3);

  const defaultValues = {
    commandRequestId: quotation?.commandRequestId ?? undefined,
    providerId: quotation?.providerId ?? undefined,
    elements:
      quotation?.element.map((c) => ({
        id: c.id,
        needId: c.requestModelId,
        designation: c.title,
        price: c.priceProposed,
        quantity: c.quantity,
        unit: c.unit,
      })) ?? [],
    dueDate: quotation
      ? format(new Date(quotation.dueDate), "yyyy-MM-dd")
      : format(today, "yyyy-MM-dd"),
    proof: quotation ? [quotation.proof] : undefined,
  };

  /**Quotation */
  const { mutate, isPending } = useMutation({
    mutationFn: async ({ values, id }: { values: FormValues; id?: number }) => {
      const payload = {
        devis: {
          commandRequestId: values.commandRequestId,
          providerId: values.providerId,
          proof: values.proof[0], // File ou string
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
        // CREATE
        return quotationQuery.create(payload);
      }

      // UPDATE
      return quotationQuery.update(id, payload);
    },
    onSuccess: (_data, variables) => {
      const intent = intentRef.current;
      toast.success(
        variables?.id
          ? "Votre devis a été modifié avec succès"
          : "Votre devis a été créé avec succès"
      );
      queryClient.invalidateQueries({
        queryKey: ["quotations"],
        refetchType: "active",
      });
      if (!!openChange) {
        openChange(false);
      }
      if (intent === "save") {
        router.push("./");
      } else {
        form.reset(defaultValues);
        form.resetField("commandRequestId");
        form.resetField("providerId");
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

  React.useEffect(() => {
    if (form.watch("commandRequestId"))
      setSelectedNeeds(
        requestsData.data?.data.find(
          (c) => c.id === form.watch("commandRequestId")
        )?.besoins
      );
  }, [form.watch("commandRequestId")]);

  const [search, setSearch] = React.useState("");

  const normalizeText = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filteredProviders =
    providersData.data?.data.filter((provider) =>
      normalizeText(provider.name).includes(normalizeText(search))
    ) ?? [];

  if (requestsData.isLoading || providersData.isLoading || quotationsData.isLoading) {
    return <LoadingPage />;
  }

  function onSubmit(values: FormValues) {
    mutate({ values, id: quotation?.id });
  }

  if(requestsData.isSuccess && quotationsData.isSuccess)
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
                    requestsData.data.data.filter(w=> !quotationsData.data.data.filter(c=>c.status === "APPROVED").some(d=> d.commandRequestId === w.id)).map((request) => ({
                      label: request.title,
                      value: request.id.toString(),
                    })) ?? []
                  }
                  value={field.value?.toString() || ""}
                  onChange={(value) => field.onChange(parseInt(value))}
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
                    if (!open) setSearch(""); // reset recherche à la fermeture
                  }}
                >
                  <SelectTrigger className="min-w-60 w-full uppercase">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>

                  <SelectContent className="max-h-[500px] p-0">
                    {/* 🔍 CHAMP DE RECHERCHE */}
                    <div className="p-2 border-b">
                      <Input
                        placeholder="Rechercher un fournisseur..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()} // empêche fermeture du select
                        className="h-9"
                      />
                    </div>

                    {/* LISTE SCROLLABLE */}
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
                            disabled={quotationsData.data.data.filter(x=>x.commandRequestId === form.getValues("commandRequestId")).some(u=>u.providerId === provider.id)}
                          >
                            {provider.name}
                          </SelectItem>
                        ))
                      )}
                    </div>

                    {/* FOOTER */}
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
                        >
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
                                  (n) => n.id === Number(need)
                                )?.label
                              }
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {elements.map((item, localIndex) => (
                                <div
                                  key={localIndex}
                                  className="w-full bg-gray-50 rounded-sm border border-gray-200 px-2 h-9 inline-flex justify-between gap-2 items-center text-sm"
                                >
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1.5 w-full justify-between text-left truncate cursor-pointer"
                                    onClick={() => {
                                      setEditingIndex(item.globalIndex);
                                      setOpen(true);
                                    }}
                                  >
                                    <span className="truncate">
                                      {`${item.designation} - ${
                                        item.quantity
                                      } ${item.unit} - ${XAF.format(
                                        item.price
                                      )}`}
                                    </span>
                                    <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-foreground text-primary-foreground">
                                      {"Modifier"}
                                    </span>
                                  </button>
                                  <X
                                    size={20}
                                    className="text-destructive cursor-pointer"
                                    onClick={() => {
                                      // Trouver et supprimer l'élément correct
                                      const currentElements = [...field.value];
                                      currentElements.splice(
                                        item.globalIndex,
                                        1
                                      );
                                      field.onChange(currentElements);
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      );
                    })()
                  )}

                  <button
                    className="add-button inline-flex items-center gap-2 text-sm text-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      setEditingIndex(null); // mode ajout
                      setOpen(true);
                    }}
                    disabled={!selectedNeeds}
                  >
                    {"Ajouter un élément"}
                    <Plus className="w-4 h-4" />
                  </button>

                  {!!selectedNeeds && (
                    <AddElement
                      open={open}
                      openChange={(state) => {
                        if (!state) setEditingIndex(null);
                        setOpen(state);
                      }}
                      needs={selectedNeeds}
                      value={field.value}
                      onChange={field.onChange}
                      element={
                        editingIndex !== null
                          ? field.value[editingIndex]
                          : undefined
                      }
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
        <div className="flex justify-end col-span-3 w-full gap-2">
          <Button
            type="submit"
            disabled={isPending}
            isLoading={isPending}
            className="w-fit"
            variant={"primary"}
            onClick={() => (intentRef.current = "save")}
          >
            {!!quotation ? "Modifier le devis" : "Enregistrer"}
          </Button>
          {!quotation && (
            <Button
              type="submit"
              disabled={isPending}
              isLoading={isPending}
              className="w-fit"
              onClick={() => (intentRef.current = "saveAndCreate")}
            >
              {"Enregistrer et créer"}
            </Button>
          )}
        </div>
      </form>
      <ProviderDialog open={openP} onOpenChange={setOpenP} />
    </Form>
  );
}

export default CreateQuotation;
