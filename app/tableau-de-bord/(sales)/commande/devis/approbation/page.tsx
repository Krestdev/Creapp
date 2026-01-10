"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { useFetchQuery } from "@/hooks/useData";
import { useStore } from "@/providers/datastore";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { providerQ } from "@/queries/providers";
import { quotationQ } from "@/queries/quotation";
import { QuotationGroupTable } from "../quotation-group";

function Page() {
  const { user } = useStore();
  const isAdmin = user?.role.some(
    (r) => r.label === "SALES_MANAGER" || r.label === "ADMIN"
  );

  const quotations = useFetchQuery(["quotations"], quotationQ.getAll);
  /**Providers fetch */

  const providers = useFetchQuery(["providers"], providerQ.getAll);
  /**Commands fetch */
  const commands = useFetchQuery(["commands"], commandRqstQ.getAll, 30000);

  if (!isAdmin) {
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
