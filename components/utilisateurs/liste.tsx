"use client";
import { useStore } from "@/providers/datastore";
import { UserQueries } from "@/queries/baseModule";
import { useQuery } from "@tanstack/react-query";
import { UtilisateursTable } from "./utilisateurs-table";

const UserListPage = () => {
  const { isHydrated } = useStore();
  const user = new UserQueries();
  const userData = useQuery({
    queryKey: ["users"],
    queryFn: () => user.getAll(),
    enabled: isHydrated,
  });

  if (userData.data)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <UtilisateursTable data={userData.data.data} />
        </div>
      </div>
    );
};

export default UserListPage;
