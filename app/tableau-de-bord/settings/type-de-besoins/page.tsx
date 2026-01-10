"use client";

import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { useFetchQuery } from "@/hooks/useData";
import { requestTypeQ } from "@/queries/requestType";
import { TypeTable } from "./TypeTable";

const Page = () => {
  const getRequestType = useFetchQuery(["requestType"], requestTypeQ.getAll);

  if (getRequestType.isLoading) {
    return <LoadingPage />;
  }

  if (getRequestType.isError) {
    return <ErrorPage />;
  }

  if (getRequestType.isSuccess) {
    return (
      <div className="content">
        <PageTitle
          title="Types de besoins"
          subtitle="Consulter et gérez les types de besoins"
        />
        <TypeTable data={getRequestType.data?.data || []} />
      </div>
    );
  }
};

export default Page;
