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
import { Provider, ResponseT } from "@/types/types";
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

const SingleFileArray = z
  .array(
    z.union([
      z.instanceof(File, { message: "Doit être un fichier valide" }),
      z.string(),
    ])
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
  email: z.string().min(1),
  address: z.string(),
  carte_contribuable: SingleFileArray,
  acf: SingleFileArray,
  plan_localisation: SingleFileArray,
  commerce_registre: SingleFileArray,
  banck_attestation: SingleFileArray,
  RCCM: z.string().optional(),
  NIU: z.string().optional(),
  regem: z.string().optional(),
});

export default function CreateProviderForm() {
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
    },
  });

  const registerAPI = useMutation({
    mutationKey: ["registerNewProvider"],
    mutationFn: (
      data: Omit<
        Provider,
        "status" | "lastConnection" | "role" | "members" | "id" | "createdAt"
      >
    ) => providerQ.create(data),
    onSuccess: (data: ResponseT<Provider>) => {
      toast.success("Fournisseur créé avec succès.");
      console.log("Register successful:", data);
    },
    onError: (error: any) => {
      toast.error(
        "Une erreur est survenue lors de la creation du fournisseur."
      );
      console.error("Register error:", error);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
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
        plan_localisation: values.plan_localisation?.[0],
        commerce_registre: values.commerce_registre?.[0],
        banck_attestation: values.banck_attestation?.[0],
      };
      registerAPI.mutate(data);
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
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
            <FormItem className="col-span-2">
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

        {/* Justificatif */}
        <FormField
          control={form.control}
          name="acf"
          render={({ field }) => (
            <FormItem className="col-span-2">
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

        {/* Justificatif */}
        <FormField
          control={form.control}
          name="plan_localisation"
          render={({ field }) => (
            <FormItem className="col-span-2">
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

        {/* Justificatif */}
        <FormField
          control={form.control}
          name="commerce_registre"
          render={({ field }) => (
            <FormItem className="col-span-2">
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

        {/* Justificatif */}
        <FormField
          control={form.control}
          name="banck_attestation"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel isRequired>{"Attestation bancaire"}</FormLabel>
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
