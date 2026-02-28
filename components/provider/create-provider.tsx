"use client";
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
import { providerQ } from "@/queries/providers";
import { Provider } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import FilesUpload from "../comp-547";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { useState } from "react";

const SingleFileArray = z
  .array(
    z.union([
      z.instanceof(File, { message: "Doit être un fichier valide" }),
      z.string(),
    ]),
  )
  .max(1, "Pas plus d'un document")
  .nullable();

const formSchema = z.object({
  name: z.string().min(1),
  phone: z
    .string()
    .min(1)
    .refine((val) => !isNaN(Number(val)), {
      message: "Le numéro de téléphone doit contenir uniquement des chiffres",
    }),
  email: z.string().email(),
  address: z.string(),
  carte_contribuable: SingleFileArray,
  acf: SingleFileArray,
  expireAtacf: z.string({ message: "Veuillez définir une date" }).refine(
      (val) => {
        const d = new Date(val);
        const now = new Date();
        return !isNaN(d.getTime()) && d > now;
      },
      { message: "Date invalide" },
    ),
  expireAtcarte_contribuable: z.string({ message: "Veuillez définir une date" }).refine(
      (val) => {
        const d = new Date(val);
        const now = new Date();
        return !isNaN(d.getTime()) && d > now;
      },
      { message: "Date invalide" },
    ),
  plan_localisation: SingleFileArray,
  commerce_registre: SingleFileArray,
  expireAtplan_localisation: z.string({ message: "Veuillez définir une date" }).refine(
      (val) => {
        const d = new Date(val);
        const now = new Date();
        return !isNaN(d.getTime()) && d > now;
      },
      { message: "Date invalide" },
    ),
  expireAtcommerce_registre: z.string({ message: "Veuillez définir une date" }).refine(
      (val) => {
        const d = new Date(val);
        const now = new Date();
        return !isNaN(d.getTime()) && d > now;
      },
      { message: "Date invalide" },
    ),
  banck_attestation: SingleFileArray.optional(),
  expireAtbanck_attestation: z.string({ message: "Veuillez définir une date" }).refine(
      (val) => {
        const d = new Date(val);
        const now = new Date();
        return !isNaN(d.getTime()) && d > now;
      },
      { message: "Date invalide" },
    ).optional(),
  RCCM: z.string().optional(),
  NIU: z.string().optional(),
  regem: z.string().optional(),
});

