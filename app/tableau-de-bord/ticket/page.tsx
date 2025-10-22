import Tickets from "@/components/pages/ticket/tickets";
import PageTitle from "@/components/pageTitle";

function Page() {
  const links = [
    { title: "Validation", href: "/tableau-de-bord/ticket/validation" },
    {
      title: "Liste des tickets",
      href: "/tableau-de-bord/ticket/liste",
    },
    {
      title: "Créer un paiement",
      href: "/tableau-de-bord/ticket/nouveaux",
    },
    { title: "Paiements", href: "/tableau-de-bord/ticket/paiements" },
    {
      title: "Paiements reçus",
      href: "/tableau-de-bord/ticket/paiementrecus",
    },
  ];
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Tickets"
        subtitle="Consultez et gérez les tickets."
        color="red"
        links={links}
      />
      <Tickets />
    </div>
  );
}

export default Page;
