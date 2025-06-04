"use client"

import React from 'react'
import { Button } from '../../ui/button'
import { useRouter } from 'next/navigation'

const ActionsDepartment = () => {
    const router = useRouter()
    return (
        <div className='flex flex-col gap-2 lg:flex-row lg:gap-6'>
            <Button onClick={() => router.push("/tableau-de-bord/organisation/departements/creer-un-departement")} className='bg-primary h-[80px] w-full lg:w-[270px] text-[18px] p-5 left-6'>{"Créer un Département"}</Button>
            <Button onClick={() => router.push("/tableau-de-bord/organisation")} className='bg-secondary h-[80px] w-full lg:w-[270px] text-[18px] p-5 left-6'>{"Service"}</Button>
            <Button variant={"outline"} className='h-[80px] w-full lg:w-[270px] text-[18px] p-5 left-6'>{"Créer un service"}</Button>
        </div>
    )
}

export default ActionsDepartment
