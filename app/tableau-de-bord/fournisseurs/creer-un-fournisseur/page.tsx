import AddFournisseur from '@/components/Fournisseurs/AddFournisseur'
import React from 'react'

const page = () => {
  return (
    <div className='flex flex-col gap-14 px-7 py-6'>
      <div className='flex flex-col gap-2 items-center w-full'>
        <h1>{"Ajouter un fournisseur"}</h1>
        <p className='text-[#A1A1A1] font-normal text-[16px]'>{"Fomulaire d'ajout d'un fournisseur"}</p>
      </div>
      <AddFournisseur />
    </div>
  )
}

export default page
