import React from 'react'
import PageTitle from '@/components/pageTitle';
import SelectQuotation from './select-quotation';

async function Page({params}:{params:Promise<{id:string}>}) {
  const id = (await params).id;
  return (
    <div className='content'>
      <PageTitle title="Comparer les devis" subtitle={"Sélectionnez les éléments valides pour chaque fournisseur"} />
      <SelectQuotation id={id}/>
    </div>
  )
}

export default Page