"use client";
import { DepartementTable } from "./departement-table";
import { useStore } from "@/providers/datastore";
import { departmentQ } from "@/queries/departmentModule";
import { useQuery } from "@tanstack/react-query";

const DepartementPage = () => {
  const { isHydrated } = useStore();
  const departmentData = useQuery({
    queryKey: ["departmentList"],
    queryFn: () => departmentQ.getAll(),
    enabled: isHydrated,
  });
  if (departmentData.data)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <DepartementTable data={departmentData.data.data} />
        </div>
      </div>
    );
};

export default DepartementPage;
