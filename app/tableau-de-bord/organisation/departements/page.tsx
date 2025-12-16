import DepartementPage from "@/components/organisation/departements";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function Page() {
  const links: Array<{ title: string; href: string }> = [
    {
      title: "Créer un département",
      href: "/tableau-de-bord/organisation/createdepartement",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Départements"
        subtitle="Consultez la liste des départements."
        color="red"
      >
        {links.map((link, id) => {
          const isLast = links.length > 1 ? false : id === links.length - 1;
          return (
            <Link key={id} href={link.href}>
              <Button size={"lg"} variant={isLast ? "accent" : "ghost"}>
                {link.title}
              </Button>
            </Link>
          );
        })}
      </PageTitle>
      <DepartementPage />
    </div>
  );
}

export default Page;
