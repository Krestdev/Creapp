"use client";
import { useStore } from "@/providers/datastore";
import { vehicleQ } from "@/queries/vehicule";
import { useQuery } from "@tanstack/react-query";
import { VehiclesTable } from "./vehicle-table";

const VehiclePage = () => {
  const { isHydrated } = useStore();
  const vehicleData = useQuery({
    queryKey: ["vehiclesList"],
    queryFn: () => vehicleQ.getAll(),
    enabled: isHydrated,
  });

  if (vehicleData.data)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          {/* <VehicleTable data={vehicleData} /> */}
          <VehiclesTable data={vehicleData.data.data} />
        </div>
      </div>
    );
};

export default VehiclePage;
