"use client";
import CreateCotation from "@/components/bdcommande/createCommande";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { userQ } from "@/queries/baseModule";
import { categoryQ } from "@/queries/categoryModule";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { requestQ } from "@/queries/requestModule";
import { useQuery } from "@tanstack/react-query";

const CreerPage = () => {
  const getRequests = useQuery({
    queryKey: ["requests"],
    queryFn: () => {
      return requestQ.getAll();
    },
  });

  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: () => userQ.getAll(),
  });

  const getCommandRequests = useQuery({
    queryKey: ["commands"],
    queryFn: () => commandRqstQ.getAll(),
  });

  const getCategories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => categoryQ.getCategories(),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  if (
    getRequests.isLoading ||
    getCommandRequests.isLoading ||
    getCategories.isLoading ||
    getUsers.isLoading
  )
    return <LoadingPage />;

  if (
    getRequests.isError ||
    getCommandRequests.isError ||
    getCategories.isError ||
    getUsers.isError
  )
    return (
      <ErrorPage
        error={
          getRequests.error ||
          getCommandRequests.error ||
          getCategories.error ||
          getUsers.error ||
          undefined
        }
      />
    );

  if (
    getRequests.isSuccess &&
    getCategories.isSuccess &&
    getCommandRequests.isSuccess &&
    getUsers.isSuccess
  ) {

    console.log(getUsers.data.data);
    
    return (
      <div className="flex flex-col gap-6">
        <PageTitle
          title={"Créer une Demande de cotation"}
          subtitle={
            "Complétez le formulaire pour créer une Demande de cotation"
          }
          color={"blue"}
        />
        <CreateCotation
          users={getUsers.data.data}
          requests={getRequests.data.data}
          quotationRequests={getCommandRequests.data.data}
          categories={getCategories.data.data}
        />
      </div>
    );
  }
};

export default CreerPage;
