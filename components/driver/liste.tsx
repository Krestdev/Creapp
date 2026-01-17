"use client";
import { useStore } from "@/providers/datastore";
import { driverQ } from "@/queries/driver";
import { useQuery } from "@tanstack/react-query";
import { DriverTable } from "./driver-table";

const DriverListPage = () => {
  const { isHydrated } = useStore();
  const driverDate = useQuery({
    queryKey: ["drivers"],
    queryFn: () => driverQ.getAll(),
    enabled: isHydrated,
  });

  if (!driverDate.isLoading && driverDate.data)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <DriverTable data={driverDate.data.data} />
        </div>
      </div>
    );
};

export default DriverListPage;
