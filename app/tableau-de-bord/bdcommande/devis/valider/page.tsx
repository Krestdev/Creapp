import React from 'react'
import { redirect } from "next/navigation";



function page() {
    redirect("/tableau-de-bord/bdcommande/devis/");
  return (
    <div>page</div>
  )
}

export default page