"use client";
import { useStore } from "@/providers/datastore";
import { ProviderQueries } from "@/queries/providers";
import { useQuery } from "@tanstack/react-query";
import { ProviderTable } from "./provider-table";

const ProviderListPage = () => {
  const { isHydrated } = useStore();
  const provider = new ProviderQueries();
  const providerDate = useQuery({
    queryKey: ["providersList"],
    queryFn: () => provider.getAll(),
    enabled: isHydrated,
  });

  if (providerDate.data)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <h2>{"Fournisseurs"}</h2>
          </div>
          <ProviderTable data={providerDate.data.data} />
        </div>
      </div>
    );
};

export default ProviderListPage;
