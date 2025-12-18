"use client";
import { ProjectTable } from "@/components/projets/project-table";
import { useStore } from "@/providers/datastore";
import { ProjectQueries } from "@/queries/projectModule";
import { useQuery } from "@tanstack/react-query";

const ProjectsPage = () => {
  const { isHydrated } = useStore();
  const project = new ProjectQueries();
  const projectData = useQuery({
    queryKey: ["projectsList"],
    queryFn: () => project.getAll(),
    enabled: isHydrated,
  });
  if (projectData.data)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <ProjectTable data={projectData.data?.data} />
        </div>
      </div>
    );
};

export default ProjectsPage;
