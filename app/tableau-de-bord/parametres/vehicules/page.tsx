"use client";
import PageTitle from "@/components/pageTitle";
import VehiclePage from "@/components/vehicle/vehiclePage";
import { NavLink } from "@/types/types";

function Page() {
  const links: Array<NavLink> = [
    {
      title: "Ajouter un véhicule",
      href: "./vehicules/creer",
      hide: false,
      disabled: false,
    },
  ];
  return (
    <div className="flex flex-col gap-6">
      {/* page title */}
      <PageTitle
        title="Véhicules"
        subtitle="Consultez et gérez les véhicules."
        color="red"
        links={links}
      />
      <VehiclePage />
    </div>
  );
}

export default Page;
