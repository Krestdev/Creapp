"use client";

import StatsCard from "@/components/base/StatsCard";
import { ChartAreaInteractive } from "@/components/Charts/BarChart";
import { ChartPieLabelList } from "@/components/Charts/ChartPieLabelList";
import { useStore } from "@/providers/datastore";
import { requestQ } from "@/queries/requestModule";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Imports pour les composants UI
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  CalendarDays,
  CalendarIcon,
} from "lucide-react";
import { cn, XAF } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RequestModelT, TableFilters } from "@/types/types";
import { paymentQ } from "@/queries/payment";
import { useFetchQuery } from "@/hooks/useData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentRequest } from "@/types/types";

const DashboardPage = () => {
  const { user, isHydrated } = useStore();

  // Récupérer les paiements
  const { data: paymentsData } = useFetchQuery(
    ["payments"],
    paymentQ.getAll,
    30000
  );

  const [filters, setFilters] = useState<TableFilters>({
    globalFilter: "",
    statusFilter: "all",
    categoryFilter: "all",
    projectFilter: "all",
    userFilter: "all",
    dateFilter: undefined,
    customDateRange: undefined,
  });

  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);
  const [tempCustomDateRange, setTempCustomDateRange] = useState<{
    from: Date;
    to: Date;
  } | null>(null);

  // Fonction pour obtenir le texte d'affichage du filtre de date
  const getDateFilterText = () => {
    if (filters.dateFilter === "custom" && filters.customDateRange) {
      const { from, to } = filters.customDateRange;
      return `${format(from, "dd/MM/yyyy", { locale: fr })} - ${format(
        to,
        "dd/MM/yyyy",
        { locale: fr }
      )}`;
    }

    switch (filters.dateFilter) {
      case "today":
        return "Aujourd'hui";
      case "week":
        return "Cette semaine";
      case "month":
        return "Ce mois";
      case "year":
        return "Cette année";
      default:
        return "Toutes les périodes";
    }
  };

  // Gérer le clic sur "Personnaliser"
  const handleCustomDateClick = () => {
    if (filters.customDateRange) {
      setTempCustomDateRange(filters.customDateRange);
    } else {
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);
      setTempCustomDateRange({
        from: oneMonthAgo,
        to: today,
      });
    }
    setIsCustomDateModalOpen(true);
  };

  // Appliquer la plage de dates personnalisée
  const applyCustomDateRange = () => {
    if (tempCustomDateRange) {
      setFilters((prev) => ({
        ...prev,
        dateFilter: "custom",
        customDateRange: {
          from: tempCustomDateRange.from,
          to: tempCustomDateRange.to,
        },
      }));
    }
    setIsCustomDateModalOpen(false);
  };

  // Effacer la plage de dates personnalisée
  const clearCustomDateRange = () => {
    setFilters((prev) => ({
      ...prev,
      dateFilter: undefined,
      customDateRange: undefined,
    }));
  };

  // Requête pour récupérer les données des besoins de l'utilisateur
  const myRequestsData = useQuery({
    queryKey: ["myRequests", user?.id],
    queryFn: () => {
      if (!user?.id) {
        throw new Error("ID utilisateur non disponible");
      }
      return requestQ.getMine(user.id);
    },
    enabled: !!user?.id && isHydrated,
  });

  // Requête pour récupérer TOUS les besoins (pour "Besoins reçus")
  const allRequestsData = useQuery({
    queryKey: ["requests"],
    queryFn: () => requestQ.getAll(),
    enabled: isHydrated && !!user,
  });

  // Hook personnalisé pour filtrer les besoins
  const useFilteredRequests = (
    requestData: UseQueryResult<{ data: RequestModelT[] }, Error>,
    filters: TableFilters
  ) => {
    return React.useMemo(() => {
      if (!requestData.data?.data) {
        return [];
      }

      let filtered: RequestModelT[] = requestData.data.data.filter(
        (r) => r.state !== "cancel" && r.state !== "pending"
      );

      // Filtrer par date
      if (filters.dateFilter) {
        const now = new Date();
        let startDate = new Date();
        let endDate = now;

        switch (filters.dateFilter) {
          case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate.setDate(
              now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
            );
            startDate.setHours(0, 0, 0, 0);
            break;
          case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case "year":
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          case "custom":
            if (filters.customDateRange?.from && filters.customDateRange?.to) {
              startDate = filters.customDateRange.from;
              endDate = filters.customDateRange.to;
              endDate.setHours(23, 59, 59, 999);
            }
            break;
        }

        filtered = filtered.filter((item) => {
          const itemDate = new Date(item.createdAt);
          return itemDate >= startDate && itemDate <= endDate;
        });
      }

      // Filtrer par statut
      if (filters.statusFilter && filters.statusFilter !== "all") {
        filtered = filtered.filter(
          (item) => item.state === filters.statusFilter
        );
      }

      // Filtrer par catégorie
      if (filters.categoryFilter && filters.categoryFilter !== "all") {
        filtered = filtered.filter(
          (item) => String(item.categoryId) === String(filters.categoryFilter)
        );
      }

      // Filtrer par recherche globale
      if (filters.globalFilter) {
        const searchValue = filters.globalFilter.toLowerCase();
        filtered = filtered.filter((item) => {
          const searchText = [item.label || "", item.ref || ""]
            .join(" ")
            .toLowerCase();
          return searchText.includes(searchValue);
        });
      }

      // Filtrer par projet
      if (filters.projectFilter && filters.projectFilter !== "all") {
        filtered = filtered.filter(
          (item) => String(item.projectId) === String(filters.projectFilter)
        );
      }

      // Filtrer par utilisateur (si nécessaire)
      if (filters.userFilter && filters.userFilter !== "all") {
        filtered = filtered.filter(
          (item) => String(item.userId) === String(filters.userFilter)
        );
      }

      return filtered;
    }, [requestData.data?.data, filters]);
  };

  // Utiliser le hook avec tous les filtres pour "Mes besoins"
  const getMyFilteredData = useFilteredRequests(myRequestsData, filters);

  // Utiliser le hook avec tous les filtres pour "Besoins reçus" (tous les besoins)
  const getAllFilteredData = useFilteredRequests(allRequestsData, filters);

  // Filtrer les données des paiements (dépenses payées)
  const getFilteredPayments = useMemo((): PaymentRequest[] => {
    if (!paymentsData?.data) {
      return [];
    }

    // Filtrer uniquement les paiements payés
    let filtered: PaymentRequest[] = paymentsData.data.filter(
      (p: PaymentRequest) => p.status === "paid"
    );

    // Filtrer par date si un filtre est appliqué
    if (filters.dateFilter) {
      const now = new Date();
      let startDate = new Date();
      let endDate = now;

      switch (filters.dateFilter) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(
            now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
          );
          startDate.setHours(0, 0, 0, 0);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case "custom":
          if (filters.customDateRange?.from && filters.customDateRange?.to) {
            startDate = filters.customDateRange.from;
            endDate = filters.customDateRange.to;
            endDate.setHours(23, 59, 59, 999);
          } else {
            break;
          }
          break;
        default:
          break;
      }

      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate >= startDate && paymentDate <= endDate;
      });
    }

    return filtered;
  }, [paymentsData?.data, filters.dateFilter, filters.customDateRange]);

  const getSubtitle = () => {
    if (filters.dateFilter === "custom" && filters.customDateRange) {
      const fromStr = format(filters.customDateRange.from, "dd/MM/yyyy", {
        locale: fr,
      });
      const toStr = format(filters.customDateRange.to, "dd/MM/yyyy", {
        locale: fr,
      });
      return `Consulter mes besoins du ${fromStr} au ${toStr}`;
    }

    switch (filters.dateFilter) {
      case "today":
        return "Consulter mes besoins d'aujourd'hui";
      case "week":
        return "Consulter mes besoins des 7 derniers jours";
      case "month":
        return "Consulter mes besoins du mois en cours";
      case "year":
        return "Consulter mes besoins de l'année en cours";
      default:
        return "Consulter mes besoins (30 derniers jours)";
    }
  };

  const getReceivedSubtitle = () => {
    if (filters.dateFilter === "custom" && filters.customDateRange) {
      const fromStr = format(filters.customDateRange.from, "dd/MM/yyyy", {
        locale: fr,
      });
      const toStr = format(filters.customDateRange.to, "dd/MM/yyyy", {
        locale: fr,
      });
      return `Consulter les besoins reçus du ${fromStr} au ${toStr}`;
    }

    switch (filters.dateFilter) {
      case "today":
        return "Consulter les besoins reçus d'aujourd'hui";
      case "week":
        return "Consulter les besoins reçus des 7 derniers jours";
      case "month":
        return "Consulter les besoins reçus du mois en cours";
      case "year":
        return "Consulter les besoins reçus de l'année en cours";
      default:
        return "Consulter les besoins reçus (30 derniers jours)";
    }
  };

  // Calcul des statistiques des besoins de l'utilisateur
  const mySoumis = getMyFilteredData.length || 0;
  const myAttentes =
    getMyFilteredData.filter((item) => item.state === "pending").length ?? 0;
  const myRejetes =
    getMyFilteredData.filter((item) => item.state === "rejected").length ?? 0;
  const myValidés = mySoumis - myAttentes - myRejetes;

  // Calcul des statistiques de tous les besoins (reçus)
  const allSoumis = getAllFilteredData.length || 0;
  const allAttentes =
    getAllFilteredData.filter((item) => item.state === "pending").length ?? 0;
  const allRejetes =
    getAllFilteredData.filter((item) => item.state === "rejected").length ?? 0;
  const allValidés = allSoumis - allAttentes - allRejetes;

  // Calcul des statistiques des dépenses
  const totalDepenses = getFilteredPayments.reduce(
    (sum, payment) => sum + (payment.price || 0),
    0
  );
  const nombreDepenses = getFilteredPayments.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>

        {/* Filtre de période */}
        <div className="grid gap-1.5 w-full md:w-auto">
          <Label>Période</Label>
          <DropdownMenu>
            <DropdownMenuTrigger className="h-10 inline-flex gap-2 flex-row items-center text-base border border-input px-5 rounded-md shadow-xs bg-background hover:bg-accent hover:text-accent-foreground">
              {getDateFilterText()}
              <ChevronDown
                className="text-muted-foreground opacity-50"
                size={16}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={clearCustomDateRange}
                className={cn(
                  "flex items-center justify-between",
                  !filters.dateFilter && "bg-accent"
                )}
              >
                <span>Toutes les périodes</span>
                {!filters.dateFilter && <ChevronRight className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  setFilters((prev) => ({ ...prev, dateFilter: "today" }))
                }
                className={cn(
                  "flex items-center justify-between",
                  filters.dateFilter === "today" && "bg-accent"
                )}
              >
                <span>Aujourd'hui</span>
                {filters.dateFilter === "today" && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setFilters((prev) => ({ ...prev, dateFilter: "week" }))
                }
                className={cn(
                  "flex items-center justify-between",
                  filters.dateFilter === "week" && "bg-accent"
                )}
              >
                <span>Cette semaine</span>
                {filters.dateFilter === "week" && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setFilters((prev) => ({ ...prev, dateFilter: "month" }))
                }
                className={cn(
                  "flex items-center justify-between",
                  filters.dateFilter === "month" && "bg-accent"
                )}
              >
                <span>Ce mois</span>
                {filters.dateFilter === "month" && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setFilters((prev) => ({ ...prev, dateFilter: "year" }))
                }
                className={cn(
                  "flex items-center justify-between",
                  filters.dateFilter === "year" && "bg-accent"
                )}
              >
                <span>Cette année</span>
                {filters.dateFilter === "year" && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleCustomDateClick}
                className={cn(
                  "flex items-center justify-between",
                  filters.dateFilter === "custom" && "bg-accent"
                )}
              >
                <span className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Personnaliser
                </span>
                {filters.dateFilter === "custom" && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Modal pour la sélection de dates personnalisées */}
      <Dialog
        open={isCustomDateModalOpen}
        onOpenChange={setIsCustomDateModalOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sélectionner une plage de dates</DialogTitle>
            <DialogDescription>
              Choisissez la période que vous souhaitez filtrer
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-from">Date de début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !tempCustomDateRange?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tempCustomDateRange?.from ? (
                        format(tempCustomDateRange.from, "PPP", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={tempCustomDateRange?.from}
                      onSelect={(date) =>
                        setTempCustomDateRange((prev) => ({
                          from: date || prev?.from || new Date(),
                          to: prev?.to || new Date(),
                        }))
                      }
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-to">Date de fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !tempCustomDateRange?.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tempCustomDateRange?.to ? (
                        format(tempCustomDateRange.to, "PPP", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={tempCustomDateRange?.to}
                      onSelect={(date) =>
                        setTempCustomDateRange((prev) => ({
                          from: prev?.from || new Date(),
                          to: date || prev?.to || new Date(),
                        }))
                      }
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="rounded-md border p-4">
              <Calendar
                mode="range"
                selected={tempCustomDateRange || undefined}
                onSelect={(range) =>
                  setTempCustomDateRange(range as { from: Date; to: Date })
                }
                numberOfMonths={1}
                className="rounded-md border"
                locale={fr}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCustomDateModalOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={applyCustomDateRange}>Appliquer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cartes de statistiques */}
      <div className="grid-stats-4">
        <StatsCard
          titleColor="text-[#E4E4E7]"
          title="En attente de validation"
          value={String(myAttentes)}
          description="Besoins rejetés :"
          descriptionValue={String(myRejetes)}
          descriptionColor="red"
          dividerColor="bg-[#2262A2]"
          className="bg-[#013E7B] text-[#ffffff] border-[#2262A2]"
          dvalueColor="text-[#DC2626]"
        />
        <StatsCard
          title="Total besoins soumis"
          titleColor="text-[#52525B]"
          value={String(mySoumis)}
          description="Besoins Approuvés :"
          descriptionValue={String(myValidés)}
          descriptionColor="text-[#A1A1AA]"
          dividerColor="bg-[#DFDFDF]"
          className="bg-[#FFFFFF] text-[#000000] border-[#DFDFDF]"
          dvalueColor="text-green-600"
        />
      </div>

      {/* Graphique 1: Mes besoins */}
      <ChartAreaInteractive
        filteredData={getMyFilteredData}
        dateFilter={filters.dateFilter}
        customDateRange={filters.customDateRange}
        title="Mes besoins"
        description={getSubtitle()}
        type="my"
      />

      {/* <div className="flex flex-row flex-wrap md:grid md:grid-cols-4 gap-2 md:gap-5">
        <StatsCard
          titleColor="text-[#E4E4E7]"
          title="En attente de validation"
          value={String(allAttentes)}
          description="Besoins rejetés :"
          descriptionValue={String(allRejetes)}
          descriptionColor="red"
          dividerColor="bg-[#2262A2]"
          className="bg-[#013E7B] text-[#ffffff] border-[#2262A2]"
          dvalueColor="text-[#DC2626]"
        />
        <StatsCard
          title="Besoins reçus"
          titleColor="text-[#52525B]"
          value={String(allSoumis)}
          description="Besoins reçus approuvés :"
          descriptionValue={String(allValidés)}
          descriptionColor="text-[#A1A1AA]"
          dividerColor="bg-[#DFDFDF]"
          className="bg-[#FFFFFF] text-[#000000] border-[#DFDFDF]"
          dvalueColor="text-blue-600"
        />
      </div> */}

      {/* Graphique 2: Besoins reçus */}
      <ChartAreaInteractive
        filteredData={getAllFilteredData}
        dateFilter={filters.dateFilter}
        customDateRange={filters.customDateRange}
        title="Besoins reçus"
        description={getReceivedSubtitle()}
        type="all"
      />

      <Card className="py-4">
        <CardHeader className="flex flex-col items-stretch border-b sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
            <CardTitle>{"Dépenses"}</CardTitle>
            <CardDescription>
              {`Dépenses totales: ${XAF.format(totalDepenses)}`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dépense par type */}
          <ChartPieLabelList
            data={getFilteredPayments}
            chartType="type"
            title="Répartition par type"
            description="Répartition par type de paiement"
          />
          {/* Dépense par fournisseur */}
          <ChartPieLabelList
            data={getFilteredPayments}
            chartType="fournisseur"
            title="Répartition par fournisseur"
            description="Répartition par fournisseur"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
