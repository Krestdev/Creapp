"use client"

import { Button } from '@/components/ui/button'
import { User } from '@/lib/data';
import { useRouter } from 'next/navigation';
import React from 'react'

interface Props {
    user: User
}

const Detail = ({user}: Props) => {
    
  const router = useRouter();

    return (
        <div className="flex flex-col gap-5 items-center justify-center sm:max-w-[730px] border p-7">
            <div className='flex flex-col w-full pt-5 gap-3'>
                <div className='flex items-center justify-between'>
                    <p className='text-[#A1A1A1] font-medium'>{"Nom"}</p>
                    <p className='text-[#18181B] font-medium'>{user.name}</p>
                </div>
                <div className='flex items-center justify-between'>
                    <p className='text-[#A1A1A1] font-medium'>{"Statut"}</p>
                    <div className='flex items-center gap-2'>
                        <div className={`h-2 w-2 ${user.status === "en ligne" ? "bg-[#16A34A]" : "bg-[#DC2626]"} rounded-[4px]`} />
                        <p className='text-[#18181B] font-medium'>{user.status}</p>
                    </div>
                </div>
                <div className='flex items-center justify-between'>
                    <p className='text-[#A1A1A1] font-medium'>{"Role"}</p>
                    <p className='text-[#18181B] font-medium'>{user.role}</p>
                </div>
                <div className='flex items-center justify-between'>
                    <p className='text-[#A1A1A1] font-medium'>{"Poste"}</p>
                    <p className='text-[#18181B] font-medium'>{user.poste}</p>
                </div>
                <div className='flex items-center justify-between'>
                    <p className='text-[#A1A1A1] font-medium'>{"Service"}</p>
                    <p className='text-[#18181B] font-medium'>{user.service}</p>
                </div>
                <div className='flex items-center justify-between'>
                    <p className='text-[#A1A1A1] font-medium'>{"Dernière activité"}</p>
                    <p className='text-[#18181B] font-medium'>{user.lastConnection}</p>
                </div>
                <div className='flex items-center justify-between'>
                    <p className='text-[#A1A1A1] font-medium'>{"Créé le"}</p>
                    <p className='text-[#18181B] font-medium'>{user.dateCreation}</p>
                </div>
            </div>
            <div className='w-full flex items-center gap-2 justify-between'>
                <Button onClick={() => router.push(`/tableau-de-bord/utilisateurs`)} className='h-10 w-1/2' variant="outline">{"Retour"}</Button>
                <Button onClick={() => router.push(`/tableau-de-bord/utilisateurs/${user.id}/modifier-un-utilisateur`)} className='h-10 w-1/2'>{"Modifier"}</Button>
            </div>
        </div>
    )
}

export default Detail
