"use client"

import { Besoins } from '@/lib/data'
import React, { useState } from 'react'
import { LucideEllipsisVertical, LucidePlusCircle } from 'lucide-react'
import { Button } from '../../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover'
import { useRouter } from 'next/navigation'
import Pagination from '../../ui/pagination'
import ModalWarning from '../../ui/ModalWarning'
import { Badge } from '../../ui/badge'
import { Checkbox } from '../../ui/checkbox'
import { Form, FormControl, FormField, FormItem } from '../../ui/form'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import MesBesoinsDetail from './MesBesoinsDetail'

const FormSchema = z.object({
    items: z.array(z.number()),
});

interface Props {
    besoins: Besoins[]
    page: boolean
}

const MesBesoins = ({ besoins, page }: Props) => {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const slicedItems = besoins.slice(startIndex, startIndex + itemsPerPage);
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            items: [],
        },
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log(data);
    }
    

    return (
        <div className='flex flex-col gap-4 px-6'>
            <div className='flex gap-4 p-2'>
                <div className='flex flex-row gap-2 items-center justify-between w-full'>
                    <p className='text-base font-semibold'>{"Mes besoins récents"}</p>
                </div>
                <Button>
                    <LucidePlusCircle />
                    {"Ajouter"}
                </Button>
                <Button variant={"secondary"}>{"Tout voir"}</Button>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="items"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    {page && <Checkbox
                                                        className='border border-[#3F3F46]'
                                                        checked={besoins.length > 0 && field.value?.length === besoins.length}
                                                        onCheckedChange={(checked) => {
                                                            field.onChange(checked ? besoins.map((item) => item.id) : []);
                                                        }}
                                                    />}
                                                </TableHead>
                                                <TableHead colSpan={2}>{"Intitulé"}</TableHead>
                                                <TableHead>{"Projet"}</TableHead>
                                                <TableHead>{"statut"}</TableHead>
                                                <TableHead>{"validation"}</TableHead>
                                                <TableHead>{"Date"}</TableHead>
                                                <TableHead />
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {slicedItems.map((besoin, i) => (
                                                <TableRow key={i} className="bg-white">
                                                    <TableCell>
                                                        {
                                                            page && <Checkbox
                                                                className='border border-[#3F3F46]'
                                                                checked={field.value?.includes(besoin.id)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...field.value, besoin.id])
                                                                        : field.onChange(
                                                                            field.value?.filter(
                                                                                (value) => value !== besoin.id
                                                                            )
                                                                        )
                                                                }}
                                                            />
                                                        }
                                                    </TableCell>
                                                    <TableCell colSpan={2} className="items-start font-semibold" >{besoin.name}</TableCell>
                                                    <TableCell className="items-start font-normal max-w-[200px] overflow-ellipsis" >{besoin.projet}</TableCell>
                                                    <TableCell className="items-start font-normal" >
                                                        <Badge className={`${besoin.statut === "Validé" ? "bg-[#22C55E] hover:bg-[#22C55E]/90" :
                                                            besoin.statut === "Terminé" ? "bg-[#700032] hover:bg-[#700032]/90" :
                                                                besoin.statut === "Refusé" ? "bg-[#EF4444] hover:bg-[#EF4444]/90" :
                                                                    "bg-[#F97316] hover:bg-[#F97316]/90"}`
                                                        }>
                                                            {besoin.statut}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="items-start font-normal" >{`${besoin.nbValidation}/${besoin.nbTotalVali}`}</TableCell>
                                                    <TableCell className="items-start font-normal" >{besoin.dateEmission}</TableCell>
                                                    <TableCell className="items-start" >
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <LucideEllipsisVertical />
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-fit flex flex-col items-start">
                                                                <MesBesoinsDetail besoin={besoin}>
                                                                    <Button variant={"ghost"} className='!font-medium'>{"Voir les details"}</Button>
                                                                </MesBesoinsDetail>
                                                            </PopoverContent>
                                                        </Popover>
                                                    </TableCell>

                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                </FormControl>
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
            {page && <Pagination totalItems={besoins.length} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />}
        </div>
    )
}

export default MesBesoins
