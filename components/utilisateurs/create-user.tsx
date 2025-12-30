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
import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TranslateRole } from "@/lib/utils";
import { UserQueries } from "@/queries/baseModule";
import { DepartmentQueries } from "@/queries/departmentModule";
import { ResponseT, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1),
  email: z.string().min(1),
  password: z
    .string()
    .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  cpassword: z.string(),
  phone: z.string().min(1),
  role: z.string(),
  poste: z.string().min(1),
  department: z.string().optional(),
});

export default function CreateUserForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      cpassword: "",
      phone: "",
      role: "",
      poste: "",
      department: "",
    },
  });

  // const router = useRouter();
  const queryClient = useQueryClient();
  const userQueries = new UserQueries();
  const deparmentQueries = new DepartmentQueries();
  const registerAPI = useMutation({
    mutationKey: ["registerNewUser"],
    mutationFn: (
      data: Omit<User, "status" | "lastConnection" | "role" | "members" | "id">
    ) => userQueries.create(data),
    onSuccess: (data: ResponseT<User>) => {
      toast.success("Utilisateur créé avec succès.");
      form.reset({
        name: "",
        email: "",
        password: "",
        cpassword: "",
        phone: "",
        role: "",
        poste: "",
        department: "",
      });
      queryClient.invalidateQueries({
        queryKey: ["usersList"],
        refetchType: "active",
      });
    },
    onError: (error: unknown) => {
      toast.error(
        "Une erreur est survenue lors de la creation de l'utilisateur."
      );
      console.error("Register error:", error);
    },
  });

  const roleData = useQuery({
    queryKey: ["roles"],
    queryFn: () => userQueries.getRoles(),
  });

  const departmentData = useQuery({
    queryKey: ["department"],
    queryFn: () => deparmentQueries.getAll(),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const data = {
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
        role: Number(values.role),
        post: values.poste,
        department: Number(values.department),
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
        className="max-w-3xl grid grid-cols-1 gap-6 @min-[640px]:grid-cols-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{"Nom"}</FormLabel>
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
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{"Rôle"}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl className="w-full">
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roleData.data?.data
                    .filter((role) => role.label !== "MANAGER")
                    .map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {TranslateRole(role.label)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

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
                <PasswordInput placeholder="Entrer Mot de passe" {...field} />
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
                <PasswordInput
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

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{"Département"}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={"0"}>
                <FormControl className="w-full">
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un département" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={"0"}>{"Pas de departement"}</SelectItem>
                  {departmentData.data?.data.map((department) => (
                    <SelectItem
                      key={department.id}
                      value={department.id.toString()}
                    >
                      {department.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />
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
