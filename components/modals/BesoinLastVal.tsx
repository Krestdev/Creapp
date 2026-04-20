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
import { useStore } from "@/providers/datastore";
import { requestQ } from "@/queries/requestModule";
import { Category, RequestModelT, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Label } from "../ui/label";

// Validation Zod
const formSchema = z.object({
  title: z.string().min(1, "Le titre est obligatoire"),
  dueDate: z.date().optional(),
  priority: z.enum(["medium", "high", "low", "urgent"], {
    required_error: "La priorité est obligatoire",
  }),
  quantity: z.coerce
    .number()
    .refine((val) => val > 0, "La quantité doit être supérieure à 0"),
  description: z.string().optional(),
  unit: z.string().min(1, "L'unité est obligatoire"),
  amount: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ValidationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: RequestModelT;
  titre: string | undefined;
  description: string | undefined;
  categories: Array<Category>;
  users: Array<User>;
}

export function 
BesoinLastVal({
  open,
  onOpenChange,
  data,
  titre,
  description,
  categories,
  users,
}: ValidationModalProps) {
  const [openD, setOpenD] = useState(false);
  const { user } = useStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: data.label,
      dueDate: new Date(data.dueDate),
      priority: data.priority as "medium" | "high" | "low" | "urgent",
      quantity: data.quantity,
      description: data?.description || "",
      unit: data.unit,
      amount: data.amount,
    },
  });

  const validator = categories
    .find((cat) => cat.id === data?.categoryId)
    ?.validators?.find((v) => v.userId === user?.id);

  const validateRequest = useMutation({
    mutationFn: async ({
      id,
      validator,
    }: {
      id: number;
      validator:
        | {
            id?: number | undefined;
            userId: number;
            rank: number;
          }
        | undefined;
    }) => requestQ.validate(id, validator?.id!, validator),
    onSuccess: () => {
      toast.success("Besoin approuvé avec succès !");
    },
    onError: () => {
      toast.error("Erreur lors de la validation");
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (data: Partial<RequestModelT>) => {
      const id = data?.id;

      if (!id) throw new Error("ID de besoin manquant");

      await requestQ.update(Number(id), data);
      return { id: Number(id) };
    },
    onSuccess: (res) => {
      validateRequest.mutateAsync({
        id: res.id,
        validator: validator,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Une erreur est survenue.");
    },
  });

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        title: data.label,
        dueDate: new Date(data.dueDate),
        priority: data.priority,
        quantity: data.quantity,
        description: data.description || "",
        unit: data.unit,
        amount: data.amount,
      });
    }
  }, [open, data, form]);

  const submitForm = async (values: FormValues) => {
    const { unit, quantity, ...rest } = values;
    const payload: Partial<RequestModelT> =
      data.type === "gas" || data.type === "transport"
        ? {
            id: data.id,
            label: rest.title,
            description: rest.description,
            priority: rest.priority,
            dueDate: rest.dueDate,
            userId: data.userId,
            amount: rest.amount,
            unit: unit,
            quantity: Number(quantity),
          }
        : {
            id: data.id,
            label: rest.title,
            description: rest.description,
            priority: rest.priority,
            dueDate: rest.dueDate,
            userId: data.userId,
            amount: rest.amount,
          };
    try {
      requestMutation.mutate(payload);
    } catch {
      toast.error("Une erreur est survenue");
    }
  };

  // Reset complet quand le modal se ferme
  useEffect(() => {
    if (!open) {
      form.reset({
        title: data?.label || "",
        dueDate: data?.dueDate ? new Date(data.dueDate) : undefined,
        priority: data?.priority as "medium" | "high" | "low" | "urgent",
        quantity: data?.quantity || 1,
        description: data?.description || "",
        unit: data?.unit || "",
      });
    }
  }, [open, data]);

  const requestBy = users.find((u) => u.id === data.userId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader variant={"secondary"}>
          <DialogTitle>{`Approbation - ${data.label}`}</DialogTitle>
          <DialogDescription>
            {description ?? "Valider un besoin"}
          </DialogDescription>
        </DialogHeader>

        {/* FORM - Zone scrollable */}
        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(submitForm)}>
            {/* Titre */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Titre"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex. Chantier Duval"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!!requestBy && (
              <div className="grid gap-2">
                <Label>{"Emetteur"}</Label>
                <Input
                  value={requestBy.firstName.concat(" ", requestBy.lastName)}
                  disabled
                />
              </div>
            )}

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
                          placeholder="Ex. 15 000 FCFA"
                          {...field}
                          className="pr-12"
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
            )}

            {/* Date */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Date limite"}</FormLabel>
                  <Popover open={openD} onOpenChange={setOpenD}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full h-10 justify-between font-normal"
                        >
                          {field.value
                            ? format(field.value, "PPP", { locale: fr })
                            : "Sélectionner une date"}
                          <ChevronDownIcon />
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
                      />
                    </PopoverContent>
                  </Popover>
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={
                      requestMutation.isPending || validateRequest.isPending
                    }
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

            {/* Quantité */}
            {data.type !== "transport" && (
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Quantité"}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Quantité..."
                        {...field}
                        disabled={
                          requestMutation.isPending || validateRequest.isPending
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* UNIT */}
            {data.type !== "transport" && (
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{"Unité"}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full h-10 shadow-none rounded py-1">
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

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Description"}</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      className="resize-none"
                      placeholder="Description détaillée..."
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                variant={"success"}
                disabled={
                  requestMutation.isPending || validateRequest.isPending
                }
                isLoading={
                  requestMutation.isPending || validateRequest.isPending
                }
              >
                {"Approuver"}
              </Button>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    requestMutation.isPending || validateRequest.isPending
                  }
                >
                  {"Fermer"}
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
