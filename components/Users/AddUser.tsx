"use client"
import {
  useState,
  useTransition
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
import { Loader } from "lucide-react"

const formSchema = z
  .object({
    name: z.string().min(3, {
      message: "Veullez renseigner au moins 3 caractères"
    }),
    email: z.string().email({
      message: "Entrez une adresse email valide"
    }),
    password: z.string().min(8, {
      message: "Le mot de passe doit contenir au moins 8 caractères"
    }),
    passwordConfirm: z.string().min(8, {
      message: "La confirmation doit contenir au moins 8 caractères"
    }),
    role: z.string().min(1, {
      message: "Veuillez sélectionner un rôle"
    }),
    poste: z.string(),
    service: z.string()
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Les mots de passe ne correspondent pas"
  })

export default function AddUser() {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
      role: "",
      poste: "",
      service: "",
    }
  })
  const [isPending, startTransition] = useTransition()

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(() => {
      try {
        console.log(values)
        toast.success("Utilisateur créé avec succès",
          {
            description: "Un mail a été envoyé a l'adresse mail renseignée",
          },)
        // ici tu peux faire un appel API ou une redirection
      } catch (error) {
        console.error('Form submission error', error)
        toast.error('Erreur lors de la création du service')
      }
    })
  }

  return (
    <div className="max-w-[1024px] flex flex-col gap-14 px-7 py-6">
      <div className="flex flex-col gap-2 items-center justify-center">
        <h1>{"Creation d'utilisateur"}</h1>
        <p className="text-[#A1A1A1]">{"Pour creer un nouvel utilisateur, completez le formulaire ci-dessous"}</p>
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe<span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <PasswordInput placeholder="" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />


          <FormField
            control={form.control}
            name="passwordConfirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmer le mot de passe<span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <PasswordInput placeholder="" {...field} />
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
          <Button
            type='submit'
            className='w-full h-10'
            disabled={isPending}
          >
            {isPending && <Loader className='animate-spin mr-2' size={16} />}
            {"Créer l'utilisateur"}
          </Button>
        </form>
      </Form>
    </div>
  )
}