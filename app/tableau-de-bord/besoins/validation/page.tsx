import BesoinsActifs from '@/components/Besoins/Validation/BesoinsActifs'
import { besoins } from '@/lib/data'
import React from 'react'

const page = () => {
  return (
    <div>
      <BesoinsActifs besoins={besoins} page={true} />
    </div>
  )
}

export default page
