"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { units } from "@/data/unit";
import { useStore } from "@/providers/datastore";
import { requestQ } from "@/queries/requestModule";
import {
  Category,
  PRIORITIES,
  ProjectT,
  User,
  RequestModelT,
} from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import FilesUpload from "../comp-547";
import { paymentQ } from "@/queries/payment";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  request: RequestModelT;
  users: Array<User>;
  categories: Array<Category>;
  projects: Array<ProjectT>;
  onSuccess?: () => void;
}

const REQUEST_PRIORITIES = PRIORITIES.map((m) => m.value) as [
  (typeof PRIORITIES)[number]["value"],
  ...(typeof PRIORITIES)[number]["value"][],
];

const SingleFileSchema = z
  .array(
    z.union([
      z.instanceof(File, { message: "Doit être un fichier valide" }),
      z.string(),
    ]),
  )
  .optional();

const formSchema = z.object({
  label: z.string().min(5, "Trop court").max(50, "Trop long"),
  projectId: z.coerce.number().min(1, "Projet requis"),
  description: z.string().min(1, "Description requise"),
  categoryId: z.coerce.number().min(1, "Catégorie requise"),
  quantity: z.coerce.number().min(1, "Quantité requise"),
  benef: z.coerce.number().min(1, "Bénéficiaire requis"),
  dueDate: z.date({ required_error: "Date requise" }),
  unit: z.string().min(1, "Unité requise"),
  priority: z.enum(REQUEST_PRIORITIES),
  paytype: z.enum(["cash", "chq", "ov"], {
    required_error: "Sélectionner le moyen de payement",
    invalid_type_error: "Sélectionner le moyen de payement",
  }),
  proof: SingleFileSchema,
});

