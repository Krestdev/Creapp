"use client";
import { userQ } from "@/queries/baseModule";
import { UtilisateursTable } from "./utilisateurs-table";
import { useFetchQuery } from "@/hooks/useData";
import LoadingPage from "../loading-page";
import ErrorPage from "../error-page";

const UserListPage = () => {
  const userData = useFetchQuery(["usersList"], userQ.getAll, 30000);

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
