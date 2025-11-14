"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { TableData } from "../base/data-table";

// Schéma de validation Zod
const formSchema = z.object({
  title: z.string().min(1, "Le titre est obligatoire"),
  limiteDate: z.string().optional(),
  priorite: z.enum(["low" , "medium" , "high" , "urgent"], {
    required_error: "La priorité est obligatoire",
  }),
  quantite: z.string().min(1, "La quantité est obligatoire"),
  description: z.string().min(1, "La description est obligatoire"),
});

type FormValues = z.infer<typeof formSchema>;

interface ValidationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: TableData | null;
  titre: string | undefined;
  description: string | undefined;
  onSubmit: (data: TableData) => Promise<boolean>;
}

export function BesoinLastVal({
  open,
  onOpenChange,
  data,
  titre,
  description,
  onSubmit,
}: ValidationModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: data?.title || "",
      limiteDate: data?.limiteDate || "",
      priorite: data?.priorite,
      quantite: String(data?.quantite) || "",
      description: data?.description || "",
    },
  });

  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);

  // Réinitialisation à chaque ouverture
  useEffect(() => {
    if (open) {
      form.reset({
        title: data?.title || "",
        limiteDate: data?.limiteDate || "",
        priorite: data?.priorite,
        quantite: String(data?.quantite) || "",
        description: data?.description || "",
      });
      setIsPending(false);
      setResult(null);
    }
  }, [open, data, form]);

  const handleSubmit = async (values: FormValues) => {
    setIsPending(true);

    try {
      // Merge form values with existing data, ensure required string fields are not undefined
      const merged = {
        id: data?.id ?? 0,
        ...(data ?? {}),
        ...values,
        // provide fallbacks for required string fields that may be undefined on `data`
        reference: data?.reference ?? "",
        project: data?.project ?? "",
        unite: data?.unite ?? "",
        quantite: Number(values.quantite)
      };
      const success = await onSubmit(merged as TableData);
      setResult(success ? "success" : "error");
    } catch {
      setResult("error");
    } finally {
      setIsPending(false);
    }
  };

  const handleRetry = async () => {
    await form.handleSubmit(handleSubmit)();
  };

  // Affichage dynamique
  const renderTitle = () => {
    if (result === "success") return "Succès ✅";
    if (result === "error") return "Erreur ❌";
    return titre;
  };

  const renderDescription = () => {
    if (result === "success")
      return "Les modifications ont été enregistrées avec succès.";
    if (result === "error")
      return "Une erreur est survenue lors de l'enregistrement. Vous pouvez réessayer.";
    return description;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-screen overflow-y-auto p-0 gap-0 border-none">
        {/* HEADER */}
        <DialogHeader className={`bg-gradient-to-r from-[#15803D] to-[#0B411F] text-white p-6 m-4 rounded-lg pb-8`}>
          <DialogTitle className="text-xl font-semibold text-white">
            {renderTitle()}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">{renderDescription()}</p>
        </DialogHeader>

        {/* FORMULAIRE uniquement avant résultat */}
        {!result && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="px-6 pb-4 space-y-4">
              {/* Titre */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Titre..."
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Data */}
              <FormField
                control={form.control}
                name="limiteDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Données</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Données..."
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
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
                    <FormLabel>Priorité *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une priorité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="normale">Normale</SelectItem>
                        <SelectItem value="moyenne">Moyenne</SelectItem>
                        <SelectItem value="haute">Haute</SelectItem>
                        <SelectItem value="elevee">Élevée</SelectItem>
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
                    <FormLabel>Quantité *</FormLabel>
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

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description détaillée..."
                        className="resize-none"
                        rows={4}
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {"Enregistrement..."}
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
                  {"Fermer"}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {/* FOOTER pour les résultats */}
        {result && (
          <div className="flex justify-end gap-3 p-6 pt-0">
            {result === "error" && (
              <Button
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                onClick={handleRetry}
                disabled={isPending}
              >
                Réessayer
              </Button>
            )}
            <Button
              className="bg-gray-600 hover:bg-gray-700 text-white"
              onClick={() => onOpenChange(false)}
            >
              Fermer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}