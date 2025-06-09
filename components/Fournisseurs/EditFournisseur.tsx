"use client"

import React, { useState, useEffect } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { Fournisseur } from '@/lib/data'
import { PieceJointeDialog } from './PieceJointeDialog'

// Schema Zod
const fournisseurSchema = z.object({
    name: z.string().min(2, {
        message: "Le nom doit contenir au moins 2 caractères.",
    }),
    activities: z.array(z.string()).min(1, {
        message: "Au moins un secteur d'activité doit être sélectionné.",
    }),
    type: z.string().min(1, {
        message: "Le type de fournisseur est requis.",
    }),
    proprietaire: z.string().min(2, {
        message: "Le nom du contact principal doit contenir au moins 2 caractères.",
    }),
    tel: z.string().min(8, {
        message: "Le numéro de téléphone doit être valide.",
    }),
    adresse: z.string().min(5, {
        message: "L'adresse doit contenir au moins 5 caractères.",
    }),
    mail: z.string().email({
        message: "Adresse email invalide.",
    }).optional().or(z.literal("")),
    nui: z.string().optional(),
    registreFiscal: z.string().optional(),
    registreCommerce: z.string().optional(),
    banque: z.string().optional(),
    nuCompte: z.string().optional(),
    codeBanque: z.string().optional(),
    note: z.string().optional(),
    pieceJointe: z.array(z.string()).optional(),
})

type FournisseurFormValues = z.infer<typeof fournisseurSchema>

// Secteurs d'activité disponibles
const secteursActivite = [
    "Électronique",
    "Plomberie",
    "Agriculture",
    "Agroalimentaire",
    "Automobile",
    "BTP",
    "Chimie",
    "Commerce",
    "Énergie",
    "Finance",
    "Immobilier",
    "Informatique",
    "Logistique",
    "Santé",
    "Services",
    "Textile",
    "Transport",
]

// Types de fournisseur
const typesFournisseur = [
    "Distributeur",
    "Fabricant",
    "Grossiste",
    "Importateur",
    "Prestataire de services",
]

// Interface pour les pièces jointes
interface PieceJointe {
    id: string
    nom: string
    fichier: File | null
    url?: string
}

interface FournisseurFormProps {
    fournisseur?: Fournisseur
}

export default function EditFournisseur({ fournisseur }: FournisseurFormProps) {
    const [selectedActivities, setSelectedActivities] = useState<string[]>([])
    const [piecesJointes, setPiecesJointes] = useState<PieceJointe[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<FournisseurFormValues>({
        resolver: zodResolver(fournisseurSchema),
        defaultValues: {
            name: "",
            activities: [],
            type: "",
            proprietaire: "",
            tel: "",
            adresse: "",
            mail: "",
            nui: "",
            registreFiscal: "",
            registreCommerce: "",
            banque: "",
            nuCompte: "",
            codeBanque: "",
            note: "",
            pieceJointe: [],
        },
    })

    // Pré-remplir le formulaire si un fournisseur est passé en prop
    useEffect(() => {
        if (fournisseur) {
            form.reset(fournisseur)
            setSelectedActivities(fournisseur.activities || [])

            // Simuler le chargement des pièces jointes existantes
            if (fournisseur.pieceJointe) {
                setPiecesJointes(
                    fournisseur.pieceJointe.map((pj, index) => ({
                        id: `existing-${index}`,
                        nom: pj,
                        fichier: null,
                        url: `/pieces-jointes/${fournisseur.id}/${pj}`
                    }))
                )
            }
        }
    }, [fournisseur, form])

    const addActivity = (activity: string) => {
        if (!selectedActivities.includes(activity)) {
            const newActivities = [...selectedActivities, activity]
            setSelectedActivities(newActivities)
            form.setValue("activities", newActivities)
        }
    }

    const removeActivity = (activity: string) => {
        const newActivities = selectedActivities.filter(a => a !== activity)
        setSelectedActivities(newActivities)
        form.setValue("activities", newActivities)
    }

    async function onSubmit(values: FournisseurFormValues) {
        setIsLoading(true)
        try {
            // Simuler une requête API
            await new Promise(resolve => setTimeout(resolve, 1000))

            const finalValues = {
                ...values,
                id: fournisseur?.id || undefined,
                pieceJointe: piecesJointes.map(piece => piece.nom)
            }

            console.log("Données soumises:", finalValues)
        } catch (error) {
            console.error("Erreur lors de la mise à jour:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-[440px] w-full mx-auto bg-white">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Informations générales */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-[#002244]">Informations générales</h2>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">
                                        Nom du fournisseur <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="h-10"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="activities"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">
                                        Secteur(s) d'activité <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <div className="space-y-3">
                                        <Select onValueChange={addActivity}>
                                            <SelectTrigger className="h-12 border-gray-300">
                                                <SelectValue placeholder="Ajouter un secteur d'activité" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {secteursActivite
                                                    .filter(secteur => !selectedActivities.includes(secteur))
                                                    .map((secteur) => (
                                                        <SelectItem key={secteur} value={secteur}>
                                                            {secteur}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>

                                        {selectedActivities.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {selectedActivities.map((activity) => (
                                                    <Badge
                                                        key={activity}
                                                        variant="secondary"
                                                        className="bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer px-3 py-1"
                                                        onClick={() => removeActivity(activity)}
                                                    >
                                                        {activity}
                                                        <X className="ml-2 h-3 w-3" />
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">
                                        Type <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-12 border-gray-300">
                                                <SelectValue placeholder="Sélectionner le type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {typesFournisseur.map((type) => (
                                                <SelectItem key={type} value={type.toLowerCase()}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Coordonnées de contact */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-[#002244]">Coordonnées de contact</h2>

                        <FormField
                            control={form.control}
                            name="proprietaire"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">
                                        Nom du contact principal <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="h-10"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tel"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">
                                        Téléphone <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="h-10"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="adresse"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">
                                        Adresse complète <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="ex. Tradex Bonamoussadi"
                                            {...field}
                                            className="h-10"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="mail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="ex. johndoe@gmail.com"
                                            {...field}
                                            className="h-10"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Informations administratives & fiscales */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-[#002244]">Informations administratives & fiscales</h2>

                        <FormField
                            control={form.control}
                            name="nui"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">NIU</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="h-10"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="registreFiscal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">Regime Fiscal</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="h-10"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="registreCommerce"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">Registre de commerce</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="h-10"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Informations bancaires */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-[#002244]">Informations bancaires</h2>

                        <FormField
                            control={form.control}
                            name="banque"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">Banque</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="ex. Société Générale"
                                            {...field}
                                            className="h-10"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="nuCompte"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">Numéro de compte</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="h-10"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="codeBanque"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">Code banque</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="h-10"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Informations complémentaires */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-[#002244]">Informations complémentaires</h2>

                        <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            className="min-h-[120px0 resize-none"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div>
                            <label className="block text-gray-700 font-medium mb-3">Pièces jointes</label>
                            <PieceJointeDialog
                                piecesJointes={piecesJointes}
                                onPiecesJointesChange={setPiecesJointes}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-14 text-white font-medium text-lg"
                        disabled={isLoading}
                    >
                        {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
                    </Button>
                </form>
            </Form>
        </div>
    )
}