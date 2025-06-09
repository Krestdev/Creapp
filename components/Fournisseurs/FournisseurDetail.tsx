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
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import { Fournisseur } from '@/lib/data'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Select, SelectValue } from '@radix-ui/react-select'
import { SelectContent, SelectItem, SelectTrigger } from '../ui/select'
import { Textarea } from '../ui/textarea'

interface Props {
    fournisseur: Fournisseur | undefined
}



const FournisseurDetail = ({ fournisseur }: Props) => {
    console.log(fournisseur?.type);
    const router = useRouter();
    return (
        <div className='flex flex-col gap-14 px-7 py-6 max-w-[1024px] w-full'>
            <h1 className='w-full text-center'>{`Fournisseur ${fournisseur?.name}`}</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 justify-between w-full'>
                <div className='flex flex-col gap-7 max-w-[448px] w-full'>
                    <div className='flex flex-col gap-3'>
                        <p className='text-secondary font-medium text-[18px]'>{"Informations générales"}</p>
                        <div className='flex flex-col gap-2'>
                            <p className='text-gray-900 font-medium'>{"Nom du fournisseur"}</p>
                            <Input value={fournisseur?.name} />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-gray-900 font-medium'>{"Secteur(s) d'activité"}</p>
                            <div className='flex gap-2 px-4 h-10 rounded-sm border border-gray-200'>
                                {
                                    fournisseur?.activities.map((x, i) => (
                                        <Badge key={i} className='bg-secondary/10 text-black'>{x}</Badge>
                                    ))
                                }
                            </div>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-gray-900 font-medium'>{"Type"}</p>
                            <Select value={fournisseur?.type} disabled>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={fournisseur?.type || ""}>{fournisseur?.type}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className='flex flex-col gap-3'>
                        <p className='text-secondary font-medium text-[18px]'>{"Coordonnées de contact"}</p>
                        <div className='flex flex-col gap-2'>
                            <p className='text-gray-900 font-medium'>{"Nom du contact principal"}</p>
                            <Input value={fournisseur?.proprietaire} />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-gray-900 font-medium'>{"Téléphone"}</p>
                            <Input value={fournisseur?.tel} />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-gray-900 font-medium'>{"Adresse complète"}</p>
                            <Input value={fournisseur?.adresse} />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-gray-900 font-medium'>{"Email"}</p>
                            <Input value={fournisseur?.mail} />
                        </div>
                    </div>
                </div>
                <div className='flex flex-col gap-7 max-w-[448px] w-full'>
                    <div className='flex flex-col gap-3'>
                        <p className='text-secondary font-medium text-[18px]'>{"Informations administratives & fiscales"}</p>
                        <div className='flex flex-col gap-2'>
                            <p className='text-gray-900 font-medium'>{"NUI"}</p>
                            <Input value={fournisseur?.nui} />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-gray-900 font-medium'>{"Régistre fiscal"}</p>
                            <Input value={fournisseur?.registreFiscal} />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-gray-900 font-medium'>{"Régistre de commerce"}</p>
                            <Input value={fournisseur?.registreCommerce} />
                        </div>
                    </div>
                    <div className='flex flex-col gap-3'>
                        <p className='text-secondary font-medium text-[18px]'>{"Informations Banquaires"}</p>
                        <div className='flex flex-col gap-2'>
                            <p className='text-gray-900 font-medium'>{"Banque"}</p>
                            <Input value={fournisseur?.banque} />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-gray-900 font-medium'>{"Numéro de compte"}</p>
                            <Input value={fournisseur?.nuCompte} />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-gray-900 font-medium'>{"Code banque"}</p>
                            <Input value={fournisseur?.codeBanque} />
                        </div>
                    </div>
                    <div className='flex flex-col gap-3'>
                        <p className='text-secondary font-medium text-[18px]'>{"Informations complementaires"}</p>
                        <div className='flex flex-col gap-2'>
                            <p className='text-gray-900 font-medium'>{"Banque"}</p>
                            <Textarea value={fournisseur?.banque} />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-gray-900 font-medium'>{"Numéro de compte"}</p>
                            <Input value={fournisseur?.nuCompte} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FournisseurDetail
