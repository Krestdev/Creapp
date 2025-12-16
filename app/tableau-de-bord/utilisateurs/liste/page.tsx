import UserListPage from "@/components/utilisateurs/liste";
import PageTitle from "@/components/pageTitle";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function Page() {
  const links: Array<{ title: string; href: string }> = [
    {
      title: "Créer un utilisateur",
      href: "/tableau-de-bord/utilisateurs/create",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Utilisateurs"
        subtitle="Consultez la liste des utilisateurs."
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
      <UserListPage />
    </div>
  );
}

export default Page;
