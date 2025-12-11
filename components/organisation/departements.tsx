"use client";
import { DepartementTable } from "./departement-table";
import { useStore } from "@/providers/datastore";
import { DepartmentQueries } from "@/queries/departmentModule";
import { useQuery } from "@tanstack/react-query";

const DepartementPage = () => {
  const { isHydrated } = useStore();
  const department = new DepartmentQueries();
  const departmentData = useQuery({
    queryKey: ["departmentList"],
    queryFn: () => department.getAll(),
    enabled: isHydrated,
  });
  if (departmentData.data)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <h2>Departement</h2>
          </div>
          <DepartementTable data={departmentData.data.data} />
        </div>
      </div>
    );
};

export default DepartementPage;
