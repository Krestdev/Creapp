"use client";
import PageTitle from "@/components/pageTitle";
import SignatairPage from "@/components/signatair/signatair";
import { NavLink } from "@/types/types";

function Page() {
  const links: Array<NavLink> = [
    {
      title: "Configurer les signataires",
      href: "./signataires/creer",
      hide: false,
      disabled: false,
    },
  ];
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Signataires"
        subtitle="Consultez et gérez les Signataires."
        color="red"
        links={links}
      />
      <SignatairPage />
    </div>
  );
}

export default Page;
