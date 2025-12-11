import PaiementRecus from "@/components/ticket/paiementRecu";
import PageTitle from "@/components/pageTitle";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Paiements reçus"
        subtitle="Consultez la liste des paiements reçus"
        color="red"
      />
      <PaiementRecus />
    </div>
  );
};

export default Page;
