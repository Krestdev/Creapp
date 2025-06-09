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
import { MultiSelectUsers } from "../Services/MultiSelect"
import { Department, services, users } from "@/lib/data"
import { MultiSelectService } from "./MultiSelectService"

const serviceSchema = z.object({
    id: z.number(),
    name: z.string(),
    manager: z.string(),
    department: z.string(),
    createdAt: z.string(),
    updateAt: z.string(),
    description: z.string(),
    member: z.string(),
});

const formSchema = z.object({
    name: z.string().min(1).min(3),
    manager: z.string().min(1),
    description: z.string().min(0).optional(),
    service: z.array(serviceSchema).optional()
});

interface Props {
    depart: Department | undefined
}

export default function UpdateDepartment({ depart }: Props) {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: depart?.name,
            manager: depart?.manager,
            description: depart?.description,
            service: services
                .filter(x => depart?.service.includes(String(x.id)))
                .map(x => ({
                    ...x,
                    member: Array.isArray(x.member) ? x.member.join(", ") : x.member
                }))
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            console.log(values);
            toast.success("Service créé avec succès");
        } catch (error) {
            console.error("Form submission error", error);
            toast.error("Erreur lors de la création du service");
        }
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
                    name="service"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Services associés</FormLabel>
                            <FormControl>
                                <MultiSelectService
                                    label=""
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Nom du service"
                                    services={services}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button className="w-full h-10" type="submit">{"Modifier"}</Button>
            </form>
        </Form>
    )
}