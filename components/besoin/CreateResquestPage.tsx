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

const CreateResquestPage = () => {
  const [typeBesoin, setTypeBesoin] = React.useState<string>("");

  const renderForm = () => {
    switch (typeBesoin) {
      case "ordinaire":
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
        <Label>Type de besoin</Label>
        <Select onValueChange={(value) => setTypeBesoin(value)}>
          <SelectTrigger className="w-full md:w-[376px] rounded-[4px]">
            <SelectValue placeholder="Sélectionner le type de besoin" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="ordinaire">{"Besoin ordinaire"}</SelectItem>
              <SelectItem value="facilitation">
                {"Besoin de facilitation"}
              </SelectItem>
              <SelectItem value="ressource_humaine">
                {"Besoin Ressource humaine"}
              </SelectItem>
              <SelectItem value="speciaux">{"Besoin spéciaux"}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {renderForm()}
    </div>
  );
};

export default CreateResquestPage;
