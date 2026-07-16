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
import { Category, CommandRequestT, RequestModelT, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SearchableSelect } from "../base/searchableSelect";
import Besoins from "../bdcommande/besoins";
import { DetailOrder } from "../modals/detail-order";

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

interface Props {
  requests: Array<RequestModelT>;
  users: User[];
  // quotationRequests: Array<CommandRequestT>;
  categories: Array<Category>;
}

export default function CreateCotation({
  requests,
  users,
  // quotationRequests,
  categories,
}: Props) {
  const { user } = useStore();
  const [selected, setSelected] = useState<Request[]>([]);
  const [successOpen, setSuccessOpen] = useState(false);
  const [created, setCreated] = useState<CommandRequestT | null>(null);

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
    onSuccess: (res) => {
      console.log("Cotation created successfully", res.data);
      setCreated(res.data);
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

  // //Used requests
  // const usedRequests = quotationRequests.flatMap((item) =>
  //   item.besoins.flatMap((b) => b.id),
  // );
  // //Cleaned requests
  // // const filteredRequests = requests.filter(
  // //   (r) =>
  // //     !usedRequests.some((b) => b === r.id) &&
  // //     r.type === "achat" &&
  // //     r.state === "validated",
  // // );

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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 @min-[1280px]:grid-cols-3"
      >
        <div className="order-2 @min-[1280px]:order-0 grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2 place-items-start h-fit">
          <FormField
            control={form.control}
            name="titre"
            render={({ field }) => (
              <FormItem>
                <FormLabel isRequired>Titre</FormLabel>
                <FormControl>
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
              <FormItem>
                <FormLabel isRequired>{"Date limite de soumission"}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        type="button"
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal h-10",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: fr })
                        ) : (
                          <span>{"Choisir une date"}</span>
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
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="@min-[640px]:col-span-2 w-full p-3 rounded-sm border grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2 place-items-start">
            <h3 className="@min-[640px]:col-span-2">{"Contact principal"}</h3>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>Nom</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      value={field.value ? String(field.value) : ""}
                      onChange={field.onChange}
                      options={
                        users.map((r) => ({
                          value: `${r.firstName} ${r.lastName}`,
                          label: `${r.firstName} ${r.lastName}`,
                        })) ?? []
                      }
                      placeholder="Sélectionnez un nom"
                      width="w-full"
                      allLabel=""
                    />
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
                  <FormLabel isRequired>Numéro de téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="ex. 06 12 34 56 78" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="@min-[640px]:col-span-2 w-full inline-flex justify-end">
            <Button
              type="submit"
              variant={"primary"}
              disabled={createCommand.isPending}
              isLoading={createCommand.isPending}
            >
              {"Créer la demande"}
            </Button>
          </div>
        </div>

        <div className="@min-[1280px]:col-span-2 flex flex-col border rounded bg-white overflow-hidden max-h-[70vh]">
          <div className="overflow-y-auto p-4">
            <p className="text-[18px] font-semibold mb-4">{`Besoins (${requests.length})`}</p>
            <Besoins
              selected={selected}
              setSelected={setSelected}
              requests={requests}
              categories={categories}
            />
          </div>
        </div>

        <DetailOrder
          open={successOpen}
          onOpenChange={setSuccessOpen}
          data={created}
          message="Demande de cotation créée avec succès."
        />
      </form>
    </Form>
  );
}
