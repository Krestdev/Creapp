"use client";
import UtilisateursPage from "@/components/utilisateurs/utilisateurs";
import PageTitle from "@/components/pageTitle";
import { NavLink } from "@/types/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SignatairPage from "@/components/signatair/signatair";

function Page() {
  const links: Array<NavLink> = [
    {
      title: "Configurer",
      href: "./signatairs/create",
      hide: false,
      disabled: false,
    },
  ];
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Signataires"
        subtitle="Consultez et gérez les Signataires."
        color="red"
      >
        {links
          .filter((x) => (!x.hide ? true : x.hide === true && false))
          .map((link, id) => {
            const isLast = links.length > 1 ? id === links.length - 1 : false;
            return (
              <Link
                key={id}
                href={link.href}
                onClick={(e) => {
                  link.disabled && e.preventDefault();
                }}
                className={cn(link.disabled && "cursor-not-allowed")}
              >
                <Button
                  size={"lg"}
                  variant={isLast ? "accent" : "ghost"}
                  disabled={link.disabled}
                >
                  {link.title}
                </Button>
              </Link>
            );
          })}
      </PageTitle>
      <SignatairPage />
    </div>
  );
}

export default Page;
