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
import { UserQueries } from "@/queries/baseModule";
import { DepartmentQueries } from "@/queries/departmentModule";
import { ResponseT, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1),
  email: z.string().min(1),
  password: z.string(),
  cpassword: z.string(),
  phone: z.string().min(1),
  role: z.string(),
  poste: z.string().min(1),
  department: z.string(),
});

export default function CreateUserForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const userQueries = new UserQueries();
  const deparmentQueries = new DepartmentQueries();
  const registerAPI = useMutation({
    mutationKey: ["registerNewUser"],
    mutationFn: (
      data: Omit<User, "status" | "lastConnection" | "role" | "members" | "id">
    ) => userQueries.create(data),
    onSuccess: (data: ResponseT<User>) => {
      toast.success("Inscription réussie !");
      console.log("Register successful:", data);
    },
    onError: (error: unknown) => {
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
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
              <FormLabel>cpassword</FormLabel>
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
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl className="w-full">
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roleData.data?.data.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.label}
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
          name="poste"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Intitulé du Poste</FormLabel>
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
              <FormLabel>Department</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={"0"}>
                <FormControl className="w-full">
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={"0"}> Pas de departement</SelectItem>
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
        <Button type="submit">Créer l’utilisateur</Button>
      </form>
    </Form>
  );
}
