"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { number, z } from "zod";
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
import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ResponseT, Provider } from "@/types/types";
import { DepartmentQueries } from "@/queries/departmentModule";
import { ProviderQueries } from "@/queries/providers";

const formSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().min(1),
  address: z.string(),
  taxId: z.string().min(1),
  rating: z.string().min(1),
});

export default function CreateProviderForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const providerQueries = new ProviderQueries();
  const registerAPI = useMutation({
    mutationKey: ["registerNewProvider"],
    mutationFn: (
      data: Omit<
        Provider,
        "status" | "lastConnection" | "role" | "members" | "id" | "createdAt"
      >
    ) => providerQueries.create(data),
    onSuccess: (data: ResponseT<Provider>) => {
      toast.success("Inscription réussie !");
      console.log("Register successful:", data);
    },
    onError: (error: any) => {
      console.error("Register error:", error);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const data = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        taxId: values.taxId,
        rating: Number(values.rating),
      };
      registerAPI.mutate(data);
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl py-10"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>name</FormLabel>
              <FormControl className="w-full">
                <Input placeholder="ex. John Doe" type="" {...field} />
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
              <FormLabel>phone</FormLabel>
              <FormControl className="w-full">
                <Input placeholder="ex. John Doe" type="" {...field} />
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
              <FormLabel>Adresse email</FormLabel>
              <FormControl className="w-full">
                <Input
                  placeholder="ex. johndoe@gemail.com"
                  type=""
                  {...field}
                />
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
              <FormLabel>Adresse</FormLabel>
              <FormControl className="w-full">
                <Input placeholder="ex. 123 Rue de la Paix" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="taxId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numéro de taxe</FormLabel>
              <FormControl className="w-full">
                <Input placeholder="ex. 123456789" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Évaluation</FormLabel>
              <FormControl className="w-full">
                <Input placeholder="ex. 4.5" type="number" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Créer le fournisseur</Button>
      </form>
    </Form>
  );
}
