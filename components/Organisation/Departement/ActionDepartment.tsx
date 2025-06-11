'use client'

import React, { useState } from 'react'
import { Button } from '../../ui/button'
import { useRouter } from 'next/navigation'
import { Loader } from 'lucide-react'

const ActionsDepartment = () => {
  const router = useRouter()
  const [loadingButton, setLoadingButton] = useState<string | null>(null)

  const handleClick = (path: string, buttonId: string) => {
    setLoadingButton(buttonId)
    router.push(path)
  }

  return (
    <div className='flex flex-col gap-2 lg:flex-row lg:gap-6'>
      <Button
        disabled={loadingButton === 'creer-departement'}
        onClick={() =>
          handleClick('/tableau-de-bord/organisation/creer-un-departement', 'creer-departement')
        }
        className='bg-primary h-[80px] w-full lg:w-[270px] text-[18px] p-5 left-6'
      >
        Créer un Département
        {loadingButton === 'creer-departement' && <Loader className='animate-spin ml-2' size={16} />}
      </Button>

      <Button
        disabled={loadingButton === 'service'}
        onClick={() => handleClick('/tableau-de-bord/organisation/services', 'service')}
        className='bg-secondary hover:bg-secondary/90 h-[80px] w-full lg:w-[270px] text-[18px] p-5 left-6'
      >
        Service
        {loadingButton === 'service' && <Loader className='animate-spin ml-2' size={16} />}
      </Button>

      {/* <Button
        disabled={loadingButton === 'creer-service'}
        variant='outline'
        onClick={() => handleClick('/tableau-de-bord/organisation/creer-un-service', 'creer-service')}
        className='h-[80px] w-full lg:w-[270px] text-[18px] p-5 left-6'
      >
        Créer un service
        {loadingButton === 'creer-service' && <Loader className='animate-spin ml-2' size={16} />}
      </Button> */}
    </div>
  )
}

export default ActionsDepartment
