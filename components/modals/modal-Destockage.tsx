"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hash, Calendar, UserRound, CalendarFold } from "lucide-react";
import { RequestModelT } from "@/types/types";
import { UserQueries } from "@/queries/baseModule";
import { ProjectQueries } from "@/queries/projectModule";
import { RequestQueries } from "@/queries/requestModule";
import { useQuery } from "@tanstack/react-query";

interface DetailOrderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: RequestModelT | null;
}

export function ModalDestockage({
  open,
  onOpenChange,
  data,
}: DetailOrderProps) {
  const users = new UserQueries();
  const projects = new ProjectQueries();
  const request = new RequestQueries();

  // Récupération des données
  const usersData = useQuery({
    queryKey: ["users"],
    queryFn: async () => users.getAll(),
  });

  const projectsData = useQuery({
    queryKey: ["projects"],
    queryFn: async () => projects.getAll(),
  });

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => request.getCategories(),
  });

  const emetteur = usersData.data?.data.find(
    (u) => u.id === data?.userId
  )?.name;
  const projet = projectsData.data?.data.find(
    (p) => p.id === data?.projectId
  )?.label;

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] max-h-screen overflow-y-auto p-0 gap-0 overflow-x-hidden border-none">
        {/* Header with burgundy background */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative">
          <DialogTitle className="text-xl font-semibold text-white">
            {data.label}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">{"Déstockage du besoin"}</p>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Reference */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Hash className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                {"Référence"}
              </p>
              <Badge
                variant="secondary"
                className="bg-pink-100 text-pink-900 hover:bg-pink-100 dark:bg-pink-900 dark:text-pink-100"
              >
                {data.ref}
              </Badge>
            </div>
          </div>

          {/* Projet */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <UserRound className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{"Projet"}</p>
              <p className="text-[14px] font-semibold">{projet}</p>
            </div>
          </div>

          {/* Description */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <UserRound className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                {"Description"}
              </p>
              <p className="text-[14px] text-[#2F2F2F]">{data.description}</p>
            </div>
          </div>

          {/* Bénéficiaires */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <CalendarFold className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                {"Bénéficiaires"}
              </p>
              {data.beneficiary === "me" ? (
                <p className="font-semibold">{emetteur}</p>
              ) : (
                data.benef?.map((u, i) => {
                  return (
                    <p key={i} className="font-semibold">
                      {u}
                    </p>
                  );
                })
              )}
            </div>
          </div>

          {/* Initié par */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                {"Initié par"}
              </p>
              <p className="font-semibold">{emetteur}</p>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex w-full justify-end gap-3 p-6 pt-0">
          <Button className="bg-primary hover:bg-primary/80 text-white">
            {"Déstocker"}
          </Button>
          <Button
            variant="outline"
            className="bg-transparent"
            onClick={() => onOpenChange(false)}
          >
            {"Fermer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
