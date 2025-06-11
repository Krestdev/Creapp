"use client"

import { Besoins } from '@/lib/data'
import React, { useState } from 'react'
import { Input } from '../../ui/input'
import { LucideCheck, LucideEllipsisVertical, LucideEye, LucideFunnel, LucidePlusCircle, LucideX, Search } from 'lucide-react'
import { Button } from '../../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table'
import { Badge } from '../../ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover'
import { useRouter } from 'next/navigation'
import Pagination from '../../ui/pagination'
import ModalWarning from '../../ui/ModalWarning'
import { Form, FormControl, FormField, FormItem } from '../../ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Checkbox } from '../../ui/checkbox'
import ActiveBesoinD from './ActiveBesoinD'
import ContenuBesoinD from './ContenuBesoinD'
import { toast } from 'sonner'
import RejeterBesoin from './RejeterBesoin'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const FormSchema = z.object({
    items: z.array(z.number()),
});

interface Props {
    besoins: Besoins[]
    page: boolean
}


const BesoinsActifs = ({ besoins, page }: Props) => {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [open, setOpen] = useState(false)
    const [besoin, setBesoin] = useState<Besoins>()
    const [selected, setSelected] = useState<number[]>([])
    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const slicedItems = besoins.slice(startIndex, startIndex + itemsPerPage);
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            items: [],
        },
    });
    const selectedItems = form.watch("items");

    function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log(data);
    };

    const handleApprove = (nom: string | undefined) => {
        toast.success(`Le besoin ${nom} a eté validé`)

    }

    const handleReject = (nom: string) => {
        toast.error(`Vous avez rejété le besoin ${nom}`)
    }

    const handleGroupAction = (action: 'accept' | 'reject') => {
        const selectedIds = form.getValues().items;
        const selectedBesoins = besoins.filter(besoin => selectedIds.includes(besoin.id));

        if (action === 'accept') {
            selectedBesoins.forEach(besoin => {
                handleApprove(besoin.name);
                // Ici vous pourriez aussi appeler une API pour valider les besoins
            });
            toast.success(`${selectedBesoins.length} besoins ont été acceptés`);
        } else {
            selectedBesoins.forEach(besoin => {
                handleReject(besoin.name);
                // Ici vous pourriez aussi appeler une API pour rejeter les besoins
            });
            toast.success(`${selectedBesoins.length} besoins ont été rejetés`);
        }

        // Réinitialiser la sélection
        form.setValue('items', []);
    };

    return (
        <div>
            {
                besoins.length > 0 ?
                    <div className='flex flex-col gap-4 px-6'>
                        <div className='flex gap-4 p-2'>
                            <div className='flex flex-row gap-2 items-center justify-between w-full'>
                                <p className='text-base font-semibold'>{"En attente de validation"}</p>
                            </div>
                            {
                                page ?
                                    <div className='flex gap-4'>
                                        <div className="relative w-full max-w-sm">
                                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                            <Input
                                                className='w-[220px]'
                                                type="search"
                                                placeholder="Rechercher"
                                            />
                                        </div>
                                        <Button className='bg-black hover:bg-black/90'>
                                            <LucideFunnel />
                                            {"Filtrer"}
                                        </Button>
                                        {
                                            selectedItems.length >= 2 &&
                                            <Select onValueChange={(value) => {
                                                if (value === "accepte") {
                                                    // Logique pour tout accepter
                                                    handleGroupAction('accept');
                                                } else if (value === "refuse") {
                                                    // Logique pour tout rejeter
                                                    handleGroupAction('reject');
                                                }
                                            }}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Action groupée" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectItem value="accepte">Tout Accepter</SelectItem>
                                                        <SelectItem value="refuse">Tout Rejeter</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        }
                                    </div> :
                                    <Button onClick={() => router.push("/tableau-de-bord/besoins/validation")} variant={"secondary"}>{"Tout voir"}</Button>
                            }
                        </div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <FormField
                                    control={form.control}
                                    name="items"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className='flex'>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>
                                                                    {page &&
                                                                        <Checkbox
                                                                            className='border border-[#3F3F46]'
                                                                            checked={besoins.length > 0 && field.value?.length === besoins.length}
                                                                            onCheckedChange={(checked) => {
                                                                                field.onChange(checked ? besoins.map((item) => item.id) : []);
                                                                            }}
                                                                        />}
                                                                </TableHead>
                                                                <TableHead colSpan={2}>{"Intitulé"}</TableHead>
                                                                <TableHead>{"Projet"}</TableHead>
                                                                <TableHead>{"Coût"}</TableHead>
                                                                <TableHead>{"Echéance"}</TableHead>
                                                                <TableHead>{"Date"}</TableHead>
                                                                {!open && <TableHead />}
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {slicedItems.map((besoin, i) => (
                                                                <TableRow key={i} className="bg-white">
                                                                    <TableCell>
                                                                        {
                                                                            page &&
                                                                            <Checkbox
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
                                                                    <TableCell className="items-start font-normal" >{`${besoin.cout} FCFA`}</TableCell>
                                                                    <TableCell className="items-start font-normal" >{besoin.dateEcheance}</TableCell>
                                                                    <TableCell className="items-start font-normal" >{besoin.dateEmission}</TableCell>
                                                                    {!open && <TableCell className="items-start" >
                                                                        <Popover>
                                                                            <PopoverTrigger asChild>
                                                                                <LucideEllipsisVertical />
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="w-fit flex flex-col items-start">
                                                                                {page ?
                                                                                    <Button onClick={() => { setOpen(true); setBesoin(besoin) }} variant={"ghost"} className='!font-medium'>
                                                                                        <LucideEye />
                                                                                        {"Voir les détails"}
                                                                                    </Button>
                                                                                    :
                                                                                    <ActiveBesoinD besoin={besoin}>
                                                                                        <Button variant={"ghost"} className='!font-medium'>
                                                                                            <LucideEye />
                                                                                            {"Voir les détails"}
                                                                                        </Button>
                                                                                    </ActiveBesoinD>
                                                                                }
                                                                                <Button type='button' onClick={() => handleApprove(besoin.name)} variant={"ghost"} className='!font-medium'>
                                                                                    <LucideCheck className='text-[#16A34A]' />
                                                                                    {"Accepter"}
                                                                                </Button>
                                                                                <RejeterBesoin id={besoin.id} action={() => handleReject(besoin?.name)}>
                                                                                    <Button variant={"ghost"} className='!font-medium'>
                                                                                        <LucideX className='text-[#DC2626]' />
                                                                                        {"Rejeter"}
                                                                                    </Button>
                                                                                </RejeterBesoin>
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    </TableCell>}
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                    <div>
                                                        {
                                                            open &&
                                                            <div className='max-w-[320px] w-full px-5 flex flex-col gap-4'>
                                                                <img src="/Images/besoin.png" className='w-full' alt="" />
                                                                <ContenuBesoinD besoin={besoin} />
                                                                <div className='flex flex-wrap gap-3'>
                                                                    <Button type='button' onClick={() => handleApprove(besoin?.name)} className='h-10 bg-[#16A34A] hover:bg-[#16A34A]/90 border-none' variant="secondary">{"Approuver"}</Button>
                                                                    {besoin && <RejeterBesoin id={besoin.id} action={() => handleReject(besoin.name)}>

                                                                        <Button className='h-10 bg-[#DC2626] hover:bg-[#DC2626]/90 border-none' variant="secondary">{"Rejeter"}</Button>
                                                                    </RejeterBesoin>}
                                                                    <Button onClick={() => setOpen(false)} className='h-10' variant="outline">{"Fermer"}</Button>
                                                                </div>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                        {page && <Pagination totalItems={besoins.length} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />}
                    </div>
                    :
                    <div className='flex flex-col gap-4'>
                        <div className='flex flex-row gap-2 items-center justify-between w-full'>
                            <p className='text-base font-semibold'>{"Mes besoins récents"}</p>
                        </div>
                        <p className='py-5 w-full text-center text-[32px] text-gray-400'>{"Aucun besoin enrégistré"}</p>
                    </div>
            }
        </div>
    )
}

export default BesoinsActifs
