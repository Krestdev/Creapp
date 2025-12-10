"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DepartmentQueries } from "@/queries/departmentModule";
import { DepartmentUpdateInput, Provider } from "@/types/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { ProviderQueries } from "@/queries/providers";

const formSchema = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  address: z.string(),
  taxId: z.string(),
  rating: z.string(),
});

interface UpdateRequestProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  providerData: Provider | null;
  onSuccess?: () => void;
}

export default function UpdateProvider({
  open,
  setOpen,
  providerData,
  onSuccess,
}: UpdateRequestProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      taxId: "",
      rating: "",
    },
  });

  useEffect(() => {
    form.reset({
      name: providerData?.name || "",
      phone: providerData?.phone || "",
      email: providerData?.email || "",
      address: providerData?.address || "",
      taxId: providerData?.taxId || "",
      rating: providerData?.rating ? String(providerData.rating) : "",
      // Add other fields as necessary
    });
  }, [providerData, form]);

  // // Example provider list
  // const providers = [
  //   { id: 1, name: "John Doe" },
  //   { id: 2, name: "Anna Smith" },
  // ];

  const providersQuery = new ProviderQueries();
  const providers = useQuery({
    queryKey: ["providers"],
    queryFn: async () => providersQuery.getAll(),
  });

  const providerQueries = new ProviderQueries();
  const providerMutation = useMutation({
    mutationKey: ["providerUpdate"],
    mutationFn: async (data: Partial<Provider>) =>
      providerQueries.update(Number(providerData?.id), data),

    onSuccess: () => {
      toast.success("Besoin modifié avec succès !");
      setOpen(false);
      onSuccess?.();
    },

    onError: (e) => {
      console.error(e);
      toast.error("Une erreur est survenue lors de la modification.");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    providerMutation.mutate({
      name: values.name,
      phone: values.phone,
      email: values.email,
      address: values.address,
      taxId: values.taxId,
      rating: values.rating ? Number(values.rating) : undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[760px] w-full max-h-[90vh] p-0 gap-0 flex flex-col">
        {/* Header avec fond bordeaux - FIXE */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 shrink-0">
          <DialogTitle className="text-xl font-semibold text-white">
            Modifier le besoin
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            Modifiez les informations du besoin existant
          </p>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 p-6"
          >
            {/* LABEL */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter label" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DESCRIPTION */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DESCRIPTION */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DESCRIPTION */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional rating" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* TAXID */}
            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional tax ID" {...field} />
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
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SUBMIT */}
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
