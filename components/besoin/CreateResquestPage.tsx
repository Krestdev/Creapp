"use client";

import CreateTypeGas from "@/app/tableau-de-bord/besoins/creer/create-type-gas";
import CreateTypeOthers from "@/app/tableau-de-bord/besoins/creer/create-type-others";
import CreateTypeTransport from "@/app/tableau-de-bord/besoins/creer/create-type-transport";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useStore } from "@/providers/datastore";
import { Category, ProjectT, RequestModelT, RequestType, Role, User, Vehicle } from "@/types/types";
import React from "react";
import { Label } from "../ui/label";
import CreateRequest from "./CreateForm";
import FacilitationRequestForm from "./FacilitationRequestForm";
import RHRequestForm from "./RHRequestForm";
import SpecialRequestForm from "./SpecialRequestForm";

interface Props {
  types: Array<RequestType>;
  users: Array<User>;
  projects: Array<ProjectT>;
  categories: Array<Category>;
  vehicles: Array<Vehicle>;
}

const CreateResquestPage = ({types, users, projects, categories, vehicles}:Props) => {
  const { user } = useStore();
  const [requestType, setRequestType] = React.useState<RequestModelT["type"]>();

    const renderForm = () => {
      switch (requestType) {
        case "achat":
          return <CreateRequest categories={categories} projects={projects} users={users} />;
        case "speciaux":
          return <SpecialRequestForm categories={categories} />;
        case"facilitation":
          return <FacilitationRequestForm users={users} projects={projects} categories={categories} />;
        case "ressource_humaine":
          return <RHRequestForm categories={categories} users={users} projects={projects} />;
        case "others":
          return <CreateTypeOthers users={users} categories={categories}/>;
        case "gas":
          return <CreateTypeGas users={users} categories={categories} vehicles={vehicles} />;
        case "transport":
          return <CreateTypeTransport users={users} categories={categories} projects={projects} />
        default:
          return null;
      }
    };

    const typesList = (roles: Array<Role>): Array<RequestType> => {
      if(roles.some(r => r.label === "ADMIN")) return types;
      if(roles.some(r => r.label === "RH") && roles.some(r => r.label === "VOLT_MANAGER")) return types;
      if(roles.some(r => r.label === "RH")) return types.filter(t=> t.type !== "speciaux");
      if(roles.some(r => r.label === "VOLT_MANAGER")) return types.filter(t=> t.type !== "ressource_humaine");
      return types.filter(t=> t.type !== "ressource_humaine" && t.type !== "speciaux");
    }  

    return (
      <div className="space-y-6">
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

        {renderForm()}
      </div>
    );
};
export default CreateResquestPage;
