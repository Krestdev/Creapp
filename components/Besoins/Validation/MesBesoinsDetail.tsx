"use client"

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"
import { Button } from '../../ui/button'
import { useRouter } from 'next/navigation'
import { Besoins } from '@/lib/data'
import { Badge } from '@/components/ui/badge'



interface Props {
    children: React.JSX.Element,
    besoin: Besoins
}


const MesBesoinsDetail = ({ children, besoin }: Props) => {
    const router = useRouter();

    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[420px] sm:w-full">
                    <DialogHeader>
                        <DialogTitle className='text-[20px] leading-[100%] tracking-[-2%] flex gap-2 items-center'>
                            {`${besoin.name}`}
                            <Badge className={`${besoin.statut === "Validé" ? "bg-[#22C55E] hover:bg-[#22C55E]/90" :
                                besoin.statut === "Terminé" ? "bg-[#700032] hover:bg-[#700032]/90" :
                                    besoin.statut === "Refusé" ? "bg-[#EF4444] hover:bg-[#EF4444]/90" :
                                        "bg-[#F97316] hover:bg-[#F97316]/90"}`
                            }>
                                {besoin.statut}
                            </Badge>
                        </DialogTitle>
                    </DialogHeader>
                    <div className='flex flex-col pt-5 gap-3'>
                        <div className='flex flex-col gap-2'>
                            <p className='text-[#A1A1A1] font-medium'>{"Description"}</p>
                            <p className='text-[#18181B] font-medium'>{besoin.description ? besoin.description : "---"}</p>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-[#A1A1A1] font-medium'>{"Echéance"}</p>
                            <p className='text-[#18181B] font-medium'>{besoin.dateEcheance}</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button className='h-10' variant="outline">{"Fermer"}</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}

export default MesBesoinsDetail
