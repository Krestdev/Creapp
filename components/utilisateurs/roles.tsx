"use client";
import { RoleTable } from "./roles-table";
import { useStore } from "@/providers/datastore";
import { UserQueries } from "@/queries/baseModule";
import { useQuery } from "@tanstack/react-query";

const RolesPage = () => {
  const { isHydrated } = useStore();
  const roles = new UserQueries();
  const rolesData = useQuery({
    queryKey: ["rolesList"],
    queryFn: () => roles.getRoles(),
    enabled: isHydrated,
  });
  if (rolesData.data)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <RoleTable data={rolesData.data.data.filter(x => x.label !== "MANAGER")} />
        </div>
      </div>
    );
};

export default RolesPage;
