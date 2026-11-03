import PageTitle from "@/components/pageTitle";
import EditQuotation from "./edit-quotation";

async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  return (
    <div className="content">
      <PageTitle
        title="Modifier un devis"
        subtitle="Mettez à jour les informations du devis"
      />
      <EditQuotation id={Number(id)} />
    </div>
  );
}

export default Page;
