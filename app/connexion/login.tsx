"use client";
import React from "react";
import { useForm } from "react-hook-form";
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
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axiosConfig from "@/api/api";
import { User } from "@/types/types";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import useStore from "@/store/useUserStore";

const formSchema = z.object({
  email: z.string().email("Veuillez entrer un email valide"),
  password: z.string(),
});

function Login() {
  const router = useRouter();
  const { login } = useStore();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const axiosClient = axiosConfig();

  const loginAPI = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      // return axiosClient.post<{token:string; user:User}>("/api/login", data);
      return axiosClient.post<{
        message: string;
        data: { token: string; user: User };
      }>("/api/v1.0.0/base/user/login", data);
    },
    onSuccess: (data) => {
      toast.success("Connexion réussie !");
      console.log("Login successful:", data.data);
      login(data.data.data.user);
      router.push("/tableau-de-bord");
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      toast.error("Erreur de connexion, veuillez vérifier vos identifiants.");
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    loginAPI.mutate(data);
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-80 flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse mail</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="ex. jeanmichelatangana@betcreaconsult.com"
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
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant={"primary"}
          size={"lg"}
          disabled={loginAPI.isPending}
        >
          Se connecter{" "}
          {loginAPI.isPending && <Loader className="animate-spin" size={16} />}
        </Button>
      </form>
    </Form>
  );
}

export default Login;
