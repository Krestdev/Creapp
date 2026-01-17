"use client";
import { userQ } from "@/queries/baseModule";
import { useQuery } from "@tanstack/react-query";
import { RoleTable } from "./roles-table";

const RolesPage = () => {
  const rolesData = useQuery({
    queryKey: ["rolesList"],
    queryFn: () => userQ.getRoles()
  });
  if (rolesData.data)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <RoleTable
            data={rolesData.data.data.filter((x) => x.label !== "MANAGER")}
          />
        </div>
      </div>
    );
};

export default RolesPage;
