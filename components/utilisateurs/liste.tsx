"use client";
import { userQ } from "@/queries/baseModule";
import { UtilisateursTable } from "./utilisateurs-table";
import LoadingPage from "../loading-page";
import ErrorPage from "../error-page";
import { useQuery } from "@tanstack/react-query";

const UserListPage = () => {
  const userData = useQuery({ queryKey: ["usersList"], queryFn: userQ.getAll });

  if (userData.isLoading) return <LoadingPage />;

  if (userData.isError) return <ErrorPage />;

  if (userData.isSuccess)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <UtilisateursTable data={userData.data.data} />
        </div>
      </div>
    );
};

export default UserListPage;
