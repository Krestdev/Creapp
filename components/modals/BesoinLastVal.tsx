"use client";

import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { units } from "@/data/unit";
import { requestQ } from "@/queries/requestModule";
import { RequestModelT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronDownIcon, CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Label } from "../ui/label";
import { userQ } from "@/queries/baseModule";
import { queryKeys } from "@/lib/query-keys";
import { categoryQ } from "@/queries/categoryModule";
import { projectQ } from "@/queries/projectModule";

// Validation Zod - Editable fields only
const formSchema = z.object({
  dueDate: z.date({ required_error: "La date limite est obligatoire" }),
  priority: z.enum(["medium", "high", "low", "urgent"], {
    required_error: "La priorité est obligatoire",
  }),
  quantity: z.coerce.number().optional(),
  unit: z.string().optional(),
  amount: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ValidationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: RequestModelT;
  titre?: string;
  description?: string;
  onSuccess?: () => void;
}

export function BesoinLastVal({
  open,
  onOpenChange,
  data,
  titre,
  description,
  onSuccess,
}: ValidationModalProps) {
  const [openD, setOpenD] = useState(false);

  // Queries to fetch metadata
  const getUser = useQuery({
    queryKey: ["user", data.userId],
    queryFn: () => userQ.getOne(data.userId),
    enabled: open && !!data.userId,
  });

  const getCategory = useQuery({
    queryKey: queryKeys.category(data.categoryId!),
    queryFn: () => categoryQ.getCategory(data.categoryId!),
    enabled: open && !!data.categoryId,
  });

  const getProject = useQuery({
    queryKey: queryKeys.project(data.projectId!),
    queryFn: () => projectQ.getOne(data.projectId!),
    enabled: open && !!data.projectId,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      priority: (data.priority as any) || "low",
      quantity: data.quantity || undefined,
      unit: data.unit || "",
      amount: data.amount || undefined,
    },
  });

  // Single approval mutation
  const validateRequest = useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: number;
      request: Partial<RequestModelT>;
    }) => requestQ.validate({ id, request }),
    onSuccess: () => {
      toast.success("Besoin approuvé avec succès !");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erreur lors de la validation");
    },
  });

  // Reset form when modal opens or request data changes
  useEffect(() => {
    if (open) {
      form.reset({
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        priority: (data.priority as any) || "low",
        quantity: data.quantity || undefined,
        unit: data.unit || "",
        amount: data.amount || undefined,
      });
    }
  }, [open, data, form]);

  const submitForm = async (values: FormValues) => {
    const payload: Partial<RequestModelT> = {
      dueDate: values.dueDate,
      priority: values.priority,
      amount: values.amount,
    };

    if (data.type !== "transport" && data.type !== "gas") {
      payload.unit = values.unit;
      payload.quantity = values.quantity;
    }

    try {
      validateRequest.mutate({
        id: data.id,
        request: payload,
      });
    } catch {
      toast.error("Une erreur est survenue");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"secondary"}>
          <DialogTitle>{titre ?? `Approbation - ${data.label}`}</DialogTitle>
          <DialogDescription>
            {description ?? "Valider un besoin"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            id="generic-approval-form"
            onSubmit={form.handleSubmit(submitForm)}
          >
            {/* Title - Static */}
            <div className="grid gap-2 col-span-full">
              <Label>{"Titre"}</Label>
              <Input value={data.label} disabled />
            </div>

            {/* Description - Static */}
            <div className="grid gap-2 col-span-full">
              <Label>{"Description"}</Label>
              <Textarea
                value={data.description || ""}
                disabled
                className="resize-none"
                rows={3}
              />
            </div>

            {/* Category - Static */}
            <div className="grid gap-2">
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

            {/* Project - Static */}
            <div className="grid gap-2">
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

            {/* Emetteur - Static */}
            {getUser.data && (
              <div className="grid gap-2">
                <Label>{"Emetteur"}</Label>
                <Input
                  value={`${getUser.data.data.firstName} ${getUser.data.data.lastName}`}
                  disabled
                />
              </div>
            )}

            {/* Beneficiary - Static */}
            {data.beneficiary === "me" && (
              <div className="grid gap-2">
                <Label>{"À Réceptionner par"}</Label>
                <Input
                  value={
                    getUser.data
                      ? `${getUser.data.data.firstName} ${getUser.data.data.lastName}`
                      : "--"
                  }
                  disabled
                />
              </div>
            )}

            {data.beficiaryList && data.beficiaryList.length > 0 && (
              <div className="grid gap-2 col-span-full">
                <Label>{"Bénéficiaires"}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {data.beficiaryList.map((beneficiary) => (
                    <Input
                      key={beneficiary.id}
                      value={`${beneficiary.firstName} ${beneficiary.lastName}`}
                      disabled
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Amount - Editable if present */}
            {!!data.amount && (
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{"Montant"}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="Ex. 15 000"
                          {...field}
                          className="pr-16"
                        />
                        <p className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          {"FCFA"}
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Due Date - Editable */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel isRequired className="mb-1">{"Date limite"}</FormLabel>
                  <Popover open={openD} onOpenChange={setOpenD}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full h-10 justify-between font-normal"
                        >
                          {field.value
                            ? format(field.value, "dd/MM/yyyy", { locale: fr })
                            : "Sélectionner une date"}
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setOpenD(false);
                        }}
                        locale={fr}
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

            {/* Priority - Editable */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Priorité"}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={validateRequest.isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionnez une priorité" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">{"Normale"}</SelectItem>
                      <SelectItem value="medium">{"Moyenne"}</SelectItem>
                      <SelectItem value="high">{"Haute"}</SelectItem>
                      <SelectItem value="urgent">{"Urgente"}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantity - Editable if not transport/gas */}
            {data.type !== "transport" && data.type !== "gas" && (
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Quantité"}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Quantité..."
                        {...field}
                        disabled={validateRequest.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Unit - Editable if not transport/gas */}
            {data.type !== "transport" && data.type !== "gas" && (
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{"Unité"}</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={validateRequest.isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner l'unité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Footer */}
            <DialogFooter className="col-span-full mt-4">
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
                variant={"success"}
                disabled={validateRequest.isPending}
                isLoading={validateRequest.isPending}
                form="generic-approval-form"
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
