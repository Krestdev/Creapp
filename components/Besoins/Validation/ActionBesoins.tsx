"use client"

import React from 'react'
import { Button } from '../../ui/button'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const ActionsBesoin = () => {
    const router = useRouter()
    return (
        <div className='flex flex-col gap-2 lg:flex-row lg:gap-6'>
            <Button onClick={() => router.push("/tableau-de-bord/besoins/nouveau-besoin")} className='bg-primary h-[80px] w-full lg:w-[270px] text-[18px] p-5 left-6'>{"Créer un besoin"}</Button>
            <Button onClick={() => router.push("/tableau-de-bord/besoins/mes-besoins")} className='bg-secondary hover:bg-secondary/90 h-[80px] w-full lg:w-[270px] text-[18px] p-5 left-6'>
                {"Mes besoins"}
                <span className={cn("inline-flex items-center justify-center p-1 min-w-7 text-xs text-white bg-red-700 rounded")}>{"1"}</span>
            </Button>
            <Button onClick={() => router.push("/tableau-de-bord/besoins/validation")} className='h-[80px] w-full lg:w-[270px] text-[18px] p-5 left-6 bg-[#15803D] hover:bg-[#15803D]/90 '>{"Besoins à valider"}</Button>
            <Button className='h-[80px] w-full lg:w-[270px] text-[18px] p-5 left-6 bg-[#3F3F46] hover:bg-[#3F3F46]/90 '>{"Historique de besoins"}</Button>
        </div>
    )
}

export default ActionsBesoin
