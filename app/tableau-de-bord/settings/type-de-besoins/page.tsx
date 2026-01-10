"use client"

import PageTitle from "@/components/pageTitle";
import { TypeTable } from "./TypeTable";
import { RequestTypeQueries } from "@/queries/requestType";
import { useFetchQuery } from "@/hooks/useData";
import LoadingPage from "@/components/loading-page";
import ErrorPage from "@/components/error-page";
import Empty from "@/components/base/empty";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucidePen } from "lucide-react";
import { UpdateRequestType } from "./UpdateRequestType";
import { useState } from "react";
import { RequestType } from "@/types/types";

const Page = () => {


    const [isOpenModalEdit, setIsModalOpenEdit] = useState(false);
    const [select, setSelect] = useState<RequestType>();
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
                <div className="grid-stats-4">
                    {getRequestType.data?.data.map((item) => (
                        <Card className="h-full justify-between">
                            <div>
                                <CardHeader className="flex justify-between">
                                    <CardTitle className="text-lg">{item.label}</CardTitle>
                                </CardHeader>
                                <div className="px-6">
                                    <p className="text-gray-400">{item.description}</p>
                                </div>
                            </div>
                            <CardFooter>
                                <Button
                                    onClick={() => { setSelect(item); setIsModalOpenEdit(true); }}
                                    variant={"primary"} className="rounded-[4px] ml-auto">
                                    <LucidePen />
                                    {"Modifier"}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <UpdateRequestType
                    open={isOpenModalEdit}
                    onOpenChange={setIsModalOpenEdit}
                    data={select}
                />
            </div>
        );
    }
};

export default Page;