"use client";
import CreateRequest from "@/components/besoin/CreateForm";
import FacilitationRequestForm from "@/components/besoin/FacilitationRequestForm";
import RHRequestForm from "@/components/besoin/RHRequestForm";
import SpecialRequestForm from "@/components/besoin/SpecialRequestForm";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { userQ } from "@/queries/baseModule";
import { categoryQ } from "@/queries/categoryModule";
import { projectQ } from "@/queries/projectModule";
import { requestTypeQ } from "@/queries/requestType";
import { vehicleQ } from "@/queries/vehicule";
import { RequestModelT, RequestType, Role } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import CreateTypeGas from "./create-type-gas";
import CreateTypeOthers from "./create-type-others";
import CreateTypeTransport from "./create-type-transport";
import { ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const Page = () => {
  const { user } = useStore();
  const [requestType, setRequestType] = React.useState<RequestModelT["type"]>();
  const getRequestType = useQuery({
    queryKey: ["requestType"],
    queryFn: requestTypeQ.getAll,
  });

  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: async () => userQ.getAll(),
  });

  const getProjects = useQuery({
    queryKey: ["projects"],
    queryFn: async () => projectQ.getAll(),
  });

  const getCategories = useQuery({
    queryKey: ["categoryList"],
    queryFn: async () => categoryQ.getCategories(),
  });

  const getVehicles = useQuery({
      queryKey: ["vehicles"],
      queryFn: async()=> vehicleQ.getAll(),
    });

  if (getRequestType.isLoading || getUsers.isLoading || getProjects.isLoading || getCategories.isLoading || getVehicles.isLoading) return <LoadingPage />;
  if (getRequestType.isError || getUsers.isError || getProjects.isError || getCategories.isError || getVehicles.isError) return <ErrorPage error={getRequestType.error || getUsers.error || getProjects.error || getCategories.error || getVehicles.error || undefined} />;
  if (getRequestType.isSuccess && getUsers.isSuccess && getProjects.isSuccess && getCategories.isSuccess && getVehicles.isSuccess) {
    

    const RenderForm = () => {
      switch (requestType) {
        case "achat":
          return <CreateRequest categories={getCategories.data.data} projects={getProjects.data.data} users={getUsers.data.data} />;
        case "speciaux":
          return <SpecialRequestForm categories={getCategories.data.data} />;
        case"facilitation":
          return <FacilitationRequestForm users={getUsers.data.data} projects={getProjects.data.data} categories={getCategories.data.data} />;
        case "ressource_humaine":
          return <RHRequestForm categories={getCategories.data.data} users={getUsers.data.data} projects={getProjects.data.data} />;
        case "others":
          return <CreateTypeOthers users={getUsers.data.data} categories={getCategories.data.data}/>;
        case "gas":
          return <CreateTypeGas users={getUsers.data.data} categories={getCategories.data.data} vehicles={getVehicles.data.data} />;
        case "transport":
          return <CreateTypeTransport users={getUsers.data.data} categories={getCategories.data.data} projects={getProjects.data.data} />
        default:
          return null;
      }
    };

    const types = getRequestType.data.data

    const typesList = (roles: Array<Role>): Array<RequestType> => {
          if(roles.some(r => r.label === "SUPERADMIN")) return types;
          if(roles.some(r => r.label === "RH") && roles.some(r => r.label === "VOLT_MANAGER")) return types;
          if(roles.some(r => r.label === "RH") && roles.some(r => r.label === "VOLT_MANAGER")) return types;
          if(roles.some(r => r.label === "RH")) return types.filter(t=> t.type !== "speciaux");
          if(roles.some(r => r.label === "VOLT_MANAGER")) return types.filter(t=> t.type !== "ressource_humaine");
          if(roles.some(r => r.label === "DRIVER")) return types.filter(t=> t.type !== "ressource_humaine" && t.type !== "speciaux");
          return types.filter(t=> t.type !== "ressource_humaine" && t.type !== "speciaux");
        }
    const getTypeClassName = (type: RequestModelT["type"]):{className: HTMLDivElement["className"]} => {
      switch (type) {
        case "achat":
          return { className: "border-sky-200 from-sky-50 to-sky-100 text-sky-500" };
        case "speciaux":
          return { className: "border-purple-200 from-purple-50 to-purple-100 text-purple-500" };
        case "facilitation":
          return { className: "border-lime-200 from-lime-50 to-lime-100 text-lime-600" };
        case "ressource_humaine":
          return { className: "border-orange-200 from-orange-50 to-orange-100 text-orange-500" };
        case "others":
          return { className: "border-gray-200 from-gray-50 to-gray-100 text-gray-800" };
        case "gas":
          return { className: "border-rose-200 from-rose-50 to-rose-100 text-rose-500" };
        case "transport":
          return { className: "border-indigo-200 from-indigo-50 to-indigo-100 text-indigo-500" };
        default:
          return { className: "border-gray-200 from-gray-50 to-gray-100 text-gray-500" };
      }
    };

    return (
      <div className="content">
        <PageTitle
          title="Créer un besoin"
          color="blue"
          subtitle="Renseignez les informations relatives à votre besoin."
        />
        {
          !requestType ?
          <div className="grid @min-[760px]:grid-cols-2 @min-[1080px]:grid-cols-3 @min-[1600px]:grid-cols-4 gap-3">
          {
            user?.role && typesList(user.role).map(({type, label, description})=>(
              <div key={type} className={cn("flex flex-col gap-2 justify-between rounded border bg-linear-to-t p-6 cursor-pointer",getTypeClassName(type).className)} onClick={()=>setRequestType(type)}>
                <div className="grid gap-1.5">
                  <h4>{label}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
                </div>
                <Button variant={"default"} className="w-fit">{"Continuer"}</Button>
              </div>
            ))
          }
        </div>
        :
        <div className="grid gap-2">
          <Label>{"Type de besoin"}</Label>
          <Select onValueChange={(v)=>setRequestType(v as RequestModelT["type"])}>
            <SelectTrigger className="w-full md:w-[376px] rounded-[4px]">
              <SelectValue placeholder="Sélectionner le type de besoin" />
            </SelectTrigger>

            <SelectContent>
              { user?.role && typesList(user.role).map(({type, label})=>(
                <SelectItem key={type} value={type}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        }

        <RenderForm/>
      </div>
    );
  }
};

export default Page;
