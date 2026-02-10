import { redirect } from 'next/navigation'
import React from 'react'

function page() {
    
  return redirect("./bon-de-commande/conditions-generales")
}

export default page