"use client";
import { useStore } from "@/providers/datastore";
import { ProjectCreateForm } from "./create-project";
import { useQuery } from "@tanstack/react-query";
import { userQ } from "@/queries/baseModule";
import LoadingPage from "../loading-page";
import ErrorPage from "../error-page";

const CreateProject = () => {
  const { user } = useStore();
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
  if (isSuccess && !!user) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <h2>Créer un utilisateur</h2>
          </div>
          <ProjectCreateForm users={users.data} userId={user.id} />
        </div>
      </div>
    );
  }
};

export default CreateProject;
