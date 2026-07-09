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
import { Label } from "@/components/ui/label";
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
import { categoryQ } from "@/queries/categoryModule";
import { projectQ } from "@/queries/projectModule";
import { requestQ } from "@/queries/requestModule";
import { PRIORITIES, RequestModelT, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { beneficiaryArray } from "./creer/create-type-transport";

interface Props {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  request: RequestModelT;
  users: Array<User>;
}

const REQUEST_PRIORITIES = PRIORITIES.map((m) => m.value) as [
  (typeof PRIORITIES)[number]["value"],
  ...(typeof PRIORITIES)[number]["value"][],
];

const formSchema = z.object({
  dueDate: z.date({ required_error: "Date requise" }),
  priority: z.enum(REQUEST_PRIORITIES),
  list: z.array(beneficiaryArray).min(1, "Veuillez ajouter un bénéficiaire"),
  decision: z.string().max(255, { message: "Trop long" }).optional(),
});

export default function TransportApprobation({
  open,
  onOpenChange,
  request,
  users,
}: Props) {
  const [openDate, setOpenDate] = useState(false);

  const getCategory = useQuery({
    queryKey: queryKeys.category(request.categoryId!),
    queryFn: () => categoryQ.getCategory(request.categoryId!),
    enabled: !!request.categoryId,
  });
  const getProject = useQuery({
    queryKey: queryKeys.project(request.projectId!),
    queryFn: () => projectQ.getOne(request.projectId!),
    enabled: !!request.projectId,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      decision: "",
      priority: (request.priority as any) || "low",
      dueDate: request.dueDate ? new Date(request.dueDate) : new Date(),
      list: request.benFac?.list ?? [],
    },
  });

  // Réinitialiser le formulaire quand la requête change ou à l'ouverture
  useEffect(() => {
    if (open) {
      form.reset({
        priority: request.priority || "low",
        dueDate: request.dueDate ? new Date(request.dueDate) : new Date(),
        list:
          request.benFac?.list.map((l) => ({
            id: l.id,
            name: l.name,
            amount: l.amount,
          })) ?? [],
      });
    }
  }, [open, request, form]);

  const validateRequest = useMutation({
    mutationFn: async ({
      id,
      request,
      decision,
    }: {
      id: number;
      request: Partial<RequestModelT>;
      decision?: string;
    }) => requestQ.validate({ id, request, decision }),
    onSuccess: () => {
      toast.success("Le Besoin a été approuvé !");
      onOpenChange(false);
    },
    onError: () =>
      toast.error("Une erreur a été rencontré lors de la validation !"),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    validateRequest.mutate({
      id: request.id,
      request: {
        dueDate: values.dueDate,
        priority: values.priority,
        benFac: { list: values.list },
        amount: values.list.reduce((acc, el) => acc + el.amount, 0),
      },
      decision: values.decision,
    });
  };

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "list",
  });

  const list = form.watch("list");
  const amount = list.reduce((a, b) => a + b.amount, 0);
  const listError = form.getFieldState("list").error?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"secondary"}>
          <DialogTitle>{"Approbation & Modification"}</DialogTitle>
          <DialogDescription>
            {"Vérifiez et ajustez les informations avant la validation finale"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 @min-[540px]/dialog:grid-cols-2 gap-3"
          >
            {/* Titre */}
            <div className="w-full grid gap-2">
              <Label>{"Titre"}</Label>
              <Input value={request.label} disabled />
            </div>
            {/* Description */}
            <div className="w-full grid gap-2">
              <Label>{"Description"}</Label>
              <Textarea value={request.description} disabled />
            </div>
            {/* Catégorie */}
            <div className="w-full grid gap-2">
              <Label>{"Catégorie"}</Label>
              <Input
                value={
                  getCategory.isLoading
                    ? "..chargement"
                    : getCategory.data
                      ? getCategory.data.data.label
                      : "--"
                }
                disabled
              />
            </div>
            {/* Projet */}
            <div className="w-full grid gap-2">
              <Label>{"Projet"}</Label>
              <Input
                value={
                  getProject.isLoading
                    ? "..chargement"
                    : getProject.data
                      ? getProject.data.data.label
                      : "--"
                }
                disabled
              />
            </div>

            <div className="w-full @min-[560px]:col-span-2 grid gap-3">
              <div className="flex items-center justify-between">
                <FormLabel isRequired>{"Bénéficiaires"}</FormLabel>
                <div className="text-sm text-muted-foreground">
                  {"Total: "}
                  <span>{XAF.format(amount)}</span>
                </div>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 rounded-md border grid grid-cols-1 @min-[560px]:grid-cols-2 gap-3 place-items-start"
                  >
                    <FormField
                      control={form.control}
                      name={`list.${index}.amount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Montant (FCFA)"}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type="number"
                                placeholder="Ex. 30"
                                onChange={(e) => {
                                  const value =
                                    e.target.value === ""
                                      ? 0
                                      : parseFloat(e.target.value);
                                  field.onChange(value);
                                }}
                              />
                              <p className="absolute right-2 top-1/2 -translate-y-1/2">
                                {"FCFA"}
                              </p>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`list.${index}.id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{`Beneficiaire`}</FormLabel>
                          <FormControl>
                            <Combobox
                              items={users}
                              value={
                                users.find((user) => user.id === field.value) ??
                                null
                              }
                              onValueChange={(v) => {
                                field.onChange(v?.id ?? "");
                                form.setValue(
                                  `list.${index}.name`,
                                  v?.firstName.concat(" ", v.lastName) ?? "",
                                );
                              }}
                              itemToStringLabel={(v) =>
                                v.firstName.concat(" ", v.lastName)
                              }
                            >
                              <ComboboxInput placeholder="Sélectionner" />
                              <ComboboxContent>
                                <ComboboxEmpty>
                                  {"Aucun utilisateur enregistré"}
                                </ComboboxEmpty>
                                <ComboboxList>
                                  {(item: User) => (
                                    <ComboboxItem key={item.id} value={item}>
                                      {item.firstName.concat(
                                        " ",
                                        item.lastName,
                                      )}
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
                  </div>
                ))}
              </div>
              {listError && (
                <p className="text-sm font-medium text-destructive">
                  {listError}
                </p>
              )}
            </div>
            {/* Priorité */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Priorité"}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date limite */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel isRequired className="mb-1">
                    {"Date limite"}
                  </FormLabel>
                  <Popover open={openDate} onOpenChange={setOpenDate}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value
                            ? format(field.value, "dd/MM/yyyy", {
                                locale: fr,
                              })
                            : "Sélectionner"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setOpenDate(false);
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/**Decision */}
            <FormField
              control={form.control}
              name="decision"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel>{"Commentaire (optionnel)"}</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Laisser un commentaire" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="col-span-full">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={validateRequest.isPending}
                >
                  {"Annuler"}
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={validateRequest.isPending}
                isLoading={validateRequest.isPending}
                variant={"success"}
              >
                {"Approuver"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
