"use client";
import { ActionDialog } from "@/components/ds/action-dialog";
import { Button } from "@/components/ui/button";
import { requestQ } from "@/queries/requestModule";
import { RequestModelT } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TriangleAlert } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  data: RequestModelT;
}

function TerminateRequest({ open, onOpenChange, data }: Props) {
  const queryClient = useQueryClient();
  const process = useMutation({
    mutationFn: (decision: "APPROVED" | "REJECTED") =>
      requestQ.validateServiceRequests(data.id, decision),
    onSuccess: () => {
      queryClient.invalidateQueries();
      onOpenChange(false);
      toast.success("Besoin traité avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      tone="warning"
      icon={TriangleAlert}
      title={`Traiter le besoin « ${data.label} » ?`}
      description="Cette action est irréversible. Veuillez vous assurer d'avoir pris la décision correcte et que les informations à traiter sont exactes."
      isPending={process.isPending}
      footer={
        <>
          <Button
            variant="destructive"
            onClick={() => process.mutate("REJECTED")}
            disabled={process.isPending}
          >
            {"Rejeter le besoin"}
          </Button>
          <Button
            onClick={() => process.mutate("APPROVED")}
            disabled={process.isPending}
            isLoading={process.isPending}
          >
            {"Approuver le besoin"}
          </Button>
        </>
      }
    />
  );
}

export default TerminateRequest;
