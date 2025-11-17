import RequestList from "@/components/pages/besoin/RequestListPage";
import PageTitle from "@/components/pageTitle";
import React from "react";

const Page = () => {
  

  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Mes Besoins"
        subtitle="Consulter et gerez les besoins"
        color="red"
      />
      {/* Page table */}
      <RequestList />
    </div>
  );
};

export default Page;
