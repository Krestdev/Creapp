import { AddProject } from '@/components/Projets/AddProjet'
import React from 'react'

const page = () => {
    return (
        <div className='flex flex-col gap-14 px-7 py-6'>
            <div className='flex flex-col gap-2 items-center w-full'>
                <h1>{"Nouveau Projet"}</h1>
                <p className='text-[#A1A1A1] font-normal text-[16px]'>{"Completez le formulaire pour initier un projet"}</p>
            </div>
            <AddProject />
        </div>
    )
}

export default page
