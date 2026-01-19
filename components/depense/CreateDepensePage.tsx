"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { Label } from "../ui/label";
import { CarburentForm } from "./carburent";
import { TransportForm } from "./transportForm";

const CreateDepensePage = () => {
  const [typeDepense, setTypeDepense] = React.useState<string>("");

  // const userRoles = user?.role?.flatMap((x) => x.label) || [];

  const renderForm = () => {
    switch (typeDepense) {
      case "Transport":
        return <TransportForm />;
      case "Carburant":
        return <CarburentForm />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 gap-4 max-w-3xl px-2 sm:px-5 md:px-8 w-full ">
        <div className="flex flex-col gap-2">
          <Label>{"Type de dépense"}</Label>
          <Select onValueChange={setTypeDepense}>
            <SelectTrigger className="w-full rounded-[4px]">
              <SelectValue placeholder="Type de dépense" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectItem value="Transport">{"Transport"}</SelectItem>
                <SelectItem value="Carburant">{"Carburant"}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {renderForm()}
    </div>
  );
};

export default CreateDepensePage;
