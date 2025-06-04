"use client"

import { Button } from '@/components/ui/button'
import { Service, User } from '@/lib/data';
import { useRouter } from 'next/navigation';
import React from 'react'

interface Props {
    service: Service
}

const Detail = ({ service }: Props) => {
    const router = useRouter();
    return (
        <div className="flex flex-col gap-5 items-center justify-center sm:max-w-[730px] border p-7">
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
            <div className='w-full flex items-center gap-2 justify-between'>
                <Button onClick={() => router.push(`/tableau-de-bord/organisation`)} className='h-10 w-1/2' variant="outline">{"Retour"}</Button>
                <Button onClick={() => router.push(`/tableau-de-bord/organisation/${service.id}/modifier-un-utilisateur`)} className='h-10 w-1/2'>{"Modifier"}</Button>
            </div>
        </div>
    )
}

export default Detail
