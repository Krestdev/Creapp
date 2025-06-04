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
import { Service, User } from '@/lib/data'



interface Props {
    children: React.JSX.Element,
    service: Service
}


const DetailService = ({ children, service }: Props) => {
    const router = useRouter();
    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[420px] sm:w-full">
                    <DialogHeader>
                        <DialogTitle className='text-[20px] leading-[100%] tracking-[-2%]'>{`Service ${service.name}`}</DialogTitle>
                    </DialogHeader>
                    <div className='flex flex-col pt-5 gap-3'>
                        <div className='flex items-center justify-between'>
                            <p className='text-[#A1A1A1] font-medium'>{"Créé le"}</p>
                            <p className='text-[#18181B] font-medium'>{service.createdAt}</p>
                        </div>
                        <div className='flex items-center justify-between'>
                            <p className='text-[#A1A1A1] font-medium'>{"Modifié le"}</p>
                            <p className='text-[#18181B] font-medium'>{service.updateAt}</p>
                        </div>
                        <div className='flex items-center justify-between'>
                            <p className='text-[#A1A1A1] font-medium'>{"Chel du service"}</p>
                            <p className='text-[#18181B] font-medium'>{service.manager}</p>
                        </div>
                        <div className='flex items-center justify-between'>
                            <p className='text-[#A1A1A1] font-medium'>{"Département"}</p>
                            <p className='text-[#18181B] font-medium'>{service.department}</p>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-[#A1A1A1] font-medium'>{"Description"}</p>
                            <p className='text-[#18181B] font-medium'>{service.description}</p>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-[#A1A1A1] font-medium'>{"Membres"}</p>
                            <div className='flex gap-1 items-center'>
                                {
                                service.member.map((x, i) =>
                                    <p key={i} className='text-[#18181B] font-medium'>{`${x} -`}</p>
                                )
                            }
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => router.push(`/tableau-de-bord/organisation${service.id}/modifier-un-service/`)} className='h-10'>{"Modifier"}</Button>
                        <DialogClose asChild>
                            <Button className='h-10' variant="outline">{"Fermer"}</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}

export default DetailService
