"use client";
import { userQ } from "@/queries/baseModule";
import { useQuery } from "@tanstack/react-query";
import ErrorPage from "../error-page";
import LoadingPage from "../loading-page";
import { ProjectCreateForm } from "./create-project";

const CreateProject = () => {
  const {
    data: users,
    isSuccess,
    isError,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => userQ.getAll(),
  });

  if (isLoading) return <LoadingPage />;
  if (isError) return <ErrorPage error={error} />;
  if (isSuccess) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <h2>Créer un utilisateur</h2>
          </div>
          <ProjectCreateForm users={users.data} />
        </div>
      </div>
    );
  }
};

export default CreateProject;
