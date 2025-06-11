"use client"

import { department, services, users } from '@/lib/data'
import React, { useState, useTransition } from 'react'
import { Input } from '../../ui/input'
import { Loader, LucidePlusCircle, Search } from 'lucide-react'
import { Button } from '../../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table'
import { useRouter } from 'next/navigation'
import Pagination from '../../ui/pagination'
import ModalWarning from '../../ui/ModalWarning'
import DetailDepartment from './DetailDepartment'

const DepartmentTable = () => {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const slicedItems = department.slice(startIndex, startIndex + itemsPerPage);

    const [isPending, startTransition] = useTransition()

    return (
        <div className='flex flex-col gap-4 px-6'>
            <div className='flex gap-4 p-2'>
                <div className='flex flex-row gap-2 items-center justify-between w-full'>
                    <p className='text-base font-semibold'>{"Départements"}</p>
                    <div className='flex gap-2 items-center'>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                type="search"
                                placeholder="Rechercher"
                            />
                        </div>
                        <Button
                            disabled={isPending}
                            onClick={() =>
                                startTransition(() => {
                                    router.push("/tableau-de-bord/organisation/creer-un-departement")
                                })
                            }
                            className='bg-primary'
                        >
                            {isPending ? (
                                <Loader className='animate-spin mr-2' size={16} />
                            ) : (
                                <LucidePlusCircle className='mr-2' />
                            )}
                            Ajouter
                        </Button>
                    </div>
                </div>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{"Nom"}</TableHead>
                        <TableHead>{"chef"}</TableHead>
                        <TableHead>{"service"}</TableHead>
                        <TableHead />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {slicedItems.map((depart, i) => {
                        const service = services.filter(x => depart.service.includes(String(x.id)))
                        return (
                            <TableRow key={i} className="bg-white">
                                <TableCell className="items-start font-semibold" >{depart.name}</TableCell>
                                <TableCell className="items-start font-normal" >{users.find(x => x.id === Number(depart.manager))?.name}</TableCell>
                                <TableCell className="items-start font-normal w-[280px]" >
                                    <div className='flex flex-row overflow-ellipsis gap-2'>
                                        {service.map((x, i) =>
                                            <p key={i}>{`${x.name} -`}</p>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="flex flex-row items-center gap-2" >
                                    <DetailDepartment department={depart}>
                                        <Button variant={"outline"}>{"Details"}</Button>
                                    </DetailDepartment>
                                    <Button disabled={isPending} onClick={() => startTransition(() => {
                                        router.push(`/tableau-de-bord/organisation/departements/${depart.id}/modifier-un-departement`)
                                    })} variant={"outline"}>
                                        {"Modifier"}
                                        {isPending && <Loader className='animate-spin mr-2' size={16} />}
                                    </Button>
                                    <ModalWarning id={depart.id} action={() => console.log(depart)} name={depart.name} section='ce département'>
                                        <Button variant={"outline"}>{"Supprimer"}</Button>
                                    </ModalWarning>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
            <Pagination totalItems={department.length} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
    )
}

export default DepartmentTable
