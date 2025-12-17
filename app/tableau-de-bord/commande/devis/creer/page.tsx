import PageTitle from '@/components/pageTitle'
import CreateQuotation from './create'

function Page() {
  return (
    <div className="content">
      <PageTitle
        title="Créer un devis"
        subtitle="Complétez ce formulaire pour créer un devis"
        color="blue"
      />
      <CreateQuotation/>
    </div>
  )
}

export default Page