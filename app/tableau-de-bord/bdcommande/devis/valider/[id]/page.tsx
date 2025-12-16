import React from 'react'
import PageTitle from '@/components/pageTitle';
import SelectQuotation from './select-quotation';

async function Page({params}:{params:Promise<{id:string}>}) {
  const id = (await params).id;
  return (
    <div>
      <PageTitle title="Valider un devis" subtitle={"Sélectionnez les éléments valides pour chaque fournisseur"} color={"blue"}/>
      <SelectQuotation id={id}/>
    </div>
  )
}

export default Page