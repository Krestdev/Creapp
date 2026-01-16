"use client";

import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { DevisTable } from "@/components/tables/DevisTable";
import { Button } from "@/components/ui/button";
import { useStore } from "@/providers/datastore";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { providerQ } from "@/queries/providers";
import { quotationQ } from "@/queries/quotation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

const Page = () => {
  const { user } = useStore();
  const isAdmin = user?.role.some(
    (r) => r.label === "SALES_MANAGER" || r.label === "ADMIN"
  );

  const links = [
    {
      title: "Créer un devis",
      href: "./devis/creer",
    },
  ];
  /**Quotation fetch */

  const { data, isSuccess, isError, error, isLoading } = useQuery({
    queryKey: ["quotations"],
    queryFn: quotationQ.getAll,
  });
  /**Providers fetch */

  const providers = useQuery({
    queryKey: ["providers"],
    queryFn: providerQ.getAll,
  });
  /**Commands fetch */
  const commands = useQuery({
    queryKey: ["commands"],
    queryFn: commandRqstQ.getAll,
  });
  if (isLoading || providers.isLoading || commands.isLoading) {
    return <LoadingPage />;
  }
  if (isError || providers.isError || commands.isError) {
    return (
      <ErrorPage
        error={error ?? providers.error ?? commands.error ?? undefined}
      />
    );
  }
  if (isSuccess && providers.isSuccess && commands.isSuccess)
    return (
      <div className="content">
        <PageTitle
          title="Devis"
          subtitle="Consultez et gérez les cotations."
          color="red"
        >
          {links
            .filter((p) => (isAdmin ? true : p.href !== "./devis/approbation"))
            .map((link, id) => {
              const isLast = links.length > 1 ? id === links.length - 1 : false;
              return (
                <Link key={id} href={link.href}>
                  <Button size={"lg"} variant={isLast ? "accent" : "ghost"}>
                    {link.title}
                  </Button>
                </Link>
              );
            })}
        </PageTitle>
        <DevisTable
          data={data.data}
          commands={commands.data.data}
          providers={providers.data.data}
        />
      </div>
    );
};

export default Page;
