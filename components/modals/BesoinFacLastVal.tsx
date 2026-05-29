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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import BeneficiairesList from "../besoin/AddBenef";
import FilesUpload from "../comp-547";

// ----------------------------------------------------------------------
// VALIDATION
// ----------------------------------------------------------------------

const today = new Date();
today.setHours(0, 0, 0, 0);

const SingleFileSchema = z
  .array(
    z.union([
      z.instanceof(File, { message: "Doit être un fichier valide" }),
      z.string(),
    ]),
  )
  .max(1, "Pas plus d'un document");

const formSchema = z.object({
  delai: z.date().min(today, "Le delai d'exécution doit être dans le futur"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  justificatif: SingleFileSchema,
  paytype: z.enum(["cash", "chq", "ov"], {
    required_error: "Sélectionner le moyen de payement",
    invalid_type_error: "Sélectionner le moyen de payement",
  }),
});

interface UpdateFacilitationRequestProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  requestData: RequestModelT;
  onSuccess?: () => void;
  users: User[];
}

export default function BesoinFacLastVal({
  open,
  setOpen,
  requestData,
  onSuccess,
  users,
}: UpdateFacilitationRequestProps) {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [beneficiairesList, setBeneficiairesList] = useState<
    { id: number; nom: string; montant: number }[]
  >([]);

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

  const beneficiary = users.find(
    (u) => u.id === Number(requestData.beneficiary),
  );

  // ----------------------------------------------------------------------
  // FORM INITIALISATION
  // ----------------------------------------------------------------------
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      delai: new Date(),
      justificatif: [],
      priority: requestData.priority || "medium",
      paytype: undefined,
    },
  });

  // ----------------------------------------------------------------------
  // INITIALISATION DES DONNÉES
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (requestData && open) {
      if (requestData.benFac?.list) {
        setBeneficiairesList(
          requestData.benFac.list.map((item: any) => ({
            id: item.id,
            nom: item.name,
            montant: item.amount,
          })),
        );
      }
      form.reset({
        paytype: undefined,
        delai: requestData.dueDate ? new Date(requestData.dueDate) : new Date(),
        justificatif: requestData.proof,
        priority: requestData.priority || "medium",
      });
    }
  }, [requestData, open, form]);

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
        paytype: values.paytype,
        dueDate: values.delai,
        proof: values.justificatif,
        amount: beneficiairesList.reduce((total, b) => total + b.montant, 0),
        priority: values.priority,
        benFac: {
          list: beneficiairesList.map((b) => ({
            id: b.id,
            name: b.nom,
            amount: b.montant,
          })),
        },
      },
    });
  }

  // ----------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{"Approbation"}</DialogTitle>
          <DialogDescription>
            {"Approuver la demande de facilitation existante"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 @min-[540px]/dialog:grid-cols-2 gap-3"
            id="fac-approval-form"
          >
            {/* TITRE - static */}
            <div className="grid gap-2">
              <Label>{"Titre"}</Label>
              <Input value={requestData.label || ""} disabled />
            </div>

            {/* BÉNÉFICIAIRE - static */}
            <div className="grid gap-2">
              <Label>{"Récepteur pour compte"}</Label>
              <Input
                disabled
                value={
                  beneficiary
                    ? `${beneficiary.firstName} ${beneficiary.lastName}`
                    : "--"
                }
              />
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
              <Label>{"Projet concerné"}</Label>
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
            <div className="grid gap-2 @min-[540px]/dialog:col-span-2">
              <Label>{"Description / Détail"}</Label>
              <Input value={requestData.description || ""} disabled />
            </div>

            {/* DELAI */}
            <FormField
              control={form.control}
              name="delai"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Date limite"}</FormLabel>
                  <FormControl>
                    <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
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
                          onSelect={(d) => {
                            field.onChange(d);
                            setOpenCalendar(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
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
                      <SelectItem value="low">Faible</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* MOYEN DE PAIEMENT */}
            <FormField
              control={form.control}
              name="paytype"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Moyen de paiement"}</FormLabel>
                  <FormControl>
                    <Select
                      defaultValue={
                        field.value ? String(field.value) : undefined
                      }
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Espèces</SelectItem>
                        <SelectItem value="chq">Chèque</SelectItem>
                        <SelectItem value="ov">Virement</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* LISTE DES BÉNÉFICIAIRES */}
            <div className="@min-[540px]/dialog:col-span-2">
              <BeneficiairesList
                onBeneficiairesChange={setBeneficiairesList}
                initialBeneficiaires={beneficiairesList}
                disabledName={true}
              />
            </div>

            {/* JUSTIFICATIF */}
            <FormField
              control={form.control}
              name="justificatif"
              render={({ field }) => (
                <FormItem className="@min-[540px]/dialog:col-span-2">
                  <FormLabel>{"Justificatif"}</FormLabel>
                  <FormControl>
                    <FilesUpload
                      value={field.value || []}
                      onChange={field.onChange}
                      name={field.name}
                      disabled={true}
                      acceptTypes="all"
                      multiple={false}
                      maxFiles={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                form="fac-approval-form"
              >
                {"Approuver la demande"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
