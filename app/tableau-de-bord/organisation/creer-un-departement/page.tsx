import AddDepartment from '@/components/Organisation/Departement/AddDepartment'
import React from 'react'

const page = () => {
    return (
        <div className='flex flex-col gap-14 px-7 py-6'>
            <div className='flex flex-col gap-2 items-center w-full'>
                <h1>{"Création de Département"}</h1>
                <p className='text-[#A1A1A1] font-normal text-[16px]'>{"Formulaire de création d'un département"}</p>
            </div>
            <AddDepartment />
        </div>
    )
}

export default page
