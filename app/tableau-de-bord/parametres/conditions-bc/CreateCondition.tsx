"use client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { CommandConditionQ } from "@/queries/commandsConditions";
import { CommandCondition } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
    open: boolean;
    openChange: React.Dispatch<React.SetStateAction<boolean>>;
    condition?: CommandCondition | null;
    isEditing?: boolean;
}

const formSchema = z.object({
    label: z
        .string()
        .min(4, { message: "Nom trop court" })
});
type FormValue = z.infer<typeof formSchema>;

function ConditionForm({ open, openChange, condition, isEditing = false }: Props) {
    const queryClient = useQueryClient();

    const form = useForm<FormValue>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            label: "",
        },
    });

    // Réinitialiser le formulaire quand la condition change
    useEffect(() => {
        if (condition && isEditing) {
            form.reset({
                label: condition.title || "",
            });
        } else {
            form.reset({
                label: "",
            });
        }
    }, [condition, isEditing, form]);

    const createCond = useMutation({
        mutationFn: async (title: string) =>
            CommandConditionQ.create({ title }),
        onSuccess: () => {
            toast.success("Vous avez ajouté une condition avec succès !");
            form.reset({ label: "" });
            openChange(false);
            queryClient.invalidateQueries({ queryKey: ['conditions'] }); // Rafraîchir la liste
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const updateCond = useMutation({
        mutationFn: async ({ id, title }: { id: number; title: string }) =>
            CommandConditionQ.update(id, { title }),
        onSuccess: () => {
            toast.success("Condition modifiée avec succès !");
            form.reset({ label: "" });
            openChange(false);
            queryClient.invalidateQueries({ queryKey: ['conditions'] }); // Rafraîchir la liste
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const onSubmit = (value: FormValue): void => {
        if (isEditing && condition?.id) {
            updateCond.mutate({ id: condition.id, title: value.label });
        } else {
            createCond.mutate(value.label);
        }
    };

    return (
        <Dialog open={open} onOpenChange={openChange}>
            <DialogContent>
                <DialogHeader variant={"error"}>
                    <DialogTitle>
                        {isEditing ? "Modifier la condition" : "Ajouter une condition"}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-3"
                    >
                        <FormField
                            control={form.control}
                            name="label"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel isRequired>{"Nom de la condition"}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Ex. Paiement à 30 jours"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="submit"
                                variant={"destructive"}
                                disabled={createCond.isPending || updateCond.isPending}
                            >
                                {isEditing ? "Modifier" : "Ajouter"}
                            </Button>
                            <Button
                                variant={"outline"}
                                onClick={(e) => {
                                    e.preventDefault();
                                    openChange(false);
                                    form.reset({ label: "" });
                                }}
                                disabled={createCond.isPending || updateCond.isPending}
                            >
                                {"Annuler"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default ConditionForm;