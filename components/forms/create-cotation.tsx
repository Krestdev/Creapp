"use client";
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
import { cn } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { requestQ } from "@/queries/requestModule";
import { CommandRequestT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Besoins from "../bdcommande/besoins";
import { SuccessModal } from "../modals/success-modal";

const formSchema = z.object({
  name: z.string().min(1, "Le nom est obligatoire"),
  // telephone qui doit etre uniquement les chiffres
  telephone: z
    .string()
    .min(1, "Le numéro de téléphone est obligatoire")
    .refine((val) => !isNaN(Number(val)), {
      message: "Le numéro de téléphone doit contenir uniquement des chiffres",
    }),
  titre: z.string().min(1, "Le titre est obligatoire"),
  date_limite: z.coerce.date(),
});

interface Request {
  id: number;
  name: string;
  dueDate?: Date;
}

export default function CreateCotationForm() {
  const { user } = useStore();
  const [selected, setSelected] = useState<Request[]>([]);
  const [successOpen, setSuccessOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      telephone: "",
      titre: "",
      date_limite: new Date(),
    },
  });

  const createCommand = useMutation({
    mutationFn: (
      data: Omit<
        CommandRequestT,
        "id" | "createdAt" | "updatedAt" | "reference" | "besoins"
      >,
    ) => commandRqstQ.create(data),
    onSuccess: () => {
      setSuccessOpen(true);
      // Invalider TOUTES les requêtes pertinentes
      form.reset();
    },
    onError: () => {
      toast.error(
        "Une erreur est survenue lors de la création de la cotation.",
      );
    },
  });

  const requestData = useQuery({
    queryKey: ["requests"],
    queryFn: () => requestQ.getAll(),
  });

  const commandData = useQuery({
    queryKey: ["commands"],
    queryFn: async () => commandRqstQ.getAll(),
  });

  const cotation = commandData.data?.data ?? [];

  const besoinCommandes =
    cotation.flatMap((item) => item.besoins?.flatMap((b) => b.id)) ?? [];
  const filteredData =
    requestData.data?.data.filter(
      (item) => !besoinCommandes.includes(item.id),
    ) ?? [];

  // map request to Request Type {id: number, name: string}
  const requests =
    filteredData
      .filter((x) => x.categoryId !== 0 && x.state === "validated")
      .map((item) => ({
        id: item.id,
        name: item.label,
        dueDate: item.dueDate,
      })) ?? [];

  // Fonction pour gérer la sélection des besoins

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (selected.length === 0) {
        toast.error("Veuillez choisir au moins un besoin.");
        return;
      }
      const data = {
        name: values.name,
        phone: values.telephone,
        title: values.titre,
        requests: selected.map((item) => item.id),
        dueDate: values.date_limite,
        userId: Number(user?.id),
        deliveryDate: new Date(),
      };
      createCommand.mutate(data);
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 pb-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 max-w-3xl"
          >
            <FormField
              control={form.control}
              name="titre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl className="w-full">
                    <Input
                      placeholder="ex. Fournitures pour Cédric et Samuel en Papier et stylos"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_limite"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{"Date limite de soumission"}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl className="w-full">
                        <Button
                          type="button"
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: fr })
                          ) : (
                            <span>Choisir une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-4 border rounded-md bg-gray-50 p-4">
              <h2>{"Contact pricipal"}</h2>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl className="w-[320px]">
                      <Input placeholder="ex. Cédric" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de téléphone</FormLabel>
                    <FormControl className="w-[320px]">
                      <Input placeholder="ex. 06 12 34 56 78" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <div className="flex flex-col gap-4 w-full border border-gray-200 rounded-md p-4">
          <p className="text-[18px] font-semibold">{`Besoins (${requests.length})`}</p>
          <Besoins selected={selected} setSelected={setSelected} />
        </div>
      </div>
      <div className="w-full flex justify-end">
        <Button
          variant={"primary"}
          onClick={form.handleSubmit(onSubmit)}
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Création..." : "Créer la demande"}
        </Button>
      </div>
      <SuccessModal
        open={successOpen}
        onOpenChange={setSuccessOpen}
        message="Demande de cotation créée avec succès."
      />
    </div>
  );
}
