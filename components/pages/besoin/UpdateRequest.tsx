"use client";
import { TableData } from "@/components/base/data-table";
import { SuccessModal } from "@/components/modals/success-modal";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/multi-select";
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
import { useStore } from "@/providers/datastore";
import { UserQueries } from "@/queries/baseModule";
import { ProjectQueries } from "@/queries/projectModule";
import { RequestQueries } from "@/queries/requestModule";
import { RequestModelT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronDownIcon, LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface BesoinsProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: TableData | null;
}

const formSchema = z.object({
  projet: z.string(),
  categorie: z.string(),
  souscategorie: z.string(),
  titre: z.string().min(1),
  description: z.string(),
  quantity: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Le montant doit être un nombre valide",
  }),
  unite: z.string().min(1).optional(),
  datelimite: z.date().optional(),
  name: z.number().optional(),
  beneficiaire: z.string().optional(),
});

const parseFrenchDate = (dateString: string): Date | undefined => {
  if (!dateString || dateString === "Non définie") return undefined;

  const cleanedDate = dateString.trim();
  const parts = cleanedDate.split("/");

  if (parts.length !== 3) return undefined;

  const [day, month, year] = parts.map((part) => parseInt(part, 10));

  if (isNaN(day) || isNaN(month) || isNaN(year)) return undefined;
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1000)
    return undefined;

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
};

const UpdateRequest = (props: BesoinsProps) => {
  const [openD, setOpenD] = useState(false);
  const { user } = useStore();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projet: "",
      categorie: "",
      souscategorie: "",
      titre: "",
      description: "",
      quantity: "",
      unite: "",
      datelimite: undefined,
    },
  });

  // Mettre à jour les valeurs du formulaire quand props.data change
  useEffect(() => {
    if (props.data) {
      const initialDate = parseFrenchDate(props.data.limiteDate || "");
      form.reset({
        projet: props.data.project || "",
        categorie: props.data.category || "",
        souscategorie: "",
        titre: props.data.title || "",
        description: props.data.description || "",
        quantity: props.data.quantite?.toString() || "",
        unite: props.data.unite || "",
        datelimite: initialDate,
        beneficiaire: props.data.beneficiaires || "",
      });
    }
  }, [props.data, form]);

  const request = new RequestQueries();
  const requestMutation = useMutation({
    mutationKey: ["requests"],
    mutationFn: async (
        data: Partial<RequestModelT>
    ) => {
        const id = props.data?.id;
        if (!id) throw new Error("ID de besoin manquant");
        await request.update(Number(id), data);
    },
    onSuccess: () => {
      toast.success("Besoin modifié avec succès !");
      props.setOpen(false);
    },
    onError: () => {
      toast.error("Une erreur est survenue.");
    },
  });

  const projects = new ProjectQueries();
  const projectsData = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      return projects.getAll();
    },
  });

  const users = new UserQueries();
  const usersData = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      return users.getAll();
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      requestMutation.mutate({
        label: values.titre,
        description: values.description || null,
        quantity: Number(values.quantity),
        unit: values.unite!,
        beneficiary: values.beneficiaire!,
        beficiaryList: null,
        state: "pending",
        proprity: "normal",
        userId: Number(user?.id),
        dueDate: values.datelimite || undefined,
        projectId: Number(values.projet),
      });
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={props.setOpen}>
      <DialogContent className="sm:max-w-[760px] w-full overflow-y-auto p-0 gap-0 overflow-x-hidden border-none">
        {/* Header with burgundy background */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative">
          <button
            onClick={() => props.setOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
          >
            <span className="sr-only">Close</span>
          </button>
          <DialogTitle className="text-xl font-semibold text-white">
            {"Modifier le besoin"}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">{""}</p>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 max-w-3xl mx-12 py-10"
          >
            <div className="max-w-[760px] w-full grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="projet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projet concerné</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un projet" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projectsData.data?.data.map((project) => (
                          <SelectItem
                            key={project.id}
                            value={project?.id!.toString()}
                          >
                            {project.label}
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
                name="categorie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="m@example.com">
                          m@example.com
                        </SelectItem>
                        <SelectItem value="m@google.com">
                          m@google.com
                        </SelectItem>
                        <SelectItem value="m@support.com">
                          m@support.com
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="souscategorie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sous-catégorie</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une sous-catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="m@example.com">
                          m@example.com
                        </SelectItem>
                        <SelectItem value="m@google.com">
                          m@google.com
                        </SelectItem>
                        <SelectItem value="m@support.com">
                          m@support.com
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="titre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ex. Achat du carburant groupe"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez le besoin"
                        className="resize-none"
                        {...field}
                      />
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
                    <FormLabel>Quantité</FormLabel>
                    <FormControl>
                      <Input placeholder="ex. 10" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unité</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Sélectionner l'unité"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="datelimite"
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
                            {field.value ? format(field.value, "PPP", { locale: fr }) : "Sélectionner une date"}
                            <ChevronDownIcon />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                        className="z-10"
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

              <FormField
                control={form.control}
                name="beneficiaire"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bénéficiaire</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue placeholder="Soi-même" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {usersData.data?.data.map((user) => (
                          <SelectItem key={user.id} value={user.id!.toString()}>
                            {`${user.name}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button disabled={requestMutation.isPending} type="submit">
              Modifier le besoin
              {requestMutation.isPending && (
                <LoaderIcon className="ml-2 h-4 w-4 animate-spin" />
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateRequest;