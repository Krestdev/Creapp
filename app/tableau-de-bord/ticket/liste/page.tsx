import PageTitle from "@/components/pageTitle";
import React from "react";

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Liste des Tickets"
        subtitle="Consultez et gérez les tickets."
        color="red"
      />
    </div>
  );
};

export default Page;
