import MesBesoins from '@/components/Besoins/Validation/MesBesoins'
import { besoins } from '@/lib/data'
import React from 'react'

const page = () => {
  return (
    <div>
      <MesBesoins besoins={besoins} page={true} />
    </div>
  )
}

export default page
