"use client"
import {
  useState
} from "react"
import {
  toast
} from "sonner"
import {
  useForm
} from "react-hook-form"
import {
  zodResolver
} from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  cn
} from "@/lib/utils"
import {
  Button
} from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Input
} from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { PasswordInput } from "../ui/password-input"

const formSchema = z
  .object({
    name: z.string().min(3, {
      message: "Veullez renseigner au moins 3 caractères"
    }),
    email: z.string().email({
      message: "Entrez une adresse email valide"
    }),
    role: z.string().min(1, {
      message: "Veuillez sélectionner un rôle"
    }),
    poste: z.string(),
    service: z.string()
  })

type User = {
  name: string,
  email: string,
  role: string,
  poste: string,
  service: string,
}

interface Props {
  user: User | undefined
}

export default function UpdateUser({ user }: Props) {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name,
      email: user?.email,
      role: user?.role,
      poste: user?.poste,
      service: user?.service,
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      toast.success("Utilisateur modifié avec succès",
        {
          description: "Un mail a été envoyé à votre l'adresse mail de l'utilisateur",
        },
      );
      
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <div className="max-w-[1024px] flex flex-col gap-14 px-7 py-6">
      <div className="flex flex-col gap-2 items-center justify-center">
        <h1>{"Modifier un utilisateur"}</h1>
        <p className="text-[#A1A1A1]">{"Modifiez les informations relatives a cet itilisateur"}</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3 mx-auto max-w-[440px] w-full">

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom<span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    placeholder="ex. John Doe"

                    type="text"
                    {...field} />
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
                <FormLabel>Adresse mail<span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    placeholder="ex johndoe@gmail.com"

                    type="email"
                    {...field} />
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
                <FormLabel>Rôle<span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectionner un role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="user">Utilisateur</SelectItem>
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
                <FormLabel>Intitulé du poste</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Attaché de direction"

                    type="text"
                    {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="service"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectionner un service" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="compta">Comptabilité</SelectItem>
                    <SelectItem value="info">Informatique</SelectItem>
                    <SelectItem value="marke">Marketing</SelectItem>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="h-10">{"Modifier un utilisateur"}</Button>
        </form>
      </Form>
    </div>
  )
}