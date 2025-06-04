"use client"

import { services, users } from '@/lib/data'
import React, { useState } from 'react'
import { Input } from '../../ui/input'
import { LucideEllipsisVertical, LucidePlusCircle, Search } from 'lucide-react'
import { Button } from '../../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table'
import { Badge } from '../../ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover'
import { useRouter } from 'next/navigation'
import Pagination from '../../ui/pagination'
import UserDetail from '../../Users/UserDetail'
import DetailService from './DetailService'
import ModalWarning from '../../ui/ModalWarning'

const ServicesTable = () => {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const slicedItems = services.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className='flex flex-col gap-4 px-6'>
            <div className='flex gap-4 p-2'>
                <div className='flex flex-row gap-2 items-center justify-between w-full'>
                    <p className='text-base font-semibold'>{"Services"}</p>
                    <div className='flex gap-2 items-center'>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                type="search"
                                placeholder="Rechercher"
                            />
                        </div>
                        <Button className='bg-primary'>
                            <LucidePlusCircle />
                            {"Ajouter"}
                        </Button>
                    </div>
                </div>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{"Nom"}</TableHead>
                        <TableHead>{"chef"}</TableHead>
                        <TableHead>{"Département"}</TableHead>
                        <TableHead>{"Membres"}</TableHead>
                        <TableHead />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {slicedItems.map((service, i) => (
                        <TableRow key={i} className="bg-white">
                            <TableCell className="items-start font-semibold" >{service.name}</TableCell>
                            <TableCell className="items-start font-normal" >{service.manager}</TableCell>
                            <TableCell className="items-start font-normal" >{service.department}</TableCell>
                            <TableCell className="items-start font-normal" >{service.member.length}</TableCell>
                            <TableCell className="flex flex-row items-center gap-2" >
                                <DetailService service={service}>
                                    <Button variant={"outline"}>{"Details"}</Button>
                                </DetailService>
                                <Button onClick={() => router.push(`/tableau-de-bord/organisation/${service.id}/modifier-un-service`)} variant={"outline"}>{"Modifier"}</Button>
                                <ModalWarning id={service.id} action={() => console.log(service)} name={service.name} section='ce service'>
                                    <Button variant={"outline"}>{"Supprimer"}</Button>
                                </ModalWarning>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Pagination totalItems={services.length} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
    )
}

export default ServicesTable
