"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RequestTypeQueries } from "@/queries/requestType";
import { RequestType } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Validation schema
const formSchema = z.object({
    label: z.string()
        .min(1, "Le titre est obligatoire")
        .max(100, "Le titre ne doit pas dépasser 100 caractères"),
    description: z.string()
        .min(1, "La description est obligatoire")
        .max(500, "La description ne doit pas dépasser 500 caractères"),
});

type FormValues = z.infer<typeof formSchema>;

interface UpdateRequestTypeProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: RequestType | undefined;
}

export function UpdateRequestType({
    open,
    onOpenChange,
    data
}: UpdateRequestTypeProps) {

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            label: "",
            description: "",
        },
    });

    const queryClient = useQueryClient();
    const requestTypeQueries = new RequestTypeQueries();

    // Mutation pour la mise à jour
    const updateMutation = useMutation({
        mutationFn: (values: { id: number; label: string }) => {
            return requestTypeQueries.update(data?.id!, { label: values.label });
        },
        onSuccess: () => {
            toast.success("Type de besoin modifié avec succès");
            queryClient.invalidateQueries({ queryKey: ["requestType"], refetchType: "active" });
            onOpenChange(false);
        },
        onError: (error) => {
            toast.error("Erreur lors de la modification");
            console.error("Update error:", error);
        },
    });

    // Reset form when data changes
    useEffect(() => {
        if (data) {
            form.reset({
                label: data.label || "",
                description: data.description || "",
            });
        }
    }, [data, form]);

    const handleSubmit = async (values: FormValues) => {
        if (!data?.id) {
            toast.error("ID du type de besoin manquant");
            return;
        }

        updateMutation.mutate({
            id: data.id,
            label: values.label
            // Note: description n'est pas envoyé car elle est désactivée
        });
    };

    // Reset form when modal closes
    useEffect(() => {
        if (!open) {
            form.reset();
            updateMutation.reset();
        }
    }, [open]); // ✅ seulement open


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px] w-full overflow-y-auto p-0 gap-0 overflow-x-hidden border-none">
                {/* Header avec fond bordeaux */}
                <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8">
                    <DialogTitle className="text-xl font-semibold text-white">
                        Modifier le type de besoin
                    </DialogTitle>
                    <p className="text-sm text-white/80 mt-1">
                        Mettez à jour les informations du type de besoin
                    </p>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 px-6 pb-4">
                        {/* Titre */}
                        <FormField
                            control={form.control}
                            name="label"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">
                                        Titre <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ex: Achat de matériel informatique"
                                            {...field}
                                            disabled={updateMutation.isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description (désactivée) */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">
                                        Description
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ex: Type de besoin pour l'achat d'équipements informatiques..."
                                            className="resize-none"
                                            rows={4}
                                            {...field}
                                            disabled // Description est désactivée
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-xs text-muted-foreground">
                                        La description ne peut pas être modifiée
                                    </p>
                                </FormItem>
                            )}
                        />

                        {/* Boutons d'action */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="submit"
                                className="bg-[#8B1538] hover:bg-[#8B1538]/90 text-white"
                                disabled={updateMutation.isPending}
                            >
                                {updateMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Modification...
                                    </>
                                ) : (
                                    "Enregistrer"
                                )}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={updateMutation.isPending}
                            >
                                Annuler
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}