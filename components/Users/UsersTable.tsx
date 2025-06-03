"use client"

import { users } from '@/lib/data'
import React, { useState } from 'react'
import { Input } from '../ui/input'
import { LucideEllipsisVertical, LucidePlusCircle, Search } from 'lucide-react'
import { Button } from '../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Badge } from '../ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import UserDetail from './UserDetail'
import { useRouter } from 'next/navigation'
import Pagination from '../ui/pagination'

const UsersTable = () => {
    const usersSlice = users.slice();
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const slicedItems = users.slice(startIndex, startIndex + itemsPerPage);

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
                        <TableHead>{"Role"}</TableHead>
                        <TableHead>{"Statut"}</TableHead>
                        <TableHead>{"Dernière connexion"}</TableHead>
                        <TableHead>{"Service associé"}</TableHead>
                        <TableHead />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {slicedItems.map((user, i) => (
                        <TableRow key={i} className="bg-white">
                            <TableCell className="items-start font-semibold" >{user.name}</TableCell>
                            <TableCell className="items-start font-normal" >{user.role}</TableCell>
                            <TableCell className="items-start" >
                                <Badge variant={user.status === "en ligne" ? "default" : "secondary"}>{user.status}</Badge>
                            </TableCell>
                            <TableCell className="items-start font-normal" >{user.lastConnection}</TableCell>
                            <TableCell className="items-start font-normal" >{user.service}</TableCell>
                            <TableCell className="items-start" >
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <LucideEllipsisVertical />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[205px] flex flex-col items-start">
                                        <UserDetail user={user}>
                                            <Button variant={"ghost"} className='!font-medium'>{"Voir"}</Button>
                                        </UserDetail>
                                        <Button onClick={() => router.push(`/tableau-de-bord/utilisateurs/${user.id}/modifier-un-utilisateur`)} variant={"ghost"} className='!font-medium'>{"Modifier"}</Button>
                                        <Button onClick={() => router.push(`/tableau-de-bord/utilisateurs/${user.id}/mot-de-passe`)} variant={"ghost"} className='!font-medium'>{"Changer le mot de passe"}</Button>
                                        <Button variant={"ghost"} className='!font-medium'>{"Désactiver"}</Button>
                                        <Button variant={"ghost"} className='!font-medium'>{"Supprimer"}</Button>
                                    </PopoverContent>
                                </Popover>
                            </TableCell>

                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Pagination totalItems={users.length} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
    )
}

export default UsersTable
