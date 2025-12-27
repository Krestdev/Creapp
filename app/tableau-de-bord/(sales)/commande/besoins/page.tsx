import PageTitle from "@/components/pageTitle";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Besoins"
        subtitle="Liste des besoins à traiter vers une commande ou en destockage"
        color="red"
      />
      {/* <Besoins /> */}
    </div>
  );
};

export default Page;
