"use client";
import { useStore } from "@/providers/datastore";
import { signatairQ } from "@/queries/signatair";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { LucidePen, Receipt, FileCheck } from "lucide-react";
import { useState } from "react";
import { PayType, Signatair } from "@/types/types";
import EditSignatairForm from "./updateSignatair";
import { Badge } from "../ui/badge";
import LoadingPage from "../loading-page";
import ErrorPage from "../error-page";

const SignatairPage = () => {
  const { isHydrated } = useStore();
  const userData = useQuery({
    queryKey: ["signatairs"],
    queryFn: () => signatairQ.getAll(),
    enabled: isHydrated,
  });

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
  };

  // Regrouper les données par banque
  const groupedData = userData.data?.data.reduce(
    (acc, item) => {
      const bankId = item.Bank?.id || item.bankId || "unknown";

      if (!acc[bankId]) {
        acc[bankId] = {
          bank: item.Bank,
          cheque: null,
          virement: null,
        };
      }

      // Déterminer si c'est un chèque ou un virement basé sur le payType
      const payType = item.payTypes;
      if (payType) {
        if (
          payType.type === "chq" ||
          payType.label?.toLowerCase().includes("chèque")
        ) {
          acc[bankId].cheque = item;
        } else if (
          payType.type === "ov" ||
          payType.label?.toLowerCase().includes("virement")
        ) {
          acc[bankId].virement = item;
        }
      }

      return acc;
    },
    {} as Record<
      string,
      {
        bank: any;
        cheque: Signatair | null;
        virement: Signatair | null;
      }
    >,
  );

  if (userData.isLoading) return <LoadingPage />;
  if (userData.error) return <ErrorPage />;

  if (!userData.data) return null;

  if (userData.isSuccess) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(groupedData || {}).map(
          ([bankId, { bank, cheque, virement }]) => (
            <Card key={bankId} className="h-full flex flex-col py-2">
              {/* En-tête avec le nom de la banque */}
              <CardContent className="p-0">
                <CardHeader className="gradient-to-r from-blue-50 to-white">
                  <CardTitle className="text-xl font-semibold text-center text-gray-800 uppercase">
                    {bank?.label || "Banque inconnue"}
                  </CardTitle>
                </CardHeader>

                {/* Contenu principal avec deux colonnes */}
                <div className="flex-1 p-4">
                  <div className="grid grid-cols-2 gap-6 h-full">
                    {/* Colonne Chèque */}
                    <div className="flex flex-col bg-white shadow-sm rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Receipt className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-[14px]">
                            {cheque?.payTypes?.label || "Chèque"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Type de paiement
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">{`Signataire${cheque?.user && cheque?.user?.length > 1 ? "s" : ""}`}</h4>
                          {cheque?.user && cheque.user.length > 0 ? (
                            <div className="space-y-2">
                              {cheque.user.map((user, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2 p-2 bg-blue-50 rounded"
                                >
                                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                  <span className="text-sm">
                                    {formatFullName(
                                      user.lastName,
                                      user.firstName,
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                              Aucun signataire défini
                            </p>
                          )}
                        </div>
                      </div>

                      {cheque && (
                        <div className="mt-6">
                          <Button
                            onClick={() => {
                              setSelect(cheque);
                              setIsModalOpenEdit(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <LucidePen className="h-3 w-3 mr-2" />
                            Modifier
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Colonne Virement */}
                    <div className="flex flex-col bg-white shadow-sm rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FileCheck className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-[14px]">
                            {virement?.payTypes?.label || "Ordre de Virement"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Type de paiement
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">
                            Signataire
                            {virement?.user && virement.user.length > 1
                              ? "s"
                              : ""}
                          </h4>
                          {virement?.user && virement.user.length > 0 ? (
                            <div className="space-y-2">
                              {virement.user.map((user, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2 p-2 bg-green-50 rounded"
                                >
                                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                  <span className="text-sm">
                                    {formatFullName(
                                      user.lastName,
                                      user.firstName,
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                              Aucun signataire défini
                            </p>
                          )}
                        </div>
                      </div>

                      {virement && (
                        <div className="mt-6">
                          <Button
                            onClick={() => {
                              setSelect(virement);
                              setIsModalOpenEdit(true);
                            }}
                            variant="primary"
                            size="sm"
                            className="w-full"
                          >
                            <LucidePen className="h-3 w-3 mr-2" />
                            Modifier
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ),
        )}

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
  }
};

export default SignatairPage;
