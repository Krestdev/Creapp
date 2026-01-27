"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { categoryQ } from "@/queries/categoryModule";
import { requestQ } from "@/queries/requestModule";
import { RequestModelT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronDownIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

// Validation Zod
const formSchema = z.object({
  title: z.string().min(1, "Le titre est obligatoire"),
  limiteDate: z.date().optional(),
  priorite: z.enum(["medium", "high", "low", "urgent"], {
    required_error: "La priorité est obligatoire",
  }),
  quantite: z.string().min(1, "La quantité est obligatoire"),
  description: z.string().optional(),
  unite: z.string().min(1, "L'unité est obligatoire"),
});

type FormValues = z.infer<typeof formSchema>;

interface ValidationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: RequestModelT | null;
  titre: string | undefined;
  description: string | undefined;
}

export function BesoinLastVal({
  open,
  onOpenChange,
  data,
  titre,
  description,
}: ValidationModalProps) {
  const [openD, setOpenD] = useState(false);
  const { isHydrated, user } = useStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: data?.label || "",
      limiteDate: new Date(data?.dueDate ?? ""),
      priorite: data?.priority as "medium" | "high" | "low" | "urgent",
      quantite: String(data?.quantity) || "",
      description: data?.description || "",
      unite: data?.unit || "",
    },
  });

  const requestData = useQuery({
    queryKey: ["requests"],
    queryFn: () => {
      return requestQ.getAll();
    },
    enabled: isHydrated,
  });

  const categoriesData = useQuery({
    queryKey: ["categoryList"],
    queryFn: () => {
      return categoryQ.getCategories();
    },
    enabled: isHydrated,
  });

  const validator = categoriesData.data?.data
    ?.find((cat) => cat.id === data?.categoryId)
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
      requestData.refetch();
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
    onError: (error) => {
      toast.error("Une erreur est survenue.");
    },
  });

  const isSuccess = requestMutation.isSuccess || validateRequest.isSuccess;
  const isError = requestMutation.isError || validateRequest.isError;
  const isPending = requestMutation.isPending || validateRequest.isPending;

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        title: data?.label || "",
        limiteDate: new Date(data?.dueDate ?? ""), // Handle undefined or null dates
        priorite: data?.priority,
        quantite: String(data?.quantity) || "",
        description: data?.description || "",
        unite: data?.unit || "",
      });
    }
  }, [open, data, form]);

  const submitForm = async (values: FormValues) => {
    try {
      requestMutation.mutate({
        id: Number(data?.id),
        label: values.title,
        description: values.description,
        priority: values.priorite,
        quantity: Number(values.quantite),
        dueDate: values.limiteDate,
        unit: values.unite,
        userId: data?.userId,
      });
    } catch {
      toast.error("Une erreur est survenue");
    }
  };

  const handleRetry = () => {
    requestMutation.reset();
  };

  const headerTitle = isError ? "Erreur ❌" : isSuccess ? "Succès ✅" : titre;

  const headerDescription = isError
    ? "Une erreur est survenue. Vous pouvez réessayer."
    : isSuccess
      ? "Besoin approuvée avec succès."
      : description;

  // Reset complet quand le modal se ferme
  useEffect(() => {
    if (!open) {
      // Reset du formulaire
      form.reset({
        title: data?.label || "",
        limiteDate: data?.dueDate ? new Date(data.dueDate) : undefined,
        priorite: data?.priority as "medium" | "high" | "low" | "urgent",
        quantite: String(data?.quantity || ""),
        description: data?.description || "",
        unite: data?.unit || "",
      });

      // Reset des mutations
      requestMutation.reset();
      validateRequest.reset();
    }
  }, [open, data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] p-0 gap-0 border-none flex flex-col">
        {/* HEADER - Fixé en haut */}
        <DialogHeader variant={isError ? "error" : isSuccess ? "success" : "default"} className={` text-white p-6 m-4 rounded-lg pb-8 shrink-0`}>
          <DialogTitle className="text-xl font-semibold text-white">
            {"Approbation"}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">{headerDescription}</p>
        </DialogHeader>

        {/* FORM - Zone scrollable */}
        {!isSuccess && !isError && (
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(submitForm)}
                className="space-y-4 pb-4"
              >
                {/* Titre */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Titre <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Titre..." {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date */}
                <FormField
                  control={form.control}
                  name="limiteDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date limite</FormLabel>
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
                  name="priorite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Priorité <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionnez une priorité" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Normale</SelectItem>
                          <SelectItem value="medium">Moyenne</SelectItem>
                          <SelectItem value="high">Haute</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Quantité */}
                <FormField
                  control={form.control}
                  name="quantite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Quantité <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Quantité..."
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* UNITE */}
                <FormField
                  control={form.control}
                  name="unite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {"Unité"}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full h-10 shadow-none rounded py-1">
                            <SelectValue placeholder="Sélectionner l'unité" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.map((unit, id) => (
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

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Description <span className="text-destructive">*</span>
                      </FormLabel>
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

                {/* Boutons */}
                <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white pb-4">
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      "Approuver"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isPending}
                  >
                    Fermer
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {/* Footer Success/Error */}
        {(isSuccess || isError) && (
          <div className="shrink-0 flex gap-3 p-6 pt-0 ml-auto">
            {/* Bouton pour réessayer */}
            {isError && (
              <Button type="button" variant={"primary"} onClick={handleRetry}>
                {"Réessayer"}
              </Button>
            )}
            <Button
              className="bg-gray-600 hover:bg-gray-700 text-white"
              onClick={() => {
                form.reset();
                onOpenChange(false);
              }}
            >
              Fermer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
