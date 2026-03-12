"use client";
import { Button } from "@/components/ui/button";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";


const formSchema = z.object({
    title: z
        .string()
        .min(4, { message: "Nom trop court" }),
    content: z.string().min(5, {message: "Votre contenu doit contenir au moins 5 caractères"})
});
type FormValue = z.infer<typeof formSchema>;

function CreateCondition() {
    const queryClient = useQueryClient();

    const form = useForm<FormValue>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            content: ""
        },
    });

    const createCond = useMutation({
        mutationFn: async ({title, content}:{title: string; content: string}) =>
            CommandConditionQ.create({ title, content }),
        onSuccess: () => {
            toast.success("Vous avez ajouté une condition avec succès !");
            form.reset({ title: "", content: "" });
            queryClient.invalidateQueries({ queryKey: ['conditions'] }); // Rafraîchir la liste
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const onSubmit = ({title, content}:FormValue): void => {
            createCond.mutate({title, content});
    };

    return (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full max-w-3xl grid gap-3"
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
                                            placeholder="Rédigez le contenu de la condition"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                            <Button
                                type="submit"
                                variant={"primary"}
                                className="w-fit"
                                disabled={createCond.isPending}
                                isLoading={createCond.isPending}
                            >
                                {"Créer une valeur"}
                            </Button>
                    </form>
                </Form>
    );
}

export default CreateCondition;