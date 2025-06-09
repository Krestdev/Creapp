"use client"

import { fournisseurs } from '@/lib/data'
import React, { useState } from 'react'
import { Input } from '../ui/input'
import { LucideEllipsisVertical, LucideFunnel, LucidePlusCircle, Search } from 'lucide-react'
import { Button } from '../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Badge } from '../ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { useRouter } from 'next/navigation'
import Pagination from '../ui/pagination'
import FournisseurDetail from './FournisseurDetail'
import { Filtrer } from './Filtrer'
import ModalWarning from '../ui/ModalWarning'

const FournisseurTable = () => {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const slicedItems = fournisseurs.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className='flex flex-col gap-4 px-6'>
            <div className='flex gap-4 p-2'>
                <div className='flex flex-row gap-2 items-center justify-between w-full'>
                    <p className='text-base font-semibold'>{"Utilisateurs"}</p>
                    <div className='flex gap-2 items-center'>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                type="search"
                                placeholder="Rechercher"
                            />
                        </div>
                        <Filtrer onSubmit={(data) => console.log("Filtres soumis :", data)}>
                            <Button className='bg-gray-900'>
                                <LucideFunnel />
                                {"Filtrer"}
                            </Button>
                        </Filtrer>
                        <Button onClick={() => router.push("/tableau-de-bord/fournisseurs/creer-un-fournisseur")} className='bg-primary'>
                            <LucidePlusCircle />
                            {"Ajouter"}
                        </Button>
                        <Button variant={"secondary"}>
                            {"Exporter en PDF"}
                        </Button>
                    </div>
                </div>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{"Nom"}</TableHead>
                        <TableHead>{"Type"}</TableHead>
                        <TableHead>{"Secteur(s) d'activité"}</TableHead>
                        <TableHead>{"Dernière commande"}</TableHead>
                        <TableHead>{"Besoins associés"}</TableHead>
                        <TableHead />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {slicedItems.map((fournisseur, i) => (
                        <TableRow key={i} className="bg-white">
                            <TableCell className="items-start font-semibold" >{fournisseur.name}</TableCell>
                            <TableCell className="items-start font-normal" >{fournisseur.type}</TableCell>
                            <TableCell className="items-start font-normal" >
                                <div className='flex flex-wrap gap-2 max-w-[240px]'>
                                    {fournisseur.activities.map((x, i) =>
                                        <Badge className='px-2 py-1 flex gap-[10px]' variant={"outline"}>{x}</Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="items-start font-normal" >{fournisseur.lastOrder}</TableCell>
                            <TableCell className="items-start font-normal" >{fournisseur.requirement}</TableCell>
                            <TableCell className="items-start" >
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <LucideEllipsisVertical />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[205px] flex flex-col items-start">
                                        <Button onClick={() => router.push(`/tableau-de-bord/fournisseurs/${decodeURIComponent(fournisseur.name)}`)} variant={"ghost"} className='!font-medium'>{"Voir la fiche"}</Button>
                                        <Button onClick={() => router.push(`/tableau-de-bord/fournisseurs/${fournisseur.id}/modifier-un-fournisseur`)} variant={"ghost"} className='!font-medium'>{"Modifier"}</Button>
                                        <ModalWarning id={fournisseur.id} action={() => console.log(fournisseur)}>
                                            <Button variant={"ghost"} className='!font-medium'>{"Supprimer"}</Button>
                                        </ModalWarning>
                                    </PopoverContent>
                                </Popover>
                            </TableCell>

                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Pagination totalItems={fournisseurs.length} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
    )
}

export default FournisseurTable
