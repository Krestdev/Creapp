"use client";

import React from "react";
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
import { TransportForm } from "./transportForm";
import { CarburentForm } from "./carburent";

const CreateDepensePage = () => {
  const { user } = useStore();
  const [typeDepense, setTypeDepense] = React.useState<string>("");

  const userRoles = user?.role?.flatMap((x) => x.label) || [];

  const hasRole = (role: string) => userRoles.includes(role);

  const renderForm = () => {
    switch (typeDepense) {
      case "Transport":
        return <TransportForm />;
      case "Carburent":
        return <CarburentForm />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-2 mx-12">
        <Label>{"Type de depense"}</Label>

        <Select onValueChange={setTypeDepense}>
          <SelectTrigger className="w-full md:w-[376px] rounded-[4px]">
            <SelectValue placeholder="Sélectionner le type de depense" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              {/* Visible par tous */}
              <SelectItem value="Transport">{"Depense Transport"}</SelectItem>

              {/* Visible par tous (modifiable si depense) */}
              <SelectItem value="Carburent">
                {"Depense de Carburent"}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {renderForm()}
    </div>
  );
};

export default CreateDepensePage;
