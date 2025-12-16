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
import { useStore } from "@/providers/datastore";
import { UserQueries } from "@/queries/baseModule";
import { LoginResponse, ResponseT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { NextResponse } from "next/server";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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

  const userQueries = new UserQueries();

  const loginAPI = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      userQueries.login(data),
    onSuccess: (data: ResponseT<LoginResponse>) => {
      const user = data.data.user;
      const res = NextResponse.json({ success: true, user });
      res.cookies.set("userRole", JSON.stringify(user.role), {
        httpOnly: true,
      });
      console.log("User roles set in cookies:", res.cookies.get("userRole"));
      login(data.data.user);
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
              <FormLabel>{"Adresse mail"}</FormLabel>
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
              <FormLabel>{"Mot de passe"}</FormLabel>
              <FormControl>
                <Input type="password" {...field} placeholder="*******" />
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
