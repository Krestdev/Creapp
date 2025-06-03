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
import { useRouter } from "next/navigation"

const formSchema = z
    .object({
        password: z.string().min(8, {
            message: "Le mot de passe doit contenir au moins 8 caractères"
        }),
        passwordConfirm: z.string().min(8, {
            message: "La confirmation doit contenir au moins 8 caractères"
        }),
    })
    .refine((data) => data.password === data.passwordConfirm, {
        path: ["passwordConfirm"],
        message: "Les mots de passe ne correspondent pas"
    })

interface Props {
    userId: number
}

export default function SetPassword({userId}: Props) {

    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            passwordConfirm: "",
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            console.log(values);
            toast.success("Mot de passe modifié avec succès",
                {
                    description: "Un mail a été envoyé à votre l'adresse mail de l'utilisateur",
                },
            );
            router.push("/tableau-de-bord/utilisateurs")
        } catch (error) {
            console.error("Form submission error", error);
            toast.error("Failed to submit the form. Please try again.");
        }
    }

    return (
        <div className="max-w-[1024px] flex flex-col gap-14 px-7 py-6">
            <div className="flex flex-col gap-2 items-center justify-center">
                <h1>{"Changer le mot de passe"}</h1>
                <p className="text-[#A1A1A1]">{"complétez ce formulaire pour mettre a jour le mot de passe"}</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3 mx-auto max-w-[440px] w-full">
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
                    <Button type="submit" className="h-10">{"Modifier le mot de passe"}</Button>
                </form>
            </Form>
        </div>
    )
}