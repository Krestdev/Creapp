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

const CreateResquestPage = () => {
  const { user } = useStore();
  const [typeBesoin, setTypeBesoin] = React.useState<string>("");

  const userRoles = user?.role?.flatMap((x) => x.label) || [];

  const hasRole = (role: string) => userRoles.includes(role);

  const renderForm = () => {
    switch (typeBesoin) {
      case "achat":
        return <CreateRequest />;
      case "speciaux":
        return <SpecialRequestForm />;
      case "facilitation":
        return <FacilitationRequestForm />;
      case "ressource_humaine":
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
              <SelectItem value="achat">
                {"Besoin achat"}
              </SelectItem>

              {/* Visible par tous (modifiable si besoin) */}
              <SelectItem value="facilitation">
                {"Besoin de facilitation"}
              </SelectItem>

              {/* RH uniquement */}
              {hasRole("RH") && (
                <SelectItem value="ressource_humaine">
                  {"Besoin Ressource humaine"}
                </SelectItem>
              )}

              {/* VOLT-MANAGER uniquement */}
              {hasRole("VOLT_MANAGER") && (
                <SelectItem value="speciaux">
                  {"Besoin spéciaux"}
                </SelectItem>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {renderForm()}
    </div>
  );
};

export default CreateResquestPage;
