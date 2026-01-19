"use client";
import { useStore } from "@/providers/datastore";
import { userQ } from "@/queries/baseModule";
import { useQuery } from "@tanstack/react-query";
import { UtilisateursTable } from "../utilisateurs/utilisateurs-table";

const UtilisateursPage = () => {
  const { isHydrated } = useStore();
  const userData = useQuery({
    queryKey: ["users"],
    queryFn: () => userQ.getAll(),
    enabled: isHydrated,
  });

  if (userData.data)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          {/* <UtilisateursTable data={utilisateursData} /> */}
          <UtilisateursTable data={userData.data.data} />
        </div>
      </div>
    );
};

export default UtilisateursPage;
