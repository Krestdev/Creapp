import { DataValidation } from "@/components/base/dataValidation";
import { useStore } from "@/providers/datastore";
import { DepartmentQueries } from "@/queries/departmentModule";
import { RequestQueries } from "@/queries/requestModule";
import { RequestModelT } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const Approbation = () => {
  const { isHydrated, user } = useStore();
  const request = new RequestQueries();
  const [data, setData] = React.useState<RequestModelT[]>([]);
  const [proceedData, setProceedData] = React.useState<RequestModelT[]>([]);

  const department = new DepartmentQueries();
  const departmentData = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      return department.getAll();
    },
  });
  // Récupérer tous les besoins en attente de validation (pour les validateurs)
  const requestData = useQuery({
    queryKey: ["requests-validation"],
    queryFn: () => {
      return request.getAll();
    },
    enabled: isHydrated,
  });

  const isLastValidator =
    departmentData.data?.data
      .flatMap((mem) => mem.members)
      .find((mem) => mem.userId === user?.id)?.finalValidator === true;

  // afficher les element a valider en fonction du validateur
  React.useEffect(() => {
    if (requestData.data?.data && user) {
      const show = requestData.data?.data
        .filter((x) => x.state === "pending")
        .filter((item) => {
          // Récupérer la liste des IDs des validateurs pour ce departement
          const validatorIds = departmentData.data?.data
            .flatMap((x) => x.members)
            .filter((x) => x.validator === true)
            .map((x) => x.userId);

          if (isLastValidator) {
            return validatorIds?.every((id) =>
              item.revieweeList?.flatMap((x) => x.validatorId).includes(id)
            );
          } else {
            return (
              !item.revieweeList
                ?.flatMap((x) => x.validatorId)
                .includes(user?.id!) && item.state === "pending"
            );
          }
        });
      setData(show);
    }
  }, [
    requestData.data?.data,
    user,
    isLastValidator,
    departmentData.data?.data,
  ]);

  // Liste des besoins déja traités en fonction du validateur si c'est un simple validateur on vérifie que son id est dans la liste des reviewee sinon on affiche tout les besoins traités
  React.useEffect(() => {
    if (requestData.data?.data && user) {
      const show = requestData.data?.data.filter((item) => {
        if (isLastValidator) {
          return item.state !== "pending";
        } else {
          return item.revieweeList?.flatMap((x) => x.validatorId).includes(user.id!);
        }
      });
      setProceedData(show);
    }
  }, [requestData.data?.data, user, isLastValidator]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h2>Liste des besoins à soumettre</h2>
        <DataValidation data={data} isLastValidator={isLastValidator} empty={"Aucun besoin en attente de validation"} />
      </div>
      <div className="flex flex-col">
        <h2>Liste des besoins traités</h2>
        <DataValidation data={proceedData} isLastValidator={isLastValidator} empty={"Aucun besoin traité"} type="proceed" />
      </div>
    </div>
  );
};

export default Approbation;
