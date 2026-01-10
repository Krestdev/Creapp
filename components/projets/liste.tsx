"use client";
import { ProjectTable } from "@/components/projets/project-table";
import { useFetchQuery } from "@/hooks/useData";
import { useStore } from "@/providers/datastore";
import { userQ } from "@/queries/baseModule";
import { projectQ } from "@/queries/projectModule";
import ErrorPage from "../error-page";
import LoadingPage from "../loading-page";

const ProjectListPage = () => {
  const { isHydrated } = useStore();

  const projectData = useFetchQuery(["projectsList"], projectQ.getAll, 30000);

  const usersData = useFetchQuery(["usersList"], userQ.getAll, 30000);

  if (projectData.isLoading || usersData.isLoading) return <LoadingPage />;
  if (projectData.isError || usersData.isError) return <ErrorPage />;

  if (projectData.data && usersData.data)
    return (
      <div className="content">
        <ProjectTable
          data={projectData.data?.data.filter((x) => x.status !== "cancelled")}
          usersData={usersData.data?.data}
        />
      </div>
    );
};

export default ProjectListPage;
