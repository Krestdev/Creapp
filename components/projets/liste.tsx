"use client";
import { ProjectTable } from "@/components/projets/project-table";
import { userQ } from "@/queries/baseModule";
import { projectQ } from "@/queries/projectModule";
import { useQuery } from "@tanstack/react-query";
import ErrorPage from "../error-page";
import LoadingPage from "../loading-page";
import { queryKeys } from "@/lib/query-keys";

const ProjectListPage = () => {
  const projectData = useQuery({
    queryKey: queryKeys.projects,
    queryFn: projectQ.getAll,
  });

  const usersData = useQuery({
    queryKey: queryKeys.users,
    queryFn: userQ.getAll,
  });

  if (projectData.isLoading || usersData.isLoading) return <LoadingPage />;
  if (projectData.isError || usersData.isError) return <ErrorPage />;

  if (projectData.isSuccess && usersData.isSuccess)
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
