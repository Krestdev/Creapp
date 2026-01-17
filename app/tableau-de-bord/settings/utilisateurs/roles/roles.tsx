"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShowRole } from "@/components/utilisateurs/show-role";
import { cn, TranslateRole } from "@/lib/utils";
import { Role } from "@/types/types";
import { ArrowRight } from "lucide-react";
import React from "react";

interface Props {
  data: Array<Role>;
}

function Roles({ data }: Props) {
  const [searchFilter, setSearchFilter] = React.useState<string>("");
  const [open, setOpen] = React.useState<boolean>(false);
  const [selected, setSelected] = React.useState<Role>();
  const filteredRoles: Array<Role> = React.useMemo(() => {
    return data.filter((r) => {
      const search = searchFilter.toLocaleLowerCase();
      //matchSearch
      const matchSearch =
        searchFilter.trim() === ""
          ? true
          : TranslateRole(r.label).toLocaleLowerCase().includes(search) ||
            r.users?.some(
              (u) =>
                u.firstName.trim().toLocaleLowerCase().includes(search) ||
                u.lastName.trim().toLocaleLowerCase().includes(search)
            );
      return matchSearch;
    });
  }, [data, searchFilter]);

  const roleDescription = (
    role: string
  ): { description: string; className?: HTMLDivElement["className"] } => {
    switch (role) {
      case "USER":
        return {
          description:
            "Accès au tableau de bord, l'emission de besoin et projets.",
        };
      case "SALES":
        return {
          description:
            "Il a accès aux commandes, c'est-à-dire : demandes de cotation, devis, bon de commande, réceptions.",
          className: "border-sky-200 bg-sky-50 text-sky-600",
        };
      case "SALES_MANAGER":
        return {
          description:
            "Accès aux commandes et aux pages d'approbation liées (Devis, Bon de commande).",
          className: "border-teal-200 bg-teal-50 text-teal-600",
        };
      case "ADMIN":
        return {
          description:
            "Vous êtes Tout-puissant. Accès complèt à toutes les pages et fonctionnalités de l'application.",
          className: "border-purple-200 bg-purple-50 text-purple-600",
        };
      case "VOLT":
        return {
          description:
            "Accès complèt aux banques(transactions, transferts, comptes) et aux dépenses.",
          className: "border-lime-200 bg-lime-50 text-lime-600",
        };
      case "VOLT_MANAGER":
        return {
          description: "Approbation des paiements via les Tickets.",
          className: "border-red-200 bg-red-50 text-red-600",
        };
      case "RH":
        return {
          description: "Ils peuvent soumettre des besoins RH",
          className: "border-orange-200 bg-orange-50",
        };
      case "ACCOUNTANT":
        return {
          description: "Accès aux banques(Transactions, comptes).",
          className: "border-blue-200 bg-blue-50 text-blue-600",
        };
      default:
        return { description: "" };
    }
  };
  return (
    <div className="content">
      <Input
        type="search"
        value={searchFilter}
        onChange={(v) => setSearchFilter(v.target.value)}
        placeholder="Rechercher"
        className="max-w-sm"
      />
      <div className="grid-stats-4">
        {filteredRoles.map((role) => {
          const { description, className } = roleDescription(role.label);
          const label = TranslateRole(role.label);
          return (
            <div
              key={role.id}
              className={cn(
                "p-5 w-full h-full rounded-md border border-gray-100 flex flex-col gap-3",
                className
              )}
            >
              <h3>{label}</h3>
              {description && (
                <p className="text-sm font-light text-gray-600">
                  {description}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-gray-900">
                  {"Utilisateurs"}
                </span>
                <p className="text-sm text-gray-800">
                  {!!role.users && role.users.length > 0 ? (
                    role.users
                      .map((user) => user.firstName.concat(" ", user.lastName))
                      .join(", ")
                  ) : (
                    <span className="text-gray-600">{"Aucun"}</span>
                  )}
                </p>
              </div>
              <Button className="w-fit mt-auto ml-auto" onClick={()=>{setSelected(role); setOpen(true)}}>
                {"Voir plus"}
                <ArrowRight />
              </Button>
            </div>
          );
        })}
      </div>
      {selected && (
        <ShowRole
          open={open}
          onOpenChange={setOpen}
          role={selected}
          usersCount={selected.users?.length}
        />
      )}
    </div>
  );
}

export default Roles;
