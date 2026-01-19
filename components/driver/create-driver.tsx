"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Driver, ResponseT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import FilesUpload from "../comp-547";
import { driverQ } from "@/queries/driver";

type FileValue = File | string;

const FileSchema = z.union([z.instanceof(File), z.string()]).nullable();

const formSchema = z.object({
  firstName: z.string().min(1, "Le nom est obligatoire"),
  lastName: z.string().min(1, "Le nom est obligatoire"),
  idCard: FileSchema,
  licence: FileSchema,
});

export default function CreateDriverForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      idCard: "",
      licence: "",
    },
  });

  const registerAPI = useMutation({
    mutationFn: (
      data: Omit<
        Driver,
        "status" | "lastConnection" | "role" | "members" | "id" | "createdAt"
      >,
    ) => driverQ.create(data),
    onSuccess: (data: ResponseT<Driver>) => {
      toast.success("Fournisseur créé avec succès.");
    },
    onError: (error: any) => {
      toast.error(
        "Une erreur est survenue lors de la creation du fournisseur.",
      );
      console.error("Register error:", error);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Préparer les données pour l'API
      const updateData: Omit<Driver, "id"> = {
        firstName: values.firstName,
        lastName: values.lastName,
      };

      // Ajouter les champs optionnels s'ils ont une valeur
      if (values.idCard) updateData.idCard = values.idCard;
      if (values.licence) updateData.licence = values.licence;

      registerAPI.mutate(updateData);
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  // Fonction pour gérer les changements de fichiers
  const handleFileChange = (
    field: any,
    value: FileValue | FileValue[] | null,
  ) => {
    if (Array.isArray(value)) {
      field.onChange(value[0] || null);
    } else {
      field.onChange(value);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="form-3xl">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nom "
                  {...field}
                  disabled={registerAPI.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Nom */}
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pre Nom</FormLabel>
              <FormControl>
                <Input
                  placeholder="prenom"
                  {...field}
                  disabled={registerAPI.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ACF */}
        <FormField
          control={form.control}
          name="licence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Driver Licence</FormLabel>
              <FormControl>
                <FilesUpload
                  value={field.value ? [field.value] : []}
                  onChange={(value) => handleFileChange(field, value)}
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

        {/* ACF */}
        <FormField
          control={form.control}
          name="idCard"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Card</FormLabel>
              <FormControl>
                <FilesUpload
                  value={field.value ? [field.value] : []}
                  onChange={(value) => handleFileChange(field, value)}
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
