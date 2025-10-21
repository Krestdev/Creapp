import PageTitle from "@/components/pageTitle";
import React from "react";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Validation"
        subtitle="Approbation des bons de commandes"
        color="green"
      />
    </div>
  );
};

export default Page;
