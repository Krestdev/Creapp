"use client";
import { DataTable } from "@/components/base/data-table";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useStore } from "@/providers/datastore";
import { userQ } from "@/queries/baseModule";
import { categoryQ } from "@/queries/categoryModule";
import { paymentQ } from "@/queries/payment";
import { projectQ } from "@/queries/projectModule";
import { requestQ } from "@/queries/requestModule";
import { requestTypeQ } from "@/queries/requestType";
import { DateFilter, REQUEST_STATUS } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Settings2 } from "lucide-react";
import React from "react";
import { RequestsTable } from "./table-besoins";
import { getUserName } from "@/lib/utils";

function Page() {
  const { user } = useStore();
  const {
    data: requests,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["requests"],
    queryFn: async () => requestQ.getAll(),
    enabled: !!user,
  });

  const categoryData = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return categoryQ.getCategories();
    },
  });

  const projectsData = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      return projectQ.getAll();
    },
  });

  const paymentsData = useQuery({
    queryKey: ["payments"],
    queryFn: async () => paymentQ.getAll(),
  });

  const requestTypes = useQuery({
    queryKey: ["requestType"],
    queryFn: requestTypeQ.getAll,
  });

  const usersData = useQuery({
      queryKey: ["users"],
      queryFn: async () => userQ.getAll(),
    });

  const [searchFilter, setSearchFilter] = React.useState("");
  const [userFilter, setUserFilter] = React.useState<"all" | string>("all");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [projectFilter, setProjectFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] =
    React.useState(false);
  const [dateFilter, setDateFilter] = React.useState<DateFilter>();
  const [customDateRange, setCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >();

  // Réinitialiser tous les filtres
  const resetAllFilters = () => {
    setDateFilter(undefined);
    setCustomDateRange(undefined);
    setSearchFilter("");
    setProjectFilter("all");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  const uniqueCategories = React.useMemo(() => {
    if (!requests || !categoryData.data) return [];

    const categoryIds = [
      ...new Set(requests.data.map((req) => req.categoryId)),
    ];

    return categoryIds.map((categoryId) => {
      const category = categoryData.data.data.find(
        (cat) => cat.id === Number(categoryId),
      );
      return {
        id: categoryId,
        name: category?.label || `Catégorie ${categoryId}`,
      };
    });
  }, [requests, categoryData.data]);

  const uniqueProjects = React.useMemo(() => {
    if (!requests || !projectsData.data?.data) return [];

    const projectIds = [...new Set(requests.data.map((req) => req.projectId))];

    return projectIds.map((projectId) => {
      const project = projectsData.data?.data.find(
        (proj) => proj.id === Number(projectId),
      );
      return {
        id: projectId,
        label: project?.label || `Projet ${projectId}`,
      };
    });
  }, [requests, projectsData.data]);

  // Fonction pour filtrer les données avec TOUS les filtres
  const filteredData = React.useMemo(() => {
    if (!requests) return [];
    return requests.data.filter((item) => {
      const now = new Date();
      let startDate = new Date();
      let endDate = now;
      const search = searchFilter.toLocaleLowerCase();
      //Search Filter
      const matchSearch =
        searchFilter.trim() === ""
          ? true
          : item.label.toLowerCase().includes(search) ||
            item.ref.toLocaleLowerCase().includes(search);
    //User Filter
    const matchUser =
    userFilter === "all" ? true : 
    item.userId.toString() === userFilter || !!item.requestOlds?.some(r=> r.userId.toString() === userFilter);
      //Status Filter
      const matchStatus =
        statusFilter === "all" ? true : item.state === statusFilter;
      //Category Filter
      const matchCategory =
        categoryFilter === "all"
          ? true
          : item.categoryId === Number(categoryFilter);
      //Project Filter
      const matchProject =
        projectFilter === "all"
          ? true
          : item.projectId === Number(projectFilter);
      // Date Filter
      let matchDate = true;
      if (dateFilter) {
        switch (dateFilter) {
          case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate.setDate(
              now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1),
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
            if (customDateRange?.from && customDateRange?.to) {
              startDate = customDateRange.from;
              endDate = customDateRange.to;
            }
            break;
        }

        if (
          dateFilter !== "custom" ||
          (customDateRange?.from && customDateRange?.to)
        ) {
          matchDate =
            new Date(item.createdAt) >= startDate &&
            new Date(item.createdAt) <= endDate;
        }
      }
      return (
        matchCategory && matchProject && matchStatus && matchDate && matchSearch && matchUser
      );
    });
  }, [
    requests,
    projectFilter,
    categoryFilter,
    statusFilter,
    searchFilter,
    dateFilter,
    customDateRange,
    userFilter
  ]);

  if (
    isLoading ||
    categoryData.isLoading ||
    projectsData.isLoading ||
    paymentsData.isLoading ||
    requestTypes.isLoading ||
    usersData.isLoading
  ) {
    return <LoadingPage />;
  }
  if (
    isError ||
    categoryData.isError ||
    projectsData.isError ||
    paymentsData.isError ||
    requestTypes.isError ||
    usersData.isError
  ) {
    return (
      <ErrorPage
        error={
          error ||
          categoryData.error ||
          projectsData.error ||
          paymentsData.error ||
          requestTypes.error ||
          usersData.error ||
          undefined
        }
      />
    );
  }
  if (
    isSuccess &&
    categoryData.isSuccess &&
    projectsData.isSuccess &&
    paymentsData.isSuccess &&
    requestTypes.isSuccess &&
    usersData.isSuccess
  ) {
    // Calcul des statistiques
    const sent = requests.data.length /* - cancel */ || 0;
    const awaiting =
      requests.data.filter((item) => item.state === "pending").length ?? 0;
    const rejected =
      requests.data.filter((item) => item.state === "rejected").length ?? 0;
    const validated = requests.data.filter(
      (item) => item.state === "validated",
    ).length;
    const fromStore = requests.data.filter(
      (item) => item.state === "store",
    ).length;
    const cancelled = requests.data.filter(
      (item) => item.state === "cancel",
    ).length;

    const Statistics: Array<StatisticProps> = [
      {
        title: "En attente de validation",
        value: awaiting,
        variant: "secondary",
        more: {
          title: "Besoins rejetés",
          value: rejected,
        },
      },
      {
        title: "Besoins émis",
        value: sent,
        variant: "primary",
        more: {
          title: "Besoins approuvés",
          value: validated,
        },
      },
      {
        title: "Besoins Déstockés",
        value: fromStore,
        variant: "default",
        more: {
          title: "Besoins annulés",
          value: cancelled,
        },
      },
    ];
    return (
      <div className="content">
        <PageTitle
          title="Tous les besoins"
          subtitle="Accedez à l'ensemble des besoins emis sur l'application."
          color="red"
        />
        <Sheet>
          <SheetTrigger asChild className="w-fit">
            <Button variant={"outline"}>
              <Settings2 />
              {"Filtres"}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{"Filtres"}</SheetTitle>
              <SheetDescription>
                {"Configurer les fitres pour affiner les données"}
              </SheetDescription>
            </SheetHeader>
            <div className="px-5 grid gap-5">
              <div className="grid gap-1.5">
                <Label htmlFor="search">{"Rechercher"}</Label>
                <Input
                  placeholder="Titre ou référence"
                  name="search"
                  type="search"
                  value={searchFilter ?? ""}
                  onChange={(event) => setSearchFilter(event.target.value)}
                  className="w-full"
                />
              </div>
              {/* Category filter */}
              <div className="grid gap-1.5">
                <Label htmlFor="category">{"Catégorie"}</Label>
                <Select
                  name="category"
                  value={categoryFilter}
                  onValueChange={(v) => setCategoryFilter(String(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Toutes"}</SelectItem>
                    {uniqueCategories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* User filter */}
              <div className="grid gap-1.5">
                <Label htmlFor="initiator">{"Utilisateur"}</Label>
                <Select
                  name="initiator"
                  value={userFilter}
                  onValueChange={(v) => setUserFilter(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Tous"}</SelectItem>
                    {usersData.data.data
                    //.filter(u=> requests.data.some(r=> r.userId === u.id))
                    .map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {getUserName(usersData.data.data, user.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project filter */}
              <div className="grid gap-1.5">
                <Label htmlFor="project">{"Projet"}</Label>
                <Select
                  name="project"
                  value={projectFilter}
                  onValueChange={(v) => setProjectFilter(String(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un projet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Tous"}</SelectItem>
                    {uniqueProjects.map((project) => (
                      <SelectItem key={project.id} value={String(project.id)}>
                        {project.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status filter */}
              <div className="grid gap-1.5">
                <Label htmlFor="status">{"Statut"}</Label>
                <Select
                  name="status"
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(String(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Tous"}</SelectItem>
                    {REQUEST_STATUS.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Filtre par période */}
              <div className="grid gap-1.5">
                <Label>{"Période"}</Label>
                <Select
                  onValueChange={(v) => {
                    if (v !== "custom") {
                      setCustomDateRange(undefined);
                      setIsCustomDateModalOpen(false);
                    }
                    if (v === "all") return setDateFilter(undefined);
                    setDateFilter(v as Exclude<DateFilter, undefined>);
                    setIsCustomDateModalOpen(v === "custom");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Toutes les périodes"}</SelectItem>
                    <SelectItem value="today">{"Aujourd'hui"}</SelectItem>
                    <SelectItem value="week">{"Cette semaine"}</SelectItem>
                    <SelectItem value="month">{"Ce mois"}</SelectItem>
                    <SelectItem value="year">{"Cette année"}</SelectItem>
                    <SelectItem value="custom">{"Personnalisé"}</SelectItem>
                  </SelectContent>
                </Select>
                <Collapsible
                  open={isCustomDateModalOpen}
                  onOpenChange={setIsCustomDateModalOpen}
                  disabled={dateFilter !== "custom"}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {"Plage personnalisée"}
                      <span className="text-muted-foreground text-xs">
                        {customDateRange?.from && customDateRange.to
                          ? `${format(
                              customDateRange.from,
                              "dd/MM/yyyy",
                            )} → ${format(customDateRange.to, "dd/MM/yyyy")}`
                          : "Choisir"}
                      </span>
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="space-y-4 pt-4">
                    <Calendar
                      mode="range"
                      selected={customDateRange}
                      onSelect={(range) =>
                        setCustomDateRange(range as { from: Date; to: Date })
                      }
                      numberOfMonths={1}
                      className="rounded-md border w-full"
                    />
                    <div className="space-y-1">
                      <Button
                        className="w-full"
                        onClick={() => {
                          setCustomDateRange(undefined);
                          setDateFilter(undefined);
                          setIsCustomDateModalOpen(false);
                        }}
                      >
                        {"Annuler"}
                      </Button>
                      <Button
                        className="w-full"
                        variant={"outline"}
                        onClick={() => {
                          setIsCustomDateModalOpen(false);
                        }}
                      >
                        {"Réduire"}
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Bouton pour réinitialiser les filtres */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={resetAllFilters}
                  className="w-full"
                >
                  {"Réinitialiser"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="grid-stats-4">
          {Statistics.map((statistic, id) => (
            <StatisticCard key={id} {...statistic} />
          ))}
        </div>
        <RequestsTable
          data={filteredData}
          categories={categoryData.data.data}
          projects={projectsData.data.data}
          payments={paymentsData.data.data}
          requestTypes={requestTypes.data.data}
          users={usersData.data?.data}/>
      </div>
    );
  }
}

export default Page;
