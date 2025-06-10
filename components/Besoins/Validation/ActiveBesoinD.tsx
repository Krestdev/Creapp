"use client"

import React from 'react'
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
import ContenuBesoinD from './ContenuBesoinD'
import { toast } from 'sonner'
import RejeterBesoin from './RejeterBesoin'



interface Props {
    children: React.JSX.Element,
    besoin: Besoins
}


const ActiveBesoinD = ({ children, besoin }: Props) => {
    const router = useRouter();
    const handleApprove = (nom: string) => {
        toast.success(`Le besoin ${nom} a eté validé`);
        console.log(nom);
        
    }

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
                        </DialogTitle>
                    </DialogHeader>
                    <ContenuBesoinD besoin={besoin} />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type='button' onClick={() => handleApprove(besoin.name)} className='h-10 bg-[#16A34A] hover:bg-[#16A34A]/90 border-none' variant="secondary">{"Approuver"}</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <RejeterBesoin id={besoin.id} action={() => console.log(`${besoin.name} rejeté`)}>
                            <Button className='h-10 bg-[#DC2626] hover:bg-[#DC2626]/90 border-none' variant="secondary">{"Rejeter"}</Button>
                            </RejeterBesoin>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button className='h-10' variant="outline">{"Fermer"}</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}

export default ActiveBesoinD
