import PageTitle from "@/components/pageTitle";
import ProjectListPage from "@/components/projets/liste";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

function Page() {

  const links = [
    {
      href: "/tableau-de-bord/projets/creer",
      label: "Créer un projet",
    },
  ];
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Projets"
        subtitle="Consultez et gérez les projets."
        color="red"
      >
        {links
          .map((link, id) => {
            const isLast = links.length > 1 ? id === links.length - 1 : false;
            return (
              <Link
                key={id}
                href={link.href}
                className={cn("cursor-not-allowed")}
              >
                <Button
                  size={"lg"}
                  variant={isLast ? "accent" : "ghost"}
                >
                  {link.label}
                </Button>
              </Link>
            );
          })}
      </PageTitle>
      <ProjectListPage />
    </div>
  );
}

export default Page;
