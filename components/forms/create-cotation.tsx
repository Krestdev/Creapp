"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import MultiSelectUsers from "../base/multiSelectUsers";
import { RequestQueries } from "@/queries/requestModule";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CommandQueries } from "@/queries/commandModule";
import { CommandRequestT } from "@/types/types";
import { useStore } from "@/providers/datastore";
import Besoins from "../pages/bdcommande/besoins";
import { SuccessModal } from "../modals/success-modal";

const formSchema = z.object({
  titre: z.string().min(1),
  requests: z.array(z.number()).min(1, {
    message: "Veuillez sélectionner au moins un besoin",
  }),
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
      titre: "",
      requests: [],
      date_limite: new Date(),
    },
  });

  const command = new CommandQueries();
  const createCommand = useMutation({
    mutationKey: ["command"],
    mutationFn: (data: CommandRequestT) => command.create(data),
    onSuccess: () => {
      setSuccessOpen(true);
    },
  });

  const request = new RequestQueries();
  const requestData = useQuery({
    queryKey: ["requests"],
    queryFn: () => request.getAll(),
  });

  const commandData = useQuery({
    queryKey: ["commands"],
    queryFn: async () => command.getAll(),
  });

  const cotation = commandData.data?.data ?? [];

  const besoinCommandes =
    cotation.flatMap((item) => item.besoins?.flatMap((b) => b.id)) ?? [];
  const filteredData =
    requestData.data?.data.filter(
      (item) => !besoinCommandes.includes(item.id)
    ) ?? [];

  // map request to Request Type {id: number, name: string}
  const requests =
    filteredData
      .filter((x) => x.state === "validated")
      .map((item) => ({
        id: item.id,
        name: item.label,
        dueDate: item.dueDate,
      })) ?? [];

  // Fonction pour gérer la sélection des besoins
  const handleRequestsChange = (list: Request[]) => {
    setSelected(list);

    form.setValue(
      "requests",
      list.map((u) => u.id),
      {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      }
    );
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      const data = {
        title: values.titre,
        requests: values.requests,
        dueDate: values.date_limite,
        userId: Number(user?.id),
        totalPrice: 0,
        modality: "",
        state: "pending",
        submited: false,
        justification: "",
      };
      createCommand.mutate(data);
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <div className="flex flex-row gap-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 max-w-3xl"
        >
          <FormField
            control={form.control}
            name="titre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre</FormLabel>
                <FormControl className="w-[320px]">
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
            name="requests"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{"Besoins"}</FormLabel>
                <FormControl className="h-fit">
                  <MultiSelectUsers
                    display="request"
                    users={requests}
                    selected={selected}
                    onChange={handleRequestsChange}
                    className="max-w-[320px] w-full h-9"
                  />
                </FormControl>
                <FormDescription>
                  {selected.length > 0
                    ? `${selected.length} besoin(s) sélectionné(s)`
                    : "Aucun besoin sélectionné"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date_limite"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{"Date limite de livraison"}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl className="w-full">
                      <Button
                        type="button"
                        variant={"outline"}
                        className={cn(
                          "w-[320px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
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

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Création..." : "Créer la demande"}
          </Button>
        </form>
      </Form>
      <div className="flex flex-col gap-4 w-full border border-gray-200 rounded-md p-4">
        <p className="text-[18px] font-semibold">{`Besoins (${requests.length})`}</p>
        <Besoins selected={selected} setSelected={setSelected} />
      </div>
      <SuccessModal
        open={successOpen}
        onOpenChange={setSuccessOpen}
        message="Demande de cotation créée avec succès."
      />
    </div>
  );
}
