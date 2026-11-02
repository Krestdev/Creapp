"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { ProjectCreateForm } from "@/components/projets/create-project";
import { userQ } from "@/queries/baseModule";
import { useQuery } from "@tanstack/react-query";

const Page = () => {
  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: () => userQ.getAll(),
  });

  if (getUsers.isLoading) return <LoadingPage />;
  if (getUsers.isError) return <ErrorPage error={getUsers.error} />;
  if (getUsers.isSuccess) {
    return (
      <div className="content">
        <PageTitle
          title="Créer un Projet"
          subtitle="Formulaire de création d'un projet"
          color="cyberpunk"
        />
        <ProjectCreateForm users={getUsers.data.data} />
      </div>
    );
  }
};

export default Page;
