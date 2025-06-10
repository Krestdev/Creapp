"use client"

import ActionsBesoin from '@/components/Besoins/Validation/ActionBesoins'
import BesoinsActifs from '@/components/Besoins/Validation/BesoinsActifs'
import ContenuBesoinD from '@/components/Besoins/Validation/ContenuBesoinD'
import MesBesoins from '@/components/Besoins/Validation/MesBesoins'
import { Button } from '@/components/ui/button'
import { Besoins, besoins } from '@/lib/data'
import React, { useState } from 'react'

function BesoinsPage() {

  return (
    <div className='flex flex-col gap-6'>
      <ActionsBesoin />
      <BesoinsActifs besoins={besoins.slice(0, 4)} page={false} />
      <MesBesoins besoins={besoins.slice(0, 4)} page={false} />
    </div>
  )
}

export default BesoinsPage