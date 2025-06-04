"use client"

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'
import { Department, services, users } from '@/lib/data';
import { useRouter } from 'next/navigation';
import React from 'react'

interface Props {
    depart: Department
}

const Detail = ({ depart }: Props) => {
    const router = useRouter();
    const service = services.filter(x => depart.service.includes(String(x.id)))

    return (
        <div className="flex flex-col gap-5 items-center justify-center sm:max-w-[730px] border p-7">
            <div className='flex flex-col pt-5 gap-3'>
                        <div className='flex items-center justify-between'>
                            <p className='text-[#A1A1A1] font-medium'>{"Créé le"}</p>
                            <p className='text-[#18181B] font-medium'>{depart.createdAt}</p>
                        </div>
                        <div className='flex items-center justify-between'>
                            <p className='text-[#A1A1A1] font-medium'>{"Modifié le"}</p>
                            <p className='text-[#18181B] font-medium'>{depart.updateAt}</p>
                        </div>
                        <div className='flex items-center justify-between'>
                            <p className='text-[#A1A1A1] font-medium'>{"Chef du département"}</p>
                            <p className='text-[#18181B] font-medium'>{users.find(x => x.id === Number(depart.manager))?.name}</p>
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
                            <p className='text-[#18181B] font-medium'>{depart.description ? depart.description : "-"}</p>
                        </div>
                    </div>
            <div className='w-full flex items-center gap-2 justify-between'>
                <Button onClick={() => router.push(`/tableau-de-bord/organisation`)} className='h-10 w-1/2' variant="outline">{"Retour"}</Button>
                <Button onClick={() => router.push(`/tableau-de-bord/organisation/${depart.id}/modifier-un-utilisateur`)} className='h-10 w-1/2'>{"Modifier"}</Button>
            </div>
        </div>
    )
}

export default Detail
