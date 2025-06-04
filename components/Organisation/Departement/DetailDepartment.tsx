"use client"

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"
import { Button } from '../../ui/button'
import { useRouter } from 'next/navigation'
import { Department, services, users } from '@/lib/data'
import { Badge } from '@/components/ui/badge'



interface Props {
    children: React.JSX.Element,
    department: Department
}


const DetailDepartment = ({ children, department }: Props) => {
    const router = useRouter();
    const service = services.filter(x => department.service.includes(String(x.id)))

    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[420px] sm:w-full">
                    <DialogHeader>
                        <DialogTitle className='text-[20px] leading-[100%] tracking-[-2%]'>{`Département ${department.name}`}</DialogTitle>
                    </DialogHeader>
                    <div className='flex flex-col pt-5 gap-3'>
                        <div className='flex items-center justify-between'>
                            <p className='text-[#A1A1A1] font-medium'>{"Créé le"}</p>
                            <p className='text-[#18181B] font-medium'>{department.createdAt}</p>
                        </div>
                        <div className='flex items-center justify-between'>
                            <p className='text-[#A1A1A1] font-medium'>{"Modifié le"}</p>
                            <p className='text-[#18181B] font-medium'>{department.updateAt}</p>
                        </div>
                        <div className='flex items-center justify-between'>
                            <p className='text-[#A1A1A1] font-medium'>{"Chef du département"}</p>
                            <p className='text-[#18181B] font-medium'>{users.find(x => x.id === Number(department.manager))?.name}</p>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-[#A1A1A1] font-medium'>{"Services"}</p>
                            <div className='flex items-center gap-2'>
                                {service.map((x, i) =>
                                    <Badge className='px-2 py-1 flex gap-[10px]' variant={"outline"}>{x.name}</Badge>
                                )}
                            </div>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-[#A1A1A1] font-medium'>{"Description"}</p>
                            <p className='text-[#18181B] font-medium'>{department.description ? department.description : "-"}</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => router.push(`/tableau-de-bord/organisation${department.id}/modifier-un-departement/`)} className='h-10'>{"Modifier"}</Button>
                        <DialogClose asChild>
                            <Button className='h-10' variant="outline">{"Fermer"}</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}

export default DetailDepartment
