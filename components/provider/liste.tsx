"use client";
import { useStore } from "@/providers/datastore";
import { providerQ } from "@/queries/providers";
import { useQuery } from "@tanstack/react-query";
import { ProviderTable } from "./provider-table";

const ProviderListPage = () => {
  const { isHydrated } = useStore();
  const providerDate = useQuery({
    queryKey: ["providersList"],
    queryFn: () => providerQ.getAll(),
    enabled: isHydrated,
  });

  if (providerDate.data)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <ProviderTable data={providerDate.data.data} />
        </div>
      </div>
    );
};

export default ProviderListPage;
