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

type User = {
    id: number,
    name: string,
    role: string,
    status: "en ligne" | "hors-ligne",
    lastConnection: string,
    service: string,
    poste: string,
    dateCreation: string
}

interface Props {
    children: React.JSX.Element,
    user: User
}


const UserDetail = ({ children, user }: Props) => {
    const router = useRouter()
    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader className='flex items-center'>
                        <DialogTitle className='text-[20px] leading-[100%] tracking-[-2%]'>{`Profil de ${user.name}`}</DialogTitle>
                    </DialogHeader>
                    <div className='flex flex-col pt-5 gap-3'>
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
                    <DialogFooter>
                        <Button onClick={() => router.push(`/tableau-de-bord/utilisateurs/modifier-un-utilisateur/${user.id}`)} className='h-10'>{"Modifier"}</Button>
                        <DialogClose asChild>
                            <Button className='h-10' variant="outline">{"Fermer"}</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}

export default UserDetail
