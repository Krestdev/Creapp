"use client"

import PageTitle from "@/components/pageTitle";
import { TypeTable } from "./TypeTable";
import { RequestTypeQueries } from "@/queries/requestType";
import { useFetchQuery } from "@/hooks/useData";
import LoadingPage from "@/components/loading-page";
import ErrorPage from "@/components/error-page";
import Empty from "@/components/base/empty";

const Page = () => {

    const requestTypeQueries = new RequestTypeQueries();
    const getRequestType = useFetchQuery(["requestType"], requestTypeQueries.getAll);

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