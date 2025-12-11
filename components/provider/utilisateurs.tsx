"use client";
import { useStore } from "@/providers/datastore";
import { UserQueries } from "@/queries/baseModule";
import { useQuery } from "@tanstack/react-query";
import { UtilisateursTable } from "../utilisateurs/utilisateurs-table";

const UtilisateursPage = () => {
  const { isHydrated } = useStore();
  const user = new UserQueries();
  const userData = useQuery({
    queryKey: ["usersList"],
    queryFn: () => user.getAll(),
    enabled: isHydrated,
  });

  if (userData.data)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <h2>Utilisateurs</h2>
          </div>
          {/* <UtilisateursTable data={utilisateursData} /> */}
          <UtilisateursTable data={userData.data.data} />
        </div>
      </div>
    );
};

export default UtilisateursPage;
