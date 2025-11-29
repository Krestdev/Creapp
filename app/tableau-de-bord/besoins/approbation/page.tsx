"use client";

import Approbation from "@/components/pages/besoin/Approbation";
import PageTitle from "@/components/pageTitle";
import useAuthGuard from "@/hooks/useAuthGuard";
import React from "react";

const Page = () => {
  const { hasAccess, isChecking } = useAuthGuard({
    authorizedRoles: ["ADMIN", "MANAGER"],
  });

  if (isChecking) {
    return <div>Chargement...</div>;
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Validation des besoins"
        subtitle="Soumettez ou rejetez les besoins."
        color="green"
      />
      <Approbation />
    </div>
  );
};

export default Page;
