"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { useStore } from "@/providers/datastore";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { providerQ } from "@/queries/providers";
import { quotationQ } from "@/queries/quotation";
import { QuotationGroupTable } from "../quotation-group";
import { useQuery } from "@tanstack/react-query";
import { isRole } from "@/lib/utils";

function Page() {
  const { user } = useStore();
  const isAuthorized = isRole({roleList: user?.role ?? [], role: "Donner d'ordre achat"});

  const quotations = useQuery({
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

  if (!isAuthorized) {
    return <ErrorPage statusCode={401} />;
  }
  if (quotations.isError || providers.isError || commands.isError) {
    return <ErrorPage />;
  }
  if (quotations.isSuccess && providers.isSuccess && commands.isSuccess)
    return (
      <div className="content">
        <PageTitle
          title="Approbation des devis"
          subtitle="Sélectionnez les éléments des devis à valider"
          color="green"
        />
        <QuotationGroupTable
          providers={providers.data.data}
          quotations={quotations.data.data}
          requests={commands.data.data}
        />
      </div>
    );
  return <LoadingPage />;
}

export default Page;
