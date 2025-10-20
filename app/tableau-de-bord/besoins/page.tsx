import RequestList from "@/components/pages/besoin/requestList";
import PageTitle from "@/components/pageTitle";
import React from "react";

function Besoins() {
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle />
      {/* Page table */}
      <RequestList />
    </div>
  );
}

export default Besoins;
