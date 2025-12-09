"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserQueries } from "@/queries/baseModule";
import { User, User as UserT } from "@/types/types";
import { use, useEffect } from "react";

const formSchema = z.object({
  email: z.string(),
  name: z.string(),
  phone: z.string(),
  password: z.string(),
  projectId: z.number(),
  role: z.string(),
});

interface UpdateRequestProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  userData: UserT | null;
  onSuccess?: () => void;
}

export default function UpdateUser({
  open,
  setOpen,
  userData,
  onSuccess,
}: UpdateRequestProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      phone: "",
      password: "",
      projectId: undefined,
      role: "",
    },
  });

  useEffect(() => {
    form.reset({
      email: userData?.email || "",
      name: userData?.name || "",
      phone: userData?.phone,
      password: userData?.password,
    });
  }, [userData]);

  // // Example user list
  // const users = [
  //   { id: 1, name: "John Doe" },
  //   { id: 2, name: "Anna Smith" },
  // ];

  const usersQuery = new UserQueries();
  const users = useQuery({
    queryKey: ["users"],
    queryFn: async () => usersQuery.getAll(),
  });

  const userQueries = new UserQueries();
  const userMutation = useMutation({
    mutationKey: ["userUpdate"],
    mutationFn: async (data: Partial<UserT>) =>
      userQueries.update(Number(userData?.id), data),

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
    userMutation.mutate({
      email: values.email,
      name: values.name,
      phone: values.phone,
      password: values.password,
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
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* LABEL */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email" {...field} />
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
