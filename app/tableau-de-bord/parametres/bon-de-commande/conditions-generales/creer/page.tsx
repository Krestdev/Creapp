import PageTitle from '@/components/pageTitle'
import React from 'react'
import CreateCondition from './create-form'

function Page() {
  return (
    <div className="content">
        <PageTitle title="Créer une condition" color="blue" subtitle='Complétez le formulaire pour créer une nouvelle valeur' />
        <CreateCondition/>
    </div>
  )
}

export default Page