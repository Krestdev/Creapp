"use client";
import { useStore } from "@/providers/datastore";
import { signatairQ } from "@/queries/signatair";
import { useQuery } from "@tanstack/react-query";
import { SignatairTable } from "./signatair-table";

const SignatairPage = () => {
  const { isHydrated } = useStore();
  const userData = useQuery({
    queryKey: ["signatairs"],
    queryFn: () => signatairQ.getAll(),
    enabled: isHydrated,
  });

  if (userData.data)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <SignatairTable data={userData.data.data} />
        </div>
      </div>
    );
};

export default SignatairPage;
