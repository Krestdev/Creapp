
import AddServices from '@/components/Organisation/Services/AddService'
import React from 'react'

const CreatePage = () => {
  return (
    <div className='flex flex-col gap-14 px-7 py-6'>
      <div className='flex flex-col gap-2 items-center w-full'>
        <h1>{"Création de Service"}</h1>
        <p className='text-[#A1A1A1] font-normal text-[16px]'>{"Formulaire de création d'un service"}</p>
      </div>
      <AddServices />
    </div>
  )
}

export default CreatePage
