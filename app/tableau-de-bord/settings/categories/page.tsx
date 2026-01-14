import CategoriesPage from "@/components/organisation/categories";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function Page() {
  const links: Array<{ title: string; href: string }> = [
    {
      title: "Créer un Catégorie",
      href: "/tableau-de-bord/organisation/createcategorie",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Catégories besoins"
        subtitle="Consultez la liste des catégories."
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
      <CategoriesPage />
    </div>
  );
}

export default Page;
