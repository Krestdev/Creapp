"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { queryKeys } from "@/lib/query-keys";
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
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Label } from "../ui/label";

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
  amount: z.coerce.number().min(1, "Montant requis"),
  quantity: z.coerce
    .number()
    .refine((val) => val > 0, "La quantité doit être supérieure à 0"),
  dueDate: z.date({ required_error: "Date requise" }),
  unit: z.string().min(1, "Unité requise"),
  priority: z.enum(REQUEST_PRIORITIES),
  paytype: z.enum(["cash", "chq", "ov"], {
    required_error: "Sélectionner le moyen de payement",
    invalid_type_error: "Sélectionner le moyen de payement",
  }),
});

export default function BesoinLastValOther({
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

  const beneficiary =
    request.beneficiary === "me"
      ? users.find((u) => u.id === request.userId)
      : request.beneficiary.length > 0
        ? users.find((u) => u.id === Number(request.beneficiary))
        : users.find((u) => u.id === request.benef?.[0]);

  const [openDate, setOpenDate] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: request.amount,
      quantity: request.quantity,
      priority: (request.priority as any) || "low",
      unit: request.unit,
      dueDate: request.dueDate ? new Date(request.dueDate) : new Date(),
      paytype: undefined,
    },
  });

  // Réinitialiser le formulaire quand la requête change ou à l'ouverture
  useEffect(() => {
    if (open) {
      form.reset({
        amount: request.amount,
        quantity: request.quantity,
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
    }: {
      id: number;
      request: Partial<RequestModelT>;
    }) => requestQ.validate({ id, request }),
    onSuccess: () => {
      toast.success("Besoin modifié et approuvé !");
      setOpen(false);
      onSuccess?.();
    },
    onError: () => toast.error("Erreur lors de la validation finale"),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    validateRequest.mutate({
      id: request.id,
      request: {
        amount: values.amount,
        quantity: values.quantity,
        unit: values.unit,
        priority: values.priority,
        dueDate: values.dueDate,
        paytype: values.paytype,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{"Approbation & Modification"}</DialogTitle>
          <DialogDescription>
            {"Vérifiez et ajustez les informations avant la validation finale"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 @min-[540px]/dialog:grid-cols-2 gap-3"
            id="approval-form"
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

            {/* Montant & Quantité */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Montant"}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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

            {/* Unité & Priorité */}
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
            {/* Footer: Fixe en bas */}
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
                form="approval-form"
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