export default function CreateProviderForm() {
  const [selectBankDate, setSelectBankDate] = useState<boolean>(false);
  const [selectACFDate, setSelectACFDate] = useState<boolean>(false);
  const [selectCarteDate, setSelectCarteDate] = useState<boolean>(false);
  const [selectPlanDate, setSelectPlanDate] = useState<boolean>(false);
  const [selectCommerceDate, setSelectCommerceDate] = useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      address: "",
      name: "",
      phone: "",
      carte_contribuable: [],
      acf: [],
      plan_localisation: [],
      commerce_registre: [],
      banck_attestation: [],
      expireAtbanck_attestation: format(new Date(), "yyyy-MM-dd"),
      expireAtacf: format(new Date(), "yyyy-MM-dd"),
      expireAtcarte_contribuable: format(new Date(), "yyyy-MM-dd"),
      expireAtplan_localisation: format(new Date(), "yyyy-MM-dd"),
      expireAtcommerce_registre: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const registerAPI = useMutation({
    mutationFn: (
      data: Omit<
        Provider,
        "status" | "lastConnection" | "role" | "members" | "id" | "createdAt"
      >,
    ) => providerQ.create(data),
    onSuccess: () => {
      toast.success("Fournisseur créé avec succès.");
      form.reset({
      email: "",
      address: "",
      name: "",
      phone: "",
      carte_contribuable: [],
      acf: [],
      plan_localisation: [],
      commerce_registre: [],
      banck_attestation: [],
      expireAtbanck_attestation: format(new Date(), "yyyy-MM-dd"),
      expireAtacf: format(new Date(), "yyyy-MM-dd"),
      expireAtcarte_contribuable: format(new Date(), "yyyy-MM-dd"),
      expireAtplan_localisation: format(new Date(), "yyyy-MM-dd"),
      expireAtcommerce_registre: format(new Date(), "yyyy-MM-dd"),
    })
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
      const data = {
        name: values.name,
        email: values.email,
        RCCM: values.RCCM,
        NIU: values.NIU,
        regem: values.regem,
        phone: values.phone,
        address: values.address,
        carte_contribuable: values.carte_contribuable?.[0],
        acf: values.acf?.[0],
        expireAtacf: new Date(values.expireAtacf),
        expireAtcarte_contribuable: new Date(values.expireAtcarte_contribuable),
        plan_localisation: values.plan_localisation?.[0],
        expireAtplan_localisation: new Date(values.expireAtplan_localisation),
        commerce_registre: values.commerce_registre?.[0],
        expireAtcommerce_registre: new Date(values.expireAtcommerce_registre),
        banck_attestation: values.banck_attestation?.[0] ?? undefined,
        expireAtbanck_attestation: values.expireAtbanck_attestation ? new Date(values.expireAtbanck_attestation) : undefined,
      };
      registerAPI.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="form-3xl">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Nom (Entreprise)"}</FormLabel>
              <FormControl className="w-full">
                <Input placeholder="ex. John Doe" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Numéro de téléphone"}</FormLabel>
              <FormControl className="w-full">
                <Input placeholder="ex. 695 555 555" type="number" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Adresse mail"}</FormLabel>
              <FormControl className="w-full">
                <Input placeholder="ex. johndoe@gemail.com" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Adresse"}</FormLabel>
              <FormControl className="w-full">
                <Input placeholder="ex. Boulevard de la Liberté" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="RCCM"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"RCCM"}</FormLabel>
              <FormControl className="w-full">
                <Input placeholder="RC/234/456/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="NIU"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"NIU"}</FormLabel>
              <FormControl className="w-full">
                <Input placeholder="QA123..." {...field} />
              </FormControl>
              <FormDescription>
                {"Numéro d'Identification Unique"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="regem"
          render={({ field }) => (
            <FormItem className="@min-[640px]:col-span-2">
              <FormLabel isRequired>{"Régime"}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full h-10! shadow-none! rounded! py-1">
                    <SelectValue placeholder="Sélectionner un Régime" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[
                    { id: 1, value: "Réel" },
                    { id: 2, value: "Simplifié" },
                  ].map((p) => (
                    <SelectItem key={p.id} value={p.value}>
                      {p.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Justificatif */}
        <FormField
          control={form.control}
          name="carte_contribuable"
          render={({ field }) => (
            <FormItem className="@min-[640px]:col-span-2">
              <FormLabel isRequired>{"Carte contribuable"}</FormLabel>
              <FormControl>
                <FilesUpload
                  value={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  acceptTypes="all"
                  multiple={false}
                  maxFiles={1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expireAtcarte_contribuable"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Date d'expiration Carte contribuable"}</FormLabel>
              <FormControl>
                <div className="relative flex gap-2">
                  <Input
                    id={field.name}
                    value={field.value}
                    placeholder="Sélectionner une date"
                    className="bg-background pr-10"
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setSelectCarteDate(true);
                      }
                    }}
                  />
                  <Popover open={selectCarteDate} onOpenChange={setSelectCarteDate}>
                    <PopoverTrigger asChild>
                      <Button
                        id="date-picker"
                        variant="ghost"
                        className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                      >
                        <CalendarIcon className="size-3.5" />
                        <span className="sr-only">{"Sélectionner une date"}</span>
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
                        selected={field.value ? new Date(field.value) : undefined}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          if (!date) return;
                          const value = format(date, "yyyy-MM-dd");
                          field.onChange(value);
                          setSelectCarteDate(false);
                        }}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Justificatif */}
        <FormField
          control={form.control}
          name="acf"
          render={({ field }) => (
            <FormItem className="@min-[640px]:col-span-2">
              <FormLabel isRequired>{"ACF"}</FormLabel>
              <FormControl>
                <FilesUpload
                  value={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  acceptTypes="all"
                  multiple={false}
                  maxFiles={1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
                  control={form.control}
                  name="expireAtacf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel isRequired>{"Date d'expiration de l'ACF"}</FormLabel>
                      <FormControl>
                        <div className="relative flex gap-2">
                          <Input
                            id={field.name}
                            value={field.value}
                            placeholder="Sélectionner une date"
                            className="bg-background pr-10"
                            onChange={(e) => {
                              field.onChange(e.target.value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "ArrowDown") {
                                e.preventDefault();
                                setSelectACFDate(true);
                              }
                            }}
                          />
                          <Popover open={selectACFDate} onOpenChange={setSelectACFDate}>
                            <PopoverTrigger asChild>
                              <Button
                                id="date-picker"
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
                                selected={
                                  field.value ? new Date(field.value) : undefined
                                }
                                captionLayout="dropdown"
                                onSelect={(date) => {
                                  if (!date) return;
                                  const value = format(date, "yyyy-MM-dd");
                                  field.onChange(value);
                                  setSelectACFDate(false);
                                }}
                                disabled={(date) => date < new Date()}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

        {/* Justificatif */}
        <FormField
          control={form.control}
          name="plan_localisation"
          render={({ field }) => (
            <FormItem className="@min-[640px]:col-span-2">
              <FormLabel isRequired>{"Plan de localisation"}</FormLabel>
              <FormControl>
                <FilesUpload
                  value={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  acceptTypes="all"
                  multiple={false}
                  maxFiles={1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expireAtplan_localisation"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Date d'expiration Plan de localisation"}</FormLabel>
              <FormControl>
                <div className="relative flex gap-2">
                  <Input
                    id={field.name}
                    value={field.value}
                    placeholder="Sélectionner une date"
                    className="bg-background pr-10"
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setSelectPlanDate(true);
                      }
                    }}
                  />
                  <Popover open={selectPlanDate} onOpenChange={setSelectPlanDate}>
                    <PopoverTrigger asChild>
                      <Button
                        id="date-picker"
                        variant="ghost"
                        className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                      >
                        <CalendarIcon className="size-3.5" />
                        <span className="sr-only">{"Sélectionner une date"}</span>
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
                        selected={field.value ? new Date(field.value) : undefined}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          if (!date) return;
                          const value = format(date, "yyyy-MM-dd");
                          field.onChange(value);
                          setSelectPlanDate(false);
                        }}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Justificatif */}
        <FormField
          control={form.control}
          name="commerce_registre"
          render={({ field }) => (
            <FormItem className="@min-[640px]:col-span-2">
              <FormLabel isRequired>{"registre de commerce"}</FormLabel>
              <FormControl>
                <FilesUpload
                  value={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  acceptTypes="all"
                  multiple={false}
                  maxFiles={1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expireAtcommerce_registre"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Date d'expiration Registre de commerce"}</FormLabel>
              <FormControl>
                <div className="relative flex gap-2">
                  <Input
                    id={field.name}
                    value={field.value}
                    placeholder="Sélectionner une date"
                    className="bg-background pr-10"
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setSelectCommerceDate(true);
                      }
                    }}
                  />
                  <Popover open={selectCommerceDate} onOpenChange={setSelectCommerceDate}>
                    <PopoverTrigger asChild>
                      <Button
                        id="date-picker"
                        variant="ghost"
                        className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                      >
                        <CalendarIcon className="size-3.5" />
                        <span className="sr-only">{"Sélectionner une date"}</span>
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
                        selected={field.value ? new Date(field.value) : undefined}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          if (!date) return;
                          const value = format(date, "yyyy-MM-dd");
                          field.onChange(value);
                          setSelectCommerceDate(false);
                        }}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Justificatif */}
        <FormField
          control={form.control}
          name="banck_attestation"
          render={({ field }) => (
            <FormItem className="@min-[640px]:col-span-2">
              <FormLabel>{"Attestation bancaire"}</FormLabel>
              <FormControl>
                <FilesUpload
                  value={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  acceptTypes="all"
                  multiple={false}
                  maxFiles={1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expireAtbanck_attestation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{"Date d'expiration de l'Attestation Bancaire"}</FormLabel>
              <FormControl>
                <div className="relative flex gap-2">
                  <Input
                    id={field.name}
                    value={field.value}
                    placeholder="Sélectionner une date"
                    className="bg-background pr-10"
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setSelectBankDate(true);
                      }
                    }}
                  />
                  <Popover open={selectBankDate} onOpenChange={setSelectBankDate}>
                    <PopoverTrigger asChild>
                      <Button
                        id="date-picker"
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
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          if (!date) return;
                          const value = format(date, "yyyy-MM-dd");
                          field.onChange(value);
                          setSelectBankDate(false);
                        }}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          variant={"primary"}
          className="@min-[640px]:col-span-2 w-fit ml-auto"
          type="submit"
        >
          {"Créer le fournisseur"}
        </Button>
      </form>
    </Form>
  );
}
