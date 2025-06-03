"use client"

import React from 'react'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'

const Actions = () => {
    const router = useRouter()
    return (
        <div className='flex flex-col gap-2 lg:flex-row lg:gap-6'>
            <Button onClick={() => router.push("/tableau-de-bord/utilisateurs/creer-un-utilisateur")} className='bg-primary h-[80px] w-full lg:w-[270px] text-[18px] p-5 left-6'>{"Créer un utilisateur"}</Button>
            <Button className='bg-secondary h-[80px] w-full lg:w-[270px] text-[18px] p-5 left-6'>{"Rôles"}</Button>
            <Button variant={"outline"} className='h-[80px] w-full lg:w-[270px] text-[18px] p-5 left-6'>{"Ajouter un rôle"}</Button>
        </div>
    )
}

export default Actions
