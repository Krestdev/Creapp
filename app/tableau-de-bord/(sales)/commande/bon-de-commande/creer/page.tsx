import CreateForm from '@/app/tableau-de-bord/(sales)/commande/bon-de-commande/creer/create-form'
import PageTitle from '@/components/pageTitle'

function Page() {
  return (
    <div className="content">
        <PageTitle title="Créer un bon de Commande" subtitle="Complétez le formulaire pour créer un bon de Commande" color="blue"/>
        <CreateForm/>
    </div>
  )
}

export default Page