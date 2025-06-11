'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import { Loader } from 'lucide-react'

const Actions = () => {
  const router = useRouter()
  const [loadingButton, setLoadingButton] = useState<string | null>(null)

  const handleClick = (path: string, key: string) => {
    setLoadingButton(key)
    router.push(path)
  }

  return (
    <div className='flex flex-col gap-2 lg:flex-row lg:gap-6'>
      <Button
        onClick={() =>
          handleClick('/tableau-de-bord/utilisateurs/creer-un-utilisateur', 'creer')
        }
        className='bg-primary h-[80px] w-full lg:w-[270px] text-[18px] p-5 left-6'
        disabled={loadingButton === 'creer'}
      >
        {loadingButton === 'creer' && <Loader className='animate-spin mr-2' size={18} />}
        Créer un utilisateur
      </Button>

      <Button
        onClick={() => handleClick('', 'roles')}
        className='bg-secondary hover:bg-secondary/90 h-[80px] w-full lg:w-[270px] text-[18px] p-5 left-6'
        disabled={loadingButton === 'roles'}
      >
        {loadingButton === 'roles' && <Loader className='animate-spin mr-2' size={18} />}
        Rôles
      </Button>

      <Button
        onClick={() => handleClick('', 'ajouter')}
        variant='outline'
        className='h-[80px] w-full lg:w-[270px] text-[18px] p-5 left-6'
        disabled={loadingButton === 'ajouter'}
      >
        {loadingButton === 'ajouter' && <Loader className='animate-spin mr-2' size={18} />}
        Ajouter un rôle
      </Button>
    </div>
  )
}

export default Actions
