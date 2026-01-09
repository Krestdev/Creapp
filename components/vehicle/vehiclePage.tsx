"use client";
import { useStore } from "@/providers/datastore";
import { useQuery } from "@tanstack/react-query";
import { VehiclesTable } from "./vehicle-table";
import { VehicleQueries } from "@/queries/vehicule";

const VehiclePage = () => {
  const { isHydrated } = useStore();
  const vehicle = new VehicleQueries();
  const vehicleData = useQuery({
    queryKey: ["vehiclesList"],
    queryFn: () => vehicle.getAll(),
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
