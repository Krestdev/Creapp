"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { MultiSelect } from "./MultiSelect"
import { FileUpload } from "./FileUpload"
import { useForm } from "react-hook-form"
import { Textarea } from "../ui/textarea"
import { MultiSelectUsers } from "../Organisation/Services/MultiSelect"
import { users } from "@/lib/data"
import { PieceJointeDialog } from "../Fournisseurs/PieceJointeDialog"
import { useState, useTransition } from "react"
import { toast } from "sonner"

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
    projectName: z.string().min(2, {
        message: "Le nom du projet doit contenir au moins 2 caractères.",
    }),
    client: z.string().min(2, {
        message: "Le nom du client doit contenir au moins 2 caractères.",
    }),
    description: z.string().optional(),
    address: z.string().optional(),
    projectManager: z.string({
        required_error: "Veuillez sélectionner un chef de projet.",
    }),
    teamMembers: z.array(userSchema).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    budget: z.string().optional(),
    documents: z.array(z.instanceof(File)).optional(),
})

interface PieceJointe {
    id: string
    nom: string
    fichier: File | null
}

export function AddProject() {
    const [piecesJointes, setPiecesJointes] = useState<PieceJointe[]>([])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            projectName: "",
            client: "",
            description: "",
            address: "",
            teamMembers: [],
            budget: "",
            documents: [],
        },
    })

    const [isPending, startTransition] = useTransition()

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        startTransition(() => {
            try {
                const finalValues = {
                    ...values,
                    pieceJointe: piecesJointes
                }
                console.log(finalValues)
                toast.success('Projet créé avec succès')
                // ici tu peux faire un appel API ou une redirection
            } catch (error) {
                console.error('Form submission error', error)
                toast.error('Erreur lors de la création du Projet')
            }
        })
    }

    return (
        <div className="max-w-[440px] w-full mx-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-[18px] font-medium font-sans leading-[125%] tracking-normal text-secondary">Informations générales</h2>
                        <FormField
                            control={form.control}
                            name="projectName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom du projet <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="ex. Excavation" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="client"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="ex. Mairie Douala Ve" {...field} />
                                    </FormControl>
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
                                        <Textarea className="h-[80px] resize-none" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Adresse</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ex. Mairie Douala Ve" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-[18px] font-medium font-sans leading-[125%] tracking-normal text-secondary">Equipe projet</h2>

                        <FormField
                            control={form.control}
                            name="projectManager"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Chef du projet <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un utilisateur" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={String(user.id)}>
                                                    {user.name}
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
                            name="teamMembers"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Membres</FormLabel>
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
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-[18px] font-medium font-sans leading-[125%] tracking-normal text-secondary">Echéances & budgétisation</h2>
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date de début <span className="text-red-500">*</span></FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Sélectionner une date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date() || date < new Date("1900-01-01")
                                                }
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date de fin <span className="text-red-500">*</span></FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Sélectionner une date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => {
                                                    const startDate = form.getValues("startDate");
                                                    return (startDate ? date < startDate : false) || date < new Date("1900-01-01");
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="budget"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Budget prévisionnel</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Montant" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="documents"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Documents</FormLabel>
                                <FormControl>
                                    <PieceJointeDialog
                                        piecesJointes={piecesJointes}
                                        onPiecesJointesChange={setPiecesJointes}
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
                        Créer le projet
                    </Button>
                </form>
            </Form>
        </div>
    )
}