"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
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
import { useStore } from "@/providers/datastore";
import { newRequestApprovisionement, requestQ } from "@/queries/requestModule";
import {
  Category,
  PRIORITIES,
  ProjectT,
  RequestModelT,
  User,
} from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  users: Array<User>;
  categories: Array<Category>;
  projects: Array<ProjectT>;
  requestData?: RequestModelT; // Ajoutez le type approprié si nécessaire
}

const REQUEST_PRIORITIES = PRIORITIES.map((m) => m.value) as [
  (typeof PRIORITIES)[number]["value"],
  ...(typeof PRIORITIES)[number]["value"][],
];

const today = new Date();

const formSchema = z.object({
  label: z
    .string({ message: "Veuillez renseigner un titre" })
    .min(5, { message: "Trop court" })
    .max(50, { message: "Trop long" }),
  description: z.string({ message: "Veuillez renseigner une description" }),
  more: z.string().optional(),
  categoryId: z.coerce.number({
    message: "Veuillez sélectionner une catégorie",
  }),
  projectId: z.coerce.number({
    message: "Veuillez sélectionner un projet",
  }),
  amount: z.coerce.number({ message: "Veuillez renseigner un montant" }),
  dueDate: z.string({ message: "Veuillez définir une date" }).refine(
    (val) => {
      const d = new Date(val);
      return !isNaN(d.getTime()) && d >= today;
    },
    { message: "Date invalide" },
  ),
  priority: z.enum(REQUEST_PRIORITIES),
});

function BesoinLastApproVall({
  open,
  setOpen,
  users,
  categories,
  projects,
  requestData,
}: Props) {
  const { user } = useStore();
  const router = useRouter();

  const [dueDate, setDueDate] = React.useState<boolean>(false);

  const today = new Date();
  const defaultDate = new Date();
  defaultDate.setDate(today.getDate() + 7);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: requestData?.label || "Aprovisionement",
      description:
        requestData?.description ||
        "Aprovisionement Pour Carburent et Transport",
      amount: requestData?.amount || 100,
      dueDate: requestData?.dueDate
        ? format(new Date(requestData.dueDate), "yyyy-MM-dd")
        : format(defaultDate, "yyyy-MM-dd"),
      priority: requestData?.priority || "low",
      projectId: requestData?.projectId,
      categoryId:
        requestData?.categoryId ||
        categories.find((c) => c.type.type === "appro")?.id ||
        undefined,
      more: "",
    },
  });

  const validator = categories
    .find((cat) => cat.id === requestData?.categoryId)
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
    }) => {
      await requestQ.validate(id, validator?.id!, validator);
    },
    onSuccess: () => {
      toast.success("Besoin approuvé avec succès !");
    },
    onError: () => {
      toast.error("Erreur lors de la validation");
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: newRequestApprovisionement) =>
      requestQ.update(requestData?.id!, payload),
    onSuccess: () => {
      validateRequest.mutateAsync({
        id: requestData?.id!,
        validator: validator,
      });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const description =
      values.description === "Mission"
        ? values.description.concat(" - ", values.more ?? "")
        : values.description;
    mutate({
      label: values.label,
      description,
      unit: "FCFA",
      dueDate: new Date(values.dueDate),
      priority: "medium",
      amount: values.amount,
      categoryId: values.categoryId,
      projectId: values.projectId,
      quantity: 1,
      type: "appro",
      paytype: "cash",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[760px] max-h-[90vh] p-0 gap-0 flex flex-col">
        {/* Header - FIXE EN HAUT */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle>{"Validation de l'approvisionnement"}</DialogTitle>
          <DialogDescription>
            {"Validez les informations de l'approvisionnement"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4 grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Titre"}</FormLabel>
                    <FormControl>
                      <Input disabled placeholder="Ex. Carburant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Categorie"}</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={
                          field.value ? String(field.value) : undefined
                        }
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="min-w-60 w-full">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.filter((c) => c.type.type === "appro")
                            .length === 0 ? (
                            <SelectItem value="#" disabled>
                              {"Aucune catégorie enregistrée"}
                            </SelectItem>
                          ) : (
                            categories
                              .filter((c) => c.type.type === "appro")
                              .map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id.toString()}
                                >
                                  {category.label}
                                </SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="@min-[640px]:col-span-full">
                    <FormLabel isRequired>{"Motif"}</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex. Carburant" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project */}
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Project"}</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={
                          field.value ? String(field.value) : undefined
                        }
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="min-w-60 w-full">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.length === 0 ? (
                            <SelectItem value="#" disabled>
                              {"Aucun projet enregistré"}
                            </SelectItem>
                          ) : (
                            projects
                              .filter((x) => x.status !== "cancelled")
                              .map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id.toString()}
                                >
                                  {category.label}
                                </SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date limite de soumission */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => {
                  const selectedDate = field.value
                    ? new Date(field.value)
                    : undefined;

                  return (
                    <FormItem>
                      <FormLabel isRequired>{"Date limite"}</FormLabel>
                      <FormControl>
                        <div className="relative flex gap-2">
                          <Input
                            id={field.name}
                            value={field.value || ""}
                            placeholder="Sélectionner une date"
                            className="bg-background pr-10"
                            onChange={(e) => {
                              field.onChange(e.target.value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "ArrowDown") {
                                e.preventDefault();
                                setDueDate(true);
                              }
                            }}
                          />
                          <Popover open={dueDate} onOpenChange={setDueDate}>
                            <PopoverTrigger asChild>
                              <Button
                                id="date-picker"
                                type="button"
                                variant="ghost"
                                className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                              >
                                <CalendarIcon className="size-3.5" />
                                <span className="sr-only">
                                  {"Sélectionner une date"}
                                </span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto overflow-hidden p-0"
                              align="end"
                              alignOffset={-8}
                              sideOffset={10}
                            >
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                defaultMonth={selectedDate || today}
                                captionLayout="dropdown"
                                onSelect={(date) => {
                                  if (!date) return;
                                  const value = format(date, "yyyy-MM-dd");
                                  field.onChange(value);
                                  setDueDate(false);
                                }}
                                disabled={(date) => date <= new Date()}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Montant"}</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex. 100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Boutons - FIXE EN BAS */}
          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              {"Annuler"}
            </Button>
            <Button
              variant={"primary"}
              type="submit"
              disabled={isPending}
              isLoading={isPending}
              onClick={form.handleSubmit(onSubmit)}
            >
              {"Valider"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default BesoinLastApproVall;
