"use client";
import ErrorDialog from "@/components/error-dialog";
import LoadingDialog from "@/components/loading-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { queryKeys } from "@/lib/query-keys";
import { requestQ } from "@/queries/requestModule";
import { RequestType, User } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { InfoIcon } from "lucide-react";
import React from "react";

interface EditProps {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  reqId: number;
  users: Array<User>;
  requestTypes: RequestType[];
}

function EditRequestAdmin({
  open,
  openChange,
  reqId,
  // users,
  // requestTypes,
}: EditProps) {
  const request = useQuery({
    queryKey: queryKeys.request(reqId),
    queryFn: () => requestQ.getOne(reqId),
  });

  if (request.isLoading) {
    return (
      <LoadingDialog
        open={open}
        openChange={openChange}
        title={"Chargement..."}
        description={"Veuillez patienter pendant le chargement de la demande"}
        className="sm:max-w-3xl"
      />
    );
  }
  if (request.isError) {
    return (
      <ErrorDialog
        open={open}
        openChange={openChange}
        title={"Erreur"}
        description={"Une erreur est survenue lors du chargement de la demande"}
        className="sm:max-w-3xl"
        refetch={() => request.refetch()}
        errorMessage={request.error.message}
      />
    );
  }

  if (request.isSuccess)
    return (
      <Dialog open={open} onOpenChange={openChange}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader variant={"secondary"}>
            <DialogTitle>{request.data.data.label}</DialogTitle>
            <DialogDescription>{"Modification du besoin"}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5 p-3 rounded bg-blue-100">
            <InfoIcon size={20} className="text-blue-600" />
            <p className="text-sm">
              {
                "Notez que ces modifications seront prises en compte uniquement après validation par un administrateur"
              }
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
}

export default EditRequestAdmin;
