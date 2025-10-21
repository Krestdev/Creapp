import RequestList from "@/components/pages/besoin/RequestList";
import PageTitle from "@/components/pageTitle";

function Page() {
  const links = [
    { title: "Creer un besoin", href: "/tableau-de-bord/besoins/create" },
    { title: "Mes Besoins", href: "/tableau-de-bord/besoins/mylist" },
    { title: "Approbation", href: "/tableau-de-bord/besoins/approbation" },
  ];
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Besoins"
        subtitle="Consulter et gerez les besoins"
        color="red"
        links={links}
      />
      {/* Page table */}
      <RequestList />
    </div>
  );
}

export default Page;
