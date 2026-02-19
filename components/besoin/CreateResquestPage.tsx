"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { isRole } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { ProjectT, RequestType, Role, User } from "@/types/types";
import React from "react";
import { Label } from "../ui/label";
import CreateRequest from "./CreateForm";
import FacilitationRequestForm from "./FacilitationRequestForm";
import RHRequestForm from "./RHRequestForm";
import SpecialRequestForm from "./SpecialRequestForm";
import CreateTypeOthers from "@/app/tableau-de-bord/besoins/creer/create-type-others";

interface Props {
  types: Array<RequestType>;
  users: Array<User>;
  projects: Array<ProjectT>;
}

const CreateResquestPage = ({types, users, projects}:Props) => {
  const { user } = useStore();
  const [requestType, setRequestType] = React.useState<string>("");

    const renderForm = () => {
      switch (requestType) {
        case "achat":
          return <CreateRequest />;
        case "speciaux":
          return <SpecialRequestForm />;
        case"facilitation":
          return <FacilitationRequestForm users={users} projects={projects} />;
        case "ressource_humaine":
          return <RHRequestForm />;
        case "others":
          return <CreateTypeOthers users={users}/>;
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
          <Select onValueChange={setRequestType}>
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
