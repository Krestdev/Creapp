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
import { units } from "@/data/unit";
import { useStore } from "@/providers/datastore";
import { requestQ } from "@/queries/requestModule";
import { PRIORITIES, ProjectT, RequestModelT, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import FilesUpload from "../comp-547";
import { Label } from "../ui/label";
import { queryKeys } from "@/lib/query-keys";
import { categoryQ } from "@/queries/categoryModule";
import { projectQ } from "@/queries/projectModule";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  request: RequestModelT;
  users: Array<User>;
  onSuccess?: () => void;
}

const REQUEST_PRIORITIES = PRIORITIES.map((m) => m.value) as [
  (typeof PRIORITIES)[number]["value"],
  ...(typeof PRIORITIES)[number]["value"][],
];

const formSchema = z.object({
  quantity: z.coerce
    .number()
    .refine((val) => val > 0, "La quantité doit être supérieure à 0"),
  benef: z.coerce.number().min(1, "Bénéficiaire requis"),
  dueDate: z.date({ required_error: "Date requise" }),
  unit: z.string().min(1, "Unité requise"),
  priority: z.enum(REQUEST_PRIORITIES),
  paytype: z.enum(["cash", "chq", "ov"], {
    required_error: "Sélectionner le moyen de payement",
    invalid_type_error: "Sélectionner le moyen de payement",
  }),
  decision: z.string().max(255, { message: "Trop long" }).optional(),
});

export default function BesoinLastValSettle({
  open,
  setOpen,
  request,
  users,
  onSuccess,
}: Props) {
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

  const [openDate, setOpenDate] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: request.quantity,
      benef: request.benef?.[0] ?? Number(request.beneficiary),
      priority: (request.priority as any) || "low",
      unit: request.unit,
      dueDate: request.dueDate ? new Date(request.dueDate) : new Date(),
      paytype: undefined,
    },
  });

  const beneficiary =
    request.beneficiary === "me"
      ? users.find((u) => u.id === request.userId)
      : request.beneficiary.length > 0
        ? users.find((u) => u.id === Number(request.beneficiary))
        : users.find((u) => u.id === request.benef?.[0]);

  // Réinitialiser le formulaire quand la requête change ou à l'ouverture
  useEffect(() => {
    if (open) {
      form.reset({
        decision: "",
        quantity: request.quantity,
        benef: Number(request.beneficiary),
        priority: (request.priority as any) || "low",
        unit: request.unit,
        dueDate: request.dueDate ? new Date(request.dueDate) : new Date(),
        paytype: undefined,
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
      toast.success("Besoin modifié et approuvé !");
      setOpen(false);
      onSuccess?.();
    },
    onError: () => toast.error("Erreur lors de la validation"),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    validateRequest.mutate({
      id: request.id,
      decision: values.decision,
      request: {
        paytype: values.paytype,
        priority: values.priority,
        dueDate: values.dueDate,
        unit: values.unit,
        quantity: values.quantity,
      },
    });
  };

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
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 @min-[540px]/dialog:grid-cols-2 gap-3"
          >
            {/* Title */}
            <div className="w-full grid gap-2">
              <Label>{"Titre"}</Label>
              <Input value={request.label} disabled />
            </div>
            {/* Description */}
            <div className="w-full grid gap-2">
              <Label>{"Description"}</Label>
              <Textarea value={request.description} disabled />
            </div>
            {/* Category */}
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
            {/* Project */}
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
            {/**Beneficiary */}
            <div className="w-full grid gap-2">
              <Label>{"Bénéficiaire"}</Label>
              <Input
                disabled
                value={
                  beneficiary
                    ? beneficiary.firstName.concat(" ", beneficiary.lastName)
                    : "--"
                }
              />
            </div>

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

            {/* JUSTIFICATIF */}
            <div className="w-full grid gap-2 md:col-span-2">
              <Label>{"Justificatif"}</Label>
              <FilesUpload
                disabled
                value={request.proof}
                onChange={() => {}}
                name={"proof"}
                acceptTypes="all"
                multiple={false}
                maxFiles={1}
              />
            </div>
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
                <Button type="button" variant="outline">
                  {"Annuler"}
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={validateRequest.isPending}
                isLoading={validateRequest.isPending}
              >
                {"Mettre à jour et Approuver"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
