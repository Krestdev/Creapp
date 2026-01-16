"use client";

import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { requestTypeQ } from "@/queries/requestType";
import { RequestType } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { LucidePen } from "lucide-react";
import { useState } from "react";
import { UpdateRequestType } from "./UpdateRequestType";

const Page = () => {
  const [isOpenModalEdit, setIsModalOpenEdit] = useState(false);
  const [select, setSelect] = useState<RequestType>();
  const getRequestType = useQuery({
    queryKey: ["requestType"],
    queryFn: requestTypeQ.getAll,
  });

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
                  onClick={() => {
                    setSelect(item);
                    setIsModalOpenEdit(true);
                  }}
                  variant={"primary"}
                  className="rounded-[4px] ml-auto"
                >
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
