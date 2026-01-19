"use client";
import ProviderListPage from "@/components/provider/liste";
import PageTitle from "@/components/pageTitle";
import { NavLink } from "@/types/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { providerQ } from "@/queries/providers";
import LoadingPage from "@/components/loading-page";
import ErrorPage from "@/components/error-page";
import { ProviderTable } from "@/components/provider/provider-table";

function Page() {
  const links: Array<NavLink> = [
    {
      title: "Créer un fournisseur",
      href: "./fournisseurs/creer",
    },
  ];

   const {data:providers, isError, error, isSuccess, isLoading} = useQuery({
    queryKey: ["providersList"],
    queryFn: () => providerQ.getAll(),
  });

  if(isLoading) return <LoadingPage/>;
  if(isError) return <ErrorPage error={error} />
  if(isSuccess){
    return (
      <div className="flex flex-col gap-6">
        {/* page title */}
        <PageTitle
          title="Fournisseurs"
          subtitle="Consultez la liste des fournisseurs."
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
        <ProviderTable data={providers.data} />
      </div>
    );
  }
}

export default Page;
