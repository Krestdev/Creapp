"use client";
import { useStore } from "@/providers/datastore";
import { signatairQ } from "@/queries/signatair";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SignatairTable } from "./signatair-table";
import { Card, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { LucidePen } from "lucide-react";
import { useState } from "react";
import { Signatair } from "@/types/types";
import EditSignatairForm from "./updateSignatair";
import { Badge } from "../ui/badge";

const SignatairPage = () => {
  const { isHydrated } = useStore();
  const userData = useQuery({
    queryKey: ["signatairs"],
    queryFn: () => signatairQ.getAll(),
    enabled: isHydrated,
  });

  const queryClient = useQueryClient();
  const [isOpenModalEdit, setIsModalOpenEdit] = useState(false);
  const [select, setSelect] = useState<Signatair>();

  const formatFullName = (lastName: string, firstName: string) =>
    `${lastName.toLocaleUpperCase("fr-FR")} ${capitalizeFirstName(firstName)}`;

  const capitalizeFirstName = (value: string) =>
    value
      .toLocaleLowerCase("fr-FR")
      .replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase("fr-FR"));

  const handleUpdateSuccess = () => {
    setIsModalOpenEdit(false);
    setSelect(undefined);
    queryClient.invalidateQueries({
      queryKey: ["SignatairList"],
      refetchType: "active",
    });
  };

  const mode = (mode: string) => {
    if (mode == "ONE") {
      return "Un Signataire";
    } else {
      return "Plusieurs Signataires";
    }
  };

  if (userData.data)
    return (
      <div className="grid-stats-4">
        {userData.data?.data.map((item, id) => (
          <Card key={id} className="h-full justify-between">
            <div className="flex flex-col gap-2">
              <CardHeader className="flex justify-between">
                <CardTitle className="text-lg">{"Banque : " + item.Bank?.label}</CardTitle>
              </CardHeader>
              <div className="px-6">
                <p className="text-gray-400">{"Type : " + item.payTypes?.label}</p>
              </div>
              {/* <div className="px-6">
                <p className="text-gray-400">{"Mode : " + mode(item.mode)}</p>
              </div> */}

              <div className="flex flex-col px-6">
                <p className="text-gray-400">{"Signataire"}</p>
                <div className="flex flex-col gap-2 px-3">
                  {item.user?.map((user, i) => (
                    <Badge key={i} className={`flex items-center gap-1 w-fit`}>
                      {formatFullName(user.lastName, user.firstName) ?? "Non Defini"}
                    </Badge>
                  ))}
                </div>
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
        {select && (
          <EditSignatairForm
            open={isOpenModalEdit}
            setOpen={setIsModalOpenEdit}
            signatair={select}
            onSuccess={handleUpdateSuccess}
          />
        )}
      </div>
    );
};

export default SignatairPage;
