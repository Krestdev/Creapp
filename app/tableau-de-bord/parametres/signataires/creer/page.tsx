import PageTitle from "@/components/pageTitle";
import CreateSignatairForm from "@/components/signatair/create-signatair";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Configurer les signataires"
        subtitle="Formulaire de configuration"
        color="blue"
      />
      <CreateSignatairForm />
    </div>
  );
};

export default Page;
