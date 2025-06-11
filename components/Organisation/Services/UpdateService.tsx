"use client"

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
    Button
} from "@/components/ui/button"
import {
    Form,
    FormControl,
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
import {
    Textarea
} from "@/components/ui/textarea"
import { MultiSelectUsers } from "./MultiSelect"
import { Service, users } from "@/lib/data"
import { Loader } from "lucide-react"
import { useTransition } from "react"

const userSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    role: z.string(),
    status: z.string(),
    lastConnection: z.string(),
    service: z.string(),
    poste: z.string(),
    dateCreation: z.string()
});

const formSchema = z.object({
    name: z.string().min(1).min(3),
    manager: z.string().min(1),
    department: z.string().min(1),
    description: z.string().min(0).optional(),
    members: z.array(userSchema).optional()
});

interface Props {
    service: Service
}

export default function UpdateServices({ service }: Props) {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: service.name,
            manager: service.manager,
            department: service.department,
            description: service.description,
            members: users.filter(x => service.member.includes(String(x.id)))
        },
    })

    const [isPending, startTransition] = useTransition()

     const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(() => {
      try {
        console.log(values)
        toast.success('Service créé avec succès')
        // ici tu peux faire un appel API ou une redirection
      } catch (error) {
        console.error('Form submission error', error)
        toast.error('Erreur lors de la création du service')
      }
    })
  }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-[440px] w-full mx-auto py-10">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom du service</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="ex. Affaires légales"

                                    type="text"
                                    {...field} />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="manager"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Chef de service</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner le chef" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {
                                        users.map((x, i) => {
                                            return (
                                                <SelectItem key={i} value={String(x.id)}>{x.name}</SelectItem>
                                            )
                                        })
                                    }
                                </SelectContent>
                            </Select>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Département</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner le département" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="m@example.com">m@example.com</SelectItem>
                                    <SelectItem value="m@google.com">m@google.com</SelectItem>
                                    <SelectItem value="m@support.com">m@support.com</SelectItem>
                                </SelectContent>
                            </Select>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Description brève du service"
                                    className="resize-none"
                                    {...field}
                                    rows={4}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="members"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Membre du service</FormLabel>
                            <FormControl>
                                <MultiSelectUsers
                                    label=""
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Trouver un utilisateur"
                                    users={users}
                                />
                            </FormControl>
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
                    {"Modifier"}
                </Button>
            </form>
        </Form>
    )
}