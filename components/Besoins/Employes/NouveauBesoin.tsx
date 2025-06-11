"use client"

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertCircle, ChevronLeft } from 'lucide-react';

// Schéma de validation pour l'étape 1
const step1Schema = z.object({
    type: z.string().min(1, "Le type est obligatoire"),
    titre: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
    projet: z.string().min(1, "Le projet est obligatoire"),
});

// Schéma de validation pour l'étape 2
const step2Schema = z.object({
    description: z.string().optional(),
    priorite: z.boolean(),
    cout: z.string().optional(),
    destination: z.string().optional(),
    dateDepart: z.string().optional(),
    dateRetour: z.string().optional(),
    fournisseur: z.string().optional(),
    dateFacture: z.string().optional(),
    dateEcheance: z.string().optional(),
    justificatif: z.any().optional(),
    modePaiement: z.string().optional(),
    coutEstime: z.string().optional(),
});

// Schéma complet
const formSchema = step1Schema.merge(step2Schema);

type FormData = z.infer<typeof formSchema>;

const NouveauBesoin = () => {
    const [page, setPage] = useState(1);
    const [step1Data, setStep1Data] = useState<Partial<FormData>>({});

    // Form pour l'étape 1
    const step1Form = useForm<z.infer<typeof step1Schema>>({
        resolver: zodResolver(step1Schema),
        defaultValues: {
            type: '',
            titre: '',
            projet: '',
        },
    });

    // Form pour l'étape 2
    const step2Form = useForm<z.infer<typeof step2Schema>>({
        resolver: zodResolver(step2Schema),
        defaultValues: {
            description: '',
            priorite: false,
            cout: '',
            destination: '',
            dateDepart: '',
            dateRetour: '',
            fournisseur: '',
            dateFacture: '',
            dateEcheance: '',
            justificatif: undefined,
            modePaiement: '',
            coutEstime: '',
        },
    });

    const onSubmitStep1 = (data: z.infer<typeof step1Schema>) => {
        setStep1Data(data);
        setPage(2);
        setTimeout(() => setProgress(100), 100)
    };

    const onSubmitStep2 = (data: z.infer<typeof step2Schema>) => {
        const finalData = { ...step1Data, ...data };
        console.log('Données finales:', finalData);
        alert('Besoin soumis avec succès !');
    };

    const [progress, setProgress] = React.useState(0)

    React.useEffect(() => {
        const timer = setTimeout(() => setProgress(50), 100)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className='flex flex-col items-center gap-14 px-7 py-6 max-w-[1024px] w-full'>
            <div className='flex flex-col items-center gap-2'>
                <h1 className="text-2xl font-bold">Nouveau besoin</h1>
                <p className="text-muted-foreground">Pour créer un nouveau besoin, complétez le formulaire ci-dessous</p>
            </div>

            <div className="w-full max-w-[440px]">
                {page === 1 ? (
                    <div className='flex flex-col items-center gap-2'>
                        <p className="text-sm font-medium">1/2 - Informations de base</p>
                        <Progress value={progress} className='max-w-[220px]' />
                    </div>
                ) : (
                    <div className='flex flex-col items-center gap-2'>
                        <p className="text-sm font-medium">2/2 - Informations complémentaires</p>
                        <Progress value={progress} className='max-w-[220px]' />
                        <Button
                            className='w-fit'
                            variant="ghost"
                            onClick={() => {
                                setPage(1)
                                setTimeout(() => setProgress(50), 100)
                            }}
                            type="button"
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Précédent
                        </Button>
                    </div>
                )}
            </div>

            {page === 1 && (
                <Form {...step1Form} >
                    <div className='max-w-[440px] w-full'>
                        <div className="space-y-6">
                            {/* Type */}
                            <FormField
                                control={step1Form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Type <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner un type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="frais-deplacement">Frais de déplacement</SelectItem>
                                                <SelectItem value="materiel">Matériel</SelectItem>
                                                <SelectItem value="formation">Formation</SelectItem>
                                                <SelectItem value="service">Service</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Titre */}
                            <FormField
                                control={step1Form.control}
                                name="titre"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Titre <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="ex: Frais de déplacement" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Projet */}
                            <FormField
                                control={step1Form.control}
                                name="projet"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Projet <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner un projet" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="projet-a">Projet A</SelectItem>
                                                <SelectItem value="projet-b">Projet B</SelectItem>
                                                <SelectItem value="projet-c">Projet C</SelectItem>
                                                <SelectItem value="autre">Autre</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="button" onClick={step1Form.handleSubmit(onSubmitStep1)} className="w-full">
                                Continuer
                            </Button>
                        </div>
                    </div>
                </Form>
            )}

            {page === 2 && (
                <Form {...step2Form}>
                    <div className='max-w-[440px] w-full'>
                        <div className="space-y-6">
                            {/* Description */}
                            <FormField
                                control={step2Form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Décrivez-nous votre besoin"
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Priorité */}
                            <FormField
                                control={step2Form.control}
                                name="priorite"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-base">Priorité</FormLabel>
                                        <FormControl>
                                            <div className='flex gap-2 pl-2'>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                                {"Urgent"}
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Coût */}
                            <FormField
                                control={step2Form.control}
                                name="cout"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Coût</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="0.00"
                                                step="0.01"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Destination */}
                            <FormField
                                control={step2Form.control}
                                name="destination"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Destination</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Lieu de destination" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Date de départ */}
                            <FormField
                                control={step2Form.control}
                                name="dateDepart"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date de départ</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Date de retour */}
                            <FormField
                                control={step2Form.control}
                                name="dateRetour"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date de retour</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Fournisseur */}
                            <FormField
                                control={step2Form.control}
                                name="fournisseur"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fournisseur</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nom du fournisseur" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Date de facture */}
                            <FormField
                                control={step2Form.control}
                                name="dateFacture"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date de la facture</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Date d'échéance */}
                            <FormField
                                control={step2Form.control}
                                name="dateEcheance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date d'échéance</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Justificatif */}
                            <FormField
                                control={step2Form.control}
                                name="justificatif"
                                render={({ field: { value, onChange, ...fieldProps } }) => (
                                    <FormItem>
                                        <FormLabel>Justificatif</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                onChange={(e) => onChange(e.target.files?.[0] ?? undefined)}
                                                {...fieldProps}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Formats acceptés: PDF, JPG, PNG, DOC, DOCX
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Mode de paiement */}
                            <FormField
                                control={step2Form.control}
                                name="modePaiement"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mode de paiement</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner un mode" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="virement">Virement bancaire</SelectItem>
                                                <SelectItem value="cheque">Chèque</SelectItem>
                                                <SelectItem value="especes">Espèces</SelectItem>
                                                <SelectItem value="carte">Carte bancaire</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Coût estimé */}
                            <FormField
                                control={step2Form.control}
                                name="coutEstime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Coût estimé</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                step="0.01"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="button" onClick={step2Form.handleSubmit(onSubmitStep2)} className="w-full">
                                Soumettre le besoin
                            </Button>
                        </div>
                    </div>
                </Form>
            )}
        </div>
    );
};

export default NouveauBesoin;