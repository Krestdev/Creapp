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
import { userQ } from "@/queries/baseModule";
import { ResponseT, Role, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import MultiSelectRole from "../base/multiSelectRole";

const formSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().min(1, { message: "Le nom est requis" }),
    email: z.string().email({ message: "L'adresse mail est requise" }),
    password: z.string().min(6, {
      message: "Le mot de passe doit contenir au moins 6 caractères",
    }),
    cpassword: z.string(),
    phone: z.string().min(1, { message: "Le numéro de téléphone est requis" }),
    role: z.array(z.number()).optional(),
    poste: z.string().min(1, { message: "Le poste est requis" }),
  })
  .refine((data) => data.password === data.cpassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["cpassword"],
  });

export default function CreateUserForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      cpassword: "",
      phone: "",
      role: [],
      poste: "",
    },
  });

  const [selectedRole, setSelectedRole] = useState<
    { id: number; label: string }[]
  >([]);

  // const router = useRouter();
  const registerAPI = useMutation({
    mutationFn: (
      data: Omit<
        User,
        "status" | "lastConnection" | "role" | "members" | "id"
      > & { role: Array<number> },
    ) => userQ.create(data),
    onSuccess: (data) => {
      toast.success(`Utilisateur ${data.data.firstName} créé avec succès`);
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        cpassword: "",
        phone: "",
        role: [],
        poste: "",
      });
      setSelectedRole([]);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const roleData = useQuery({
    queryKey: ["roles"],
    queryFn: () => userQ.getRoles(),
  });

  const ROLES =
    roleData?.data?.data.map((r: Role) => ({
      id: r.id!,
      label: r.label,
    })) || [];

  function onSubmit(values: z.infer<typeof formSchema>) {
    let data: Omit<
      User,
      "status" | "lastConnection" | "role" | "members" | "id"
    > & { role: Array<number> };
    if (!!values.role) {
      data = {
        firstName: values.firstName ?? "",
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phone: values.phone,
        role: values.role,
        post: values.poste,
      };
    } else {
      data = {
        firstName: values.firstName ?? "",
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phone: values.phone,
        role: [],
        post: values.poste,
      };
    }
    registerAPI.mutate(data);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-3xl grid grid-cols-1 gap-6 @min-[640px]:grid-cols-2"
      >
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{"Nom"}</FormLabel>
              <FormControl className="w-full">
                <Input placeholder="ex. Doe" type="" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{"Prénom"}</FormLabel>
              <FormControl className="w-full">
                <Input placeholder="ex. John" type="" {...field} />
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
              <FormLabel>{"Contact"}</FormLabel>
              <FormControl className="w-full">
                <Input placeholder="ex. 237657897434" type="" {...field} />
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
              <FormLabel>{"Adresse E-mail"}</FormLabel>
              <FormControl className="w-full">
                <Input
                  placeholder="ex. johndoe@gemail.com"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{"Mot de passe"}</FormLabel>
              <FormControl className="w-full">
                <Input
                  type="password"
                  placeholder="Entrer Mot de passe"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cpassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{"Confirmer le mot de passe"}</FormLabel>
              <FormControl className="w-full">
                <Input
                  type="password"
                  placeholder="Confirmer le mot de passe"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="poste"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{"Poste"}</FormLabel>
              <FormControl className="w-full">
                <Input
                  placeholder="ex. Attaché de direction"
                  type=""
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2 col-span-2">
          <FormLabel>{"Rôles *"}</FormLabel>
          <MultiSelectRole
            display="Role"
            roles={ROLES.filter(
              (r) => r.label !== "MANAGER" && r.label !== "USER",
            )}
            selected={selectedRole}
            onChange={(selected) => {
              setSelectedRole(selected);
              form.setValue(
                "role",
                selected.map((r) => r.id),
              );
            }}
          />
        </div>

        <Button
          variant={"primary"}
          type="submit"
          className="ml-auto @min-[640px]:col-span-2"
        >
          {"Enregistrer"}
        </Button>
      </form>
    </Form>
  );
}
