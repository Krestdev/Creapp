import Approbation from "@/components/pages/besoin/Approbation";
import PageTitle from "@/components/pageTitle";
import React from "react";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Validation des besoins"
        subtitle="Approuvez ou rejetez les besoins."
        color="green"
      />
      <Approbation />
    </div>
  );
};

export default Page;
