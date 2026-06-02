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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { queryKeys } from "@/lib/query-keys";
import { categoryQ } from "@/queries/categoryModule";
import { projectQ } from "@/queries/projectModule";
import { requestQ } from "@/queries/requestModule";
import { RequestModelT, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import MultiSelectUsers from "../base/multiSelectUsers";
import FilesUpload from "../comp-547";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// ----------------------------------------------------------------------
// VALIDATION
// ----------------------------------------------------------------------

const today = new Date();
today.setHours(0, 0, 0, 0);

const formSchema = z.object({
  periode: z
    .object({
      from: z.date({ required_error: "La date de début est requise" }),
      to: z.date({ required_error: "La date de fin est requise" }),
    })
    .refine((data) => data.from <= data.to, {
      message:
        "La date de début doit être antérieure ou égale à la date de fin",
      path: ["from"],
    })
    .optional(), // @jason You have to look at this
  montant: z.coerce.number({ message: "Veuillez renseigner un montant" }),
  date_limite: z.date().min(today, "La date limite doit être dans le futur"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

interface BesoinRHLastValProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  requestData: RequestModelT;
  onSuccess?: () => void;
  users: User[];
}

export default function BesoinRHLastVal({
  open,
  setOpen,
  requestData,
  onSuccess,
  users,
}: BesoinRHLastValProps) {
  const USERS =
    users
      .filter((u) => u.verified)
      .map((u) => ({
        id: u.id!,
        name: u.firstName + " " + u.lastName,
      })) || [];

  const periodValue =
    requestData.period && requestData.period?.from && requestData.period?.to
      ? {
          from: requestData.period.from
            ? new Date(requestData.period.from)
            : new Date(),
          to: requestData.period.to
            ? new Date(requestData.period.to)
            : new Date(),
        }
      : { from: new Date(), to: new Date() };

  const getCategory = useQuery({
    queryKey: queryKeys.category(requestData.categoryId!),
    queryFn: () => categoryQ.getCategory(requestData.categoryId!),
    enabled: !!requestData.categoryId,
  });

  const getProject = useQuery({
    queryKey: queryKeys.project(requestData.projectId!),
    queryFn: () => projectQ.getOne(requestData.projectId!),
    enabled: !!requestData.projectId,
  });

  // ----------------------------------------------------------------------
  // FORM INITIALISATION
  // ----------------------------------------------------------------------
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      montant: requestData.amount ?? 0,
      periode: { from: requestData.period?.from, to: requestData.period?.to },
      date_limite: requestData.dueDate,
      priority: requestData.priority,
    },
  });

  // ----------------------------------------------------------------------
  // INITIALISATION DES DONNÉES
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (requestData && open && USERS.length > 0) {
      const initializeForm = async () => {
        try {
          form.reset({
            montant: requestData.amount,
            date_limite: requestData.dueDate
              ? new Date(requestData.dueDate)
              : new Date(),
            priority: requestData.priority,
          });
        } catch (error) {
          console.error(
            "Erreur lors de l'initialisation du formulaire:",
            error,
          );
          toast.error("Erreur lors du chargement des données");
        }
      };

      initializeForm();
    }
  }, [requestData, open, USERS.length, form]);

  // ----------------------------------------------------------------------
  // MUTATION
  // ----------------------------------------------------------------------
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
      setOpen(false);
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erreur lors de la validation");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!requestData?.id) {
      toast.error("ID de la demande manquant");
      return;
    }
    validateRequest.mutate({
      id: requestData.id,
      request: {
        amount: Number(values.montant),
        dueDate: values.date_limite,
        priority: values?.priority || "medium",
      },
    });
  }

  console.log(form.formState.errors);

  // ----------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"secondary"}>
          <DialogTitle>{"Approbation"}</DialogTitle>
          <DialogDescription>
            {"Validez les informations du besoin en ressources humaines"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 @min-[540px]/dialog:grid-cols-2 gap-3"
            id="rh-approval-form"
          >
            {/* TITRE - static */}
            <div className="grid gap-2">
              <Label>{"Titre"}</Label>
              <Input value={requestData.label || ""} disabled />
            </div>

            {/* CATÉGORIE - static */}
            <div className="grid gap-2">
              <Label>{"Catégorie"}</Label>
              <Input
                disabled
                value={
                  getCategory.isLoading
                    ? "..chargement"
                    : getCategory.data
                      ? getCategory.data.data.label
                      : "--"
                }
              />
            </div>

            {/* PROJET - static */}
            <div className="grid gap-2">
              <Label>{"Projet"}</Label>
              <Input
                disabled
                value={
                  getProject.isLoading
                    ? "..chargement"
                    : getProject.data
                      ? getProject.data.data.label
                      : "--"
                }
              />
            </div>

            {/* DESCRIPTION - static */}
            <div className="grid gap-2">
              <Label>{"Description détaillée"}</Label>
              <Input value={requestData.description || ""} disabled />
            </div>

            {/* PERIODE - RANGE */}
            <div className="w-full grid gap-2">
              <Label>{"Période"}</Label>
              <Input
                value={`${format(periodValue.from, "PPP", { locale: fr })} - ${format(periodValue.to, "PPP", { locale: fr })}`}
                disabled
              />
            </div>

            {/* DATE LIMITE */}
            <FormField
              control={form.control}
              name="date_limite"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel isRequired>{"Date limite"}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild className="h-10 w-full">
                      <FormControl>
                        <Button
                          type="button"
                          variant={"outline"}
                          className="w-full pl-3 text-left font-normal"
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
                        disabled={(date) => date <= new Date()}
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* MONTANT */}
            <FormField
              control={form.control}
              name="montant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Montant"}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex. 500 000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PRIORITÉ */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Priorité"}</FormLabel>
                  <Select
                    {...field}
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choisir une priorité" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">{"Faible"}</SelectItem>
                      <SelectItem value="medium">{"Moyenne"}</SelectItem>
                      <SelectItem value="high">{"Haute"}</SelectItem>
                      <SelectItem value="urgent">{"Urgente"}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* BÉNÉFICIAIRE(S) */}
            <div className="w-full grid gap-2">
              <Label>{"Bénéficiaire"}</Label>
              <MultiSelectUsers
                disabled
                users={USERS}
                selected={USERS.filter((u) =>
                  requestData.benef?.includes(u.id),
                )}
                onChange={() => {}}
                display={"user"}
              />
            </div>

            {/* JUSTIFICATIF */}
            <div className="w-full grid gap-2">
              <Label>{"Justificatif"}</Label>
              <FilesUpload
                disabled
                value={requestData.proof}
                onChange={() => {}}
                name={"proof"}
                acceptTypes="all"
                multiple={false}
                maxFiles={1}
              />
            </div>

            <DialogFooter className="@min-[540px]/dialog:col-span-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {"Annuler"}
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={validateRequest.isPending}
                variant={"success"}
                isLoading={validateRequest.isPending}
                form="rh-approval-form"
              >
                {"Valider"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
