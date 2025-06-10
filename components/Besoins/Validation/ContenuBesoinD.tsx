import { Besoins } from '@/lib/data'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { LucideEllipsisVertical, LucideX } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

interface Props {
    besoin: Besoins | undefined
}

const ContenuBesoinD = ({ besoin }: Props) => {
    return (
        <div>
            {
                besoin ?
                    <div className='flex flex-col pt-5 gap-3'>
                        <div className='flex flex-col gap-2'>
                            <p className='text-[#A1A1A1] font-normal text-[12px]'>{"Projet associé"}</p>
                            <p className='text-[#18181B] font-medium'>{besoin.projet}</p>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-[#A1A1A1] font-normal text-[12px]'>{"Description"}</p>
                            <p className='text-[#18181B] font-medium'>{besoin.description ? besoin.description : "---"}</p>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-[#A1A1A1] font-normal text-[12px]'>{"Montant"}</p>
                            <p className='text-[#18181B] font-medium'>{besoin.cout}</p>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-[#A1A1A1] font-normal text-[12px]'>{"Echéance"}</p>
                            <p className='text-[#18181B] font-medium'>{besoin.dateEcheance}</p>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-[#A1A1A1] font-normal text-[12px]'>{"Justificatif"}</p>
                            {
                                besoin.justificatifs.length > 0 ?
                                    <div className='flex flex-col gap-2'>
                                        {
                                            besoin.justificatifs.map((x, i) => (
                                                <div key={i} className='flex items-center justify-between bg-[#FAFAFA] px-3 h-10 rounded-[6px]'>
                                                    <p>{x}</p>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <LucideEllipsisVertical className='h-4 w-4 cursor-pointer' />
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[160px] flex flex-col items-start">
                                                            <Button variant={"ghost"} className='w-full !font-medium justify-start'>{"Ouvrir"}</Button>
                                                            <Button variant={"ghost"} className='w-full !font-medium justify-start'>{"Telecharger"}</Button>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            ))
                                        }
                                        <Button variant={"outline"} className='w-full'>{"Ajouter un document"}</Button>
                                    </div>
                                    : "---"
                            }
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-[#A1A1A1] font-normal text-[12px]'>{"Crée le"}</p>
                            <p className='text-[#18181B] font-medium'>{besoin.dateEmission}</p>
                        </div>
                    </div> :
                    <p>{"Aucun besoin selectioné"}</p>
            }
        </div>
    )
}

export default ContenuBesoinD
