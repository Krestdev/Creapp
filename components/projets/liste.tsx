"use client";
import { ProjectTable } from "@/components/projets/project-table";
import { useFetchQuery } from "@/hooks/useData";
import { useStore } from "@/providers/datastore";
import { UserQueries } from "@/queries/baseModule";
import { ProjectQueries } from "@/queries/projectModule";
import { useQuery } from "@tanstack/react-query";
import LoadingPage from "../loading-page";
import ErrorPage from "../error-page";

const ProjectListPage = () => {
  const { isHydrated } = useStore();
  const project = new ProjectQueries();

  const projectData = useFetchQuery(["projectsList"], project.getAll, 30000);
  const users = new UserQueries();
  const usersData = useFetchQuery(["usersList"], users.getAll, 30000);

  if (projectData.isLoading || usersData.isLoading)
    return <LoadingPage />;
  if (projectData.isError || usersData.isError)
    return <ErrorPage />;

  if (projectData.data && usersData.data)
    return (
      <div className="content">
        <ProjectTable data={projectData.data?.data.filter((x) => x.status !== "cancelled")} usersData={usersData.data?.data} />
      </div>
    );
};

export default ProjectListPage;
