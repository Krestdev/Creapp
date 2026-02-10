"use client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Input } from "@/components/ui/input";
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
    data: CommandCondition;
}

const formSchema = z.object({
    title: z
        .string()
        .min(4, { message: "Nom trop court" }),
    content: z.string().min(5, {message: "Votre contenu doit contenir au moins 5 caractères"})
});
type FormValue = z.infer<typeof formSchema>;

function UpdateCondition({ open, openChange, data }: Props) {
    const queryClient = useQueryClient();

    const form = useForm<FormValue>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            content: ""
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                title: data.title,
                content: data.content
            });
        }
    }, [data, form]);

    const update = useMutation({
        mutationFn: async (data:CommandCondition) =>
            CommandConditionQ.update(data),
        onSuccess: () => {
            toast.success("Condition modifiée avec succès !");
            form.reset({ title: "", content: "" });
            openChange(false);
            queryClient.invalidateQueries({ queryKey: ['conditions'] }); // Rafraîchir la liste
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const onSubmit = ({title, content}: FormValue): void => {
        update.mutate({ id: data.id, title, content });

    };

    return (
        <Dialog open={open} onOpenChange={openChange}>
            <DialogContent>
                <DialogHeader variant={"secondary"}>
                    <DialogTitle>
                        {`Modifier ${data.title}`}
                    </DialogTitle>
                    <DialogDescription>{"Mettre à jour les informations relatives à cette condition"}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-3"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel isRequired>{"Titre"}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Ex. Condition Achat Local"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel isRequired>{"Contenu"}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Redigez le contenu de la condition"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="submit"
                                variant={"accent"}
                                disabled={update.isPending}
                                isLoading={update.isPending}
                            >
                                {"Enregistrer les modifications"}
                            </Button>
                            <Button
                                variant={"outline"}
                                onClick={(e) => {
                                    e.preventDefault();
                                    openChange(false);
                                }}
                                disabled={update.isPending}
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

export default UpdateCondition;