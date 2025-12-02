'use client'
import FileUpload from '@/components/card-upload'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { useFetchQuery } from '@/hooks/useData'
import { CommandQueries } from '@/queries/commandModule'
import { ProviderQueries } from '@/queries/providers'
import { CommandRequestT, Provider } from '@/types/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { SelectValue } from '@radix-ui/react-select'
import React from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'

const formSchema = z.object({
    quotationId: z.number({message: "Requis"}),
    providerId: z.number({message: "Requis"}),
    elements: z.array(z.object({
        needId:z.number({message: "Veuillez séleectionner un besoin"}),
        designation: z.string({message: "Veuillez renseigner une désignation"}),
        quantity: z.number(),
        unit: z.string(),
        price: z.number({message: "Veuillez renseigner un prix"}),
    })
    ).min(1),
    file: z.any()
})

function CreateQuotation() {
    /**Demandes de cotation */
    const requestsQuery = new CommandQueries();
    const requestsData = useFetchQuery(["commands"], requestsQuery.getAll);
    /**Fournisseurs */
    const providerQuery = new ProviderQueries();
    const providersData = useFetchQuery(["providers"], providerQuery.getAll, 500000)
    /**Data states */
    const [requests, setRequests] = React.useState<Array<CommandRequestT>>([]);
    const [providers, setProviders] = React.useState<Array<Provider>>([]);

    React.useEffect(()=>{
        if(requestsData.isSuccess){
            setRequests(requestsData.data.data);
        }
        if(providersData.isSuccess){
            setProviders(providersData.data.data);
        }
    },[requestsData.isSuccess, providersData.isSuccess]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quotationId: undefined,
            providerId: undefined,
            elements: [],
            file: undefined,
        }
    });

    function onSubmit(values: z.infer<typeof formSchema>){
        console.log(values);
    }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-3xl grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2">
            <FormField control={form.control} name="quotationId" render={({field})=>(
                <FormItem>
                    <FormLabel isRequired>{"Demande de cotation"}</FormLabel>
                    <FormControl>
                        <Select defaultValue={field.value ? String(field.value) : undefined} onValueChange={(v)=>field.onChange(Number(v))}>
                            <SelectTrigger className="min-w-60 w-full">
                                <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    requests.length === 0 ? 
                                    <SelectItem value="-" disabled>{"Aucune demande enregistrée"}</SelectItem>
                                    :
                                    requests.map(request=>
                                        <SelectItem key={request.id} value={String(request.id)}>{request.title}</SelectItem>
                                    )
                                }
                            </SelectContent>
                        </Select>
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )} />
            <FormField control={form.control} name="providerId" render={({field})=>(
                <FormItem>
                    <FormLabel isRequired>{"Fournisseur"}</FormLabel>
                    <FormControl>
                        <Select defaultValue={field.value ? String(field.value) : undefined} onValueChange={(v)=>field.onChange(Number(v))}>
                            <SelectTrigger className="min-w-60 w-full">
                                <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    providers.length === 0 ?
                                    <SelectItem value='-' disabled>{"Aucun fournisseur enregistré"}</SelectItem>
                                    :
                                    providers.map(provider=>
                                        <SelectItem key={provider.id} value={String(provider.id)}>{provider.name}</SelectItem>
                                    )
                                }
                            </SelectContent>
                        </Select>
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )} />
            <FormField control={form.control} name="elements" render={({field})=>(
                <FormItem>
                    <FormLabel isRequired>{"Éléments"}</FormLabel>
                    <FormControl>
                        <span/>
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )} />
            <FormField control={form.control} name="file" render={({field})=>(
                <FormItem>
                    <FormLabel isRequired>{"Justificatif"}</FormLabel>
                    <FormControl>
                        <FileUpload/>
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )} />
        </form>
    </Form>
  )
}

export default CreateQuotation