export default function BesoinLastValSettle({
  open,
  setOpen,
  request,
  users,
  categories,
  projects,
  onSuccess,
}: Props) {
  const { user } = useStore();
  const [openDate, setOpenDate] = useState(false);

  const payments = useQuery({
    queryKey: ["payments"],
    queryFn: () => paymentQ.getAll(),
  });

  const paiement = payments.data?.data.find((x) => x.requestId === request?.id);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: request.label,
      description: request.description,
      quantity: request.quantity,
      benef: request.benef?.[0],
      priority: (request.priority as any) || "low",
      unit: request.unit,
      categoryId: request.categoryId,
      projectId: request.projectId,
      dueDate: request.dueDate ? new Date(request.dueDate) : new Date(),
      paytype: undefined,
      proof: request.proof || [],
    },
  });

  // Réinitialiser le formulaire quand la requête change ou à l'ouverture
  useEffect(() => {
    let proofValue: any[] = [];
    if (paiement?.proof) {
      if (typeof paiement?.proof === "string") {
        proofValue = [paiement?.proof];
      } else if (Array.isArray(paiement?.proof)) {
        proofValue = paiement?.proof;
      }
    }

    if (open) {
      form.reset({
        label: request.label,
        description: request.description,
        projectId: request.projectId,
        quantity: request.quantity,
        benef: request.beficiaryList?.[0].id,
        priority: (request.priority as any) || "low",
        unit: request.unit,
        categoryId: request.categoryId,
        dueDate: request.dueDate ? new Date(request.dueDate) : new Date(),
        paytype: undefined,
        proof: proofValue,
      });
    }
  }, [open, request, form, paiement]);

  const validator = categories
    .find((cat) => cat.id === request?.categoryId)
    ?.validators?.find((v) => v.userId === user?.id);

  const validateRequest = useMutation({
    mutationFn: async ({ id, validator }: { id: number; validator: any }) =>
      requestQ.validate(id, validator?.id!, validator),
    onSuccess: () => {
      toast.success("Besoin modifié et approuvé !");
      setOpen(false);
      onSuccess?.();
    },
    onError: () => toast.error("Erreur lors de la validation finale"),
  });

  const updateAndValidate = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const payload = {
        id: request.id,
        quantity: values.quantity,
        unit: values.unit,
        description: values.description,
        priority: values.priority,
        label: values.label,
        userId: request.userId,
        beneficiary: request.beneficiary,
        projectId: request.projectId,
        categoryId: request.categoryId,
        dueDate: values.dueDate,
        benef: request.benef,
        paytype: values.paytype,
        proof: values.proof,
      };
      await requestQ.specialUpdate(payload, Number(request.id));
      return request.id;
    },
    onSuccess: (id) => {
      validateRequest.mutate({ id: Number(id), validator });
    },
    onError: (error: Error) =>
      toast.error(error.message || "Erreur de mise à jour"),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateAndValidate.mutate(values);
  };

  const isProcessing = updateAndValidate.isPending || validateRequest.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"secondary"}>
          <DialogTitle>{"Approbation & Modification"}</DialogTitle>
          <DialogDescription>
            {"Vérifiez et ajustez les informations avant la validation finale"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
              {/* Titre */}
              <FormField
                control={form.control}
                disabled
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Titre"}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Catégorie */}
              <FormField
                control={form.control}
                name="categoryId"
                disabled
                render={({ field }) => {
                  const settle = categories.filter(
                    (c) => c.type.type === "settle",
                  );
                  return (
                    <FormItem>
                      <FormLabel isRequired className="w-full">
                        {"Catégorie"}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={String(field.value)}
                        disabled
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {settle.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Projet */}
              <FormField
                control={form.control}
                name="projectId"
                disabled
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Projet"}</FormLabel>
                    <Combobox
                      items={projects.filter((p) => p.status !== "cancelled")}
                      value={projects.find((p) => p.id === field.value) ?? null}
                      onValueChange={(v) => field.onChange(v?.id)}
                      disabled
                    >
                      <FormControl>
                        <ComboboxInput disabled placeholder={"Projet..."} />
                      </FormControl>
                      <ComboboxContent>
                        <ComboboxEmpty>{"Aucun projet"}</ComboboxEmpty>
                        <ComboboxList>
                          {(item: ProjectT) => (
                            <ComboboxItem key={item.id} value={item}>
                              {item.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bénéficiaire */}
              <FormField
                control={form.control}
                name="benef"
                disabled
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Bénéficiaire"}</FormLabel>
                    <Combobox
                      items={users}
                      value={users.find((u) => u.id === field.value) ?? null}
                      onValueChange={(v) => field.onChange(v?.id)}
                      itemToStringLabel={(v) => `${v.firstName} ${v.lastName}`}
                      disabled
                    >
                      <FormControl>
                        <ComboboxInput disabled placeholder="Bénéficiaire..." />
                      </FormControl>
                      <ComboboxContent>
                        <ComboboxList>
                          {(u: User) => (
                            <ComboboxItem key={u.id} value={u}>
                              {u.firstName} {u.lastName}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantité */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Quantité"}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unité */}
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Unité"}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.map((u) => (
                          <SelectItem key={u.value} value={u.value}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {/* Moyen de paiement */}
              <FormField
                control={form.control}
                name="paytype"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Moyen de paiement"}</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={
                          field.value ? String(field.value) : undefined
                        }
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">{"Espèces"}</SelectItem>
                          <SelectItem value="chq">{"Chèque"}</SelectItem>
                          <SelectItem value="ov">{"Virement"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                disabled
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel isRequired>
                      {"Description / Justification"}
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* JUSTIFICATIF */}
              <FormField
                control={form.control}
                name="proof"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel isRequired>{"Justificatif"}</FormLabel>
                    <FormControl>
                      <FilesUpload
                        disabled
                        value={field.value || []}
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
            </div>
          </form>
        </Form>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            {"Annuler"}
          </Button>
          <Button
            type="submit"
            disabled={isProcessing}
            isLoading={isProcessing}
            onClick={form.handleSubmit(onSubmit)}
          >
            {"Mettre à jour et Approuver"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
