"use client";

import React from "react";
import CreateRequest from "./CreateForm";
import SpecialRequestForm from "./SpecialRequestForm";
import FacilitationRequestForm from "./FacilitationRequestForm";
import RHRequestForm from "./RHRequestForm";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "../ui/label";
import { useStore } from "@/providers/datastore";
import { requestTypeQ } from "@/queries/requestType";
import { useFetchQuery } from "@/hooks/useData";
import LoadingPage from "../loading-page";
import ErrorPage from "../error-page";

const CreateResquestPage = () => {
  const { user } = useStore();
  const [typeBesoin, setTypeBesoin] = React.useState<string>("");
  const userRoles = user?.role?.flatMap((x) => x.label) || [];
  const hasRole = (role: string) => userRoles.includes(role);

  const getRequestType = useFetchQuery(["requestType"], requestTypeQ.getAll);

  if (getRequestType.isLoading || getRequestType.data?.data.length === 0) {
    return <LoadingPage />;
  }

  if (getRequestType.isError) {
    return <ErrorPage />;
  }

  if (getRequestType.isSuccess && getRequestType.data?.data.length > 0) {
    const renderForm = () => {
      switch (typeBesoin) {
        case getRequestType.data?.data.find((x) => x.type === "achat")?.type:
          return <CreateRequest />;
        case getRequestType.data?.data.find((x) => x.type === "speciaux")?.type:
          return <SpecialRequestForm />;
        case getRequestType.data?.data.find((x) => x.type === "facilitation")
          ?.type:
          return <FacilitationRequestForm />;
        case getRequestType.data?.data.find(
          (x) => x.type === "ressource_humaine"
        )?.type:
          return <RHRequestForm />;
        default:
          return null;
      }
    };

    return (
      <div className="space-y-6">
        <div className="grid gap-2 mx-12">
          <Label>{"Type de besoin"}</Label>
          <Select onValueChange={setTypeBesoin}>
            <SelectTrigger className="w-full md:w-[376px] rounded-[4px]">
              <SelectValue placeholder="Sélectionner le type de besoin" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                {/* Visible par tous */}
                <SelectItem
                  value={
                    getRequestType.data?.data.find((x) => x.type === "achat")
                      ?.type!
                  }
                >
                  {
                    getRequestType.data?.data.find((x) => x.type === "achat")
                      ?.label
                  }
                </SelectItem>

                {/* Visible par tous (modifiable si besoin) */}
                <SelectItem
                  value={
                    getRequestType.data?.data.find(
                      (x) => x.type === "facilitation"
                    )?.type!
                  }
                >
                  {
                    getRequestType.data?.data.find(
                      (x) => x.type === "facilitation"
                    )?.label
                  }
                </SelectItem>

                {/* RH uniquement */}
                {hasRole("RH") && (
                  <SelectItem
                    value={
                      getRequestType.data?.data.find(
                        (x) => x.type === "ressource_humaine"
                      )?.type!
                    }
                  >
                    {
                      getRequestType.data?.data.find(
                        (x) => x.type === "ressource_humaine"
                      )?.label
                    }
                  </SelectItem>
                )}

                {/* VOLT-MANAGER uniquement */}
                {hasRole("VOLT_MANAGER") && (
                  <SelectItem
                    value={
                      getRequestType.data?.data.find(
                        (x) => x.type === "speciaux"
                      )?.type!
                    }
                  >
                    {
                      getRequestType.data?.data.find(
                        (x) => x.type === "speciaux"
                      )?.label
                    }
                  </SelectItem>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {renderForm()}
      </div>
    );
  }
};
export default CreateResquestPage;
