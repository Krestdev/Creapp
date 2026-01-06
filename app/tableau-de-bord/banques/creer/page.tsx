import PageTitle from '@/components/pageTitle'
import React from 'react'
import CreateBank from './create-bank-form'

function Page() {
  return (
    <div className='content'>
        <PageTitle title='Ajouter un compte' subtitle='Complétez le formulaire pour créer un compte' color="blue" />
        <CreateBank/>
    </div>
  )
}

export default Page