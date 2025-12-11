import Paiements from "@/components/ticket/paiement";
import PageTitle from "@/components/pageTitle";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Paiements"
        subtitle="Consultez la liste des paiements"
        color="red"
      />
      <Paiements />
    </div>
  );
};

export default Page;
