'use client'
import PageTitle from '@/components/pageTitle'
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useStore } from '@/providers/datastore';
import { UserQueries } from '@/queries/baseModule';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod'

const formSchema = z.object({
    password: z.string().min(6, {message: "Votre mot de passe doit comporter au moins 6 caractères"}),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {message: "Vos mots de passe ne sont pas identiques", path:["password"]});

type FormValues = z.infer<typeof formSchema>;

function Page() {
    const { user } = useStore();
    const router = useRouter();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        }
    });

    const userQuery = new UserQueries();
    const update = useMutation({
        mutationFn: async(password:string)=>userQuery.changePassword(user?.id ?? 0, password),
        onSuccess: (data)=>{
            toast.success(`${user?.firstName} votre mot de passe a été mis à jour avec succès !`);
            router.push("./");
        },
        onError: (error: Error)=>{
            toast.error(error.message);
        }
    })

    function onSubmit(values: FormValues){
        update.mutate(values.password); 
    }
  return (
    <div className="content">
        <PageTitle title="Changer son mot de passe" subtitle="Mettez à jour votre mot de passe" color="blue" />
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="form-3xl">
                <FormField control={form.control} name="password" render={({field})=>(
                    <FormItem className='@min-[640px]:col-span-2'>
                        <FormLabel isRequired>{"Mot de passe"}</FormLabel>
                        <FormControl>
                            <Input {...field} type="password" placeholder="******" />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )} />
                <FormField control={form.control} name="confirmPassword" render={({field})=>(
                    <FormItem className='@min-[640px]:col-span-2'>
                        <FormLabel isRequired>{"Confirmer votre mot de passe"}</FormLabel>
                        <FormControl>
                            <Input {...field} type="password" placeholder="******" />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )} />
                <div className='@min-[640px]:col-span-2 w-full inline-flex justify-end'>
                    <Button variant={"primary"} disabled={update.isPending} isLoading={update.isPending}>{"Enregistrer les modifications"}</Button>
                </div>
            </form>
        </Form>
    </div>
  )
}

export default Page