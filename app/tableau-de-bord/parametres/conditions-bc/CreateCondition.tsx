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
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
    open: boolean;
    openChange: React.Dispatch<React.SetStateAction<boolean>>;
}

const formSchema = z.object({
    label: z
        .string()
        .min(4, { message: "Nom trop court" })
});
type FormValue = z.infer<typeof formSchema>;

function CreateCondition({ open, openChange }: Props) {
    const form = useForm<FormValue>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            label: "",
        },
    });
    const createCond = useMutation({
        mutationFn: async (reason: string) =>
            CommandConditionQ.create({ label: reason }),
        onSuccess: () => {
            toast.success("Vous avez ajouté une condition avec succès !");
            form.reset({ label: "" });
            openChange(false);
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
    const onSubmit = (value: FormValue): void => {
        createCond.mutate(value.label);
    };
    return (
        <Dialog open={open} onOpenChange={openChange}>
            <DialogContent>
                <DialogHeader variant={"error"}>
                    <DialogTitle>
                        {"Ajouter une condition"}
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
                            >
                                {"Ajouter"}
                            </Button>
                            <Button
                                variant={"outline"}
                                onClick={(e) => {
                                    e.preventDefault();
                                    openChange(false);
                                    form.reset({ label: "" });
                                }}
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

export default CreateCondition;
