import ValidationBC from "@/components/pages/ticket/validation";
import PageTitle from "@/components/pageTitle";
import React from "react";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Approbation"
        subtitle="Approbation des bons de ticket"
        color="green"
      />
      <ValidationBC />
    </div>
  );
};

export default Page;
