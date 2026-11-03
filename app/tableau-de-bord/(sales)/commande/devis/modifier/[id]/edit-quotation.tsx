"use client";

import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/lib/query-keys";
import { quotationQ } from "@/queries/quotation";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import CreateQuotation from "../../creer/create";

/**
 * Page de modification d'un devis : le formulaire de création, prérempli.
 * Un devis approuvé ou rejeté n'est plus modifiable.
 */
function EditQuotation({ id }: { id: number }) {
  const router = useRouter();
  const quotations = useQuery({
    queryKey: queryKeys.quotations,
    queryFn: quotationQ.getAll,
  });

  if (quotations.isLoading) return <LoadingPage />;
  if (quotations.isError) return <ErrorPage error={quotations.error} />;

  const quotation = quotations.data?.data.find((q) => q.id === id);
  if (!quotation) return <ErrorPage statusCode={404} />;

  if (quotation.status === "APPROVED" || quotation.status === "REJECTED") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-xl border border-border-default bg-surface p-6">
        <p className="text-body text-text-secondary">
          {"Ce devis a déjà été traité : il ne peut plus être modifié."}
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          {"Retour"}
        </Button>
      </div>
    );
  }

  return <CreateQuotation quotation={quotation} />;
}

export default EditQuotation;
