import PageTitle from "@/components/pageTitle";
import React from "react";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Paiements reçus"
        subtitle="Consultez la liste des paiements reçus"
        color="red"
      />
    </div>
  );
};

export default Page;
