'use client'

import React, { useState } from 'react'
import { Button } from '../../ui/button'
import { useRouter } from 'next/navigation'
import { Loader } from 'lucide-react'

const ActionsServices = () => {
  const router = useRouter()
  const [loadingButton, setLoadingButton] = useState<string | null>(null)

  const handleClick = (path: string, buttonId: string) => {
    setLoadingButton(buttonId)
    router.push(path)
  }

  return (
    <div className='flex flex-col gap-2 lg:flex-row lg:gap-6'>
      <Button
        disabled={loadingButton === 'creer-service'}
        onClick={() => handleClick('/tableau-de-bord/organisation/creer-un-service', 'creer-service')}
        className='bg-primary h-[80px] w-full lg:w-[270px] text-[18px] p-5 left-6'
      >
        Créer un service
        {loadingButton === 'creer-service' && <Loader className='animate-spin ml-2' size={16} />}
      </Button>

      <Button
        disabled={loadingButton === 'departements'}
        onClick={() => handleClick('/tableau-de-bord/organisation/departements', 'departements')}
        className='bg-secondary hover:bg-secondary/90 h-[80px] w-full lg:w-[270px] text-[18px] p-5 left-6'
      >
        Département
        {loadingButton === 'departements' && <Loader className='animate-spin ml-2' size={16} />}
      </Button>

      {/* <Button
        disabled={loadingButton === 'creer-departement'}
        variant='outline'
        onClick={() => handleClick('/tableau-de-bord/organisation/creer-un-departement', 'creer-departement')}
        className='h-[80px] w-full lg:w-[270px] text-[18px] p-5 left-6'
      >
        Créer un département
        {loadingButton === 'creer-departement' && <Loader className='animate-spin ml-2' size={16} />}
      </Button> */}
    </div>
  )
}

export default ActionsServices
