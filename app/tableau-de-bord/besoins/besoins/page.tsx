"use client";
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
import { getUserName } from "@/lib/utils";
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
import { ChevronDown, Settings2 } from "lucide-react";
import React from "react";
import { RequestsTable } from "./table-besoins";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { receptionQ } from "@/queries/reception";
import { purchaseQ } from "@/queries/purchase-order";

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

  const getReceptions = useQuery({
    queryKey: ["receptions"],
    queryFn: receptionQ.getAll,
  });

  const getPurchases = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: purchaseQ.getAll,
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
  const [categorySearch, setCategorySearch] = React.useState("");
  const [userSearch, setUserSearch] = React.useState("");
  const [projectSearch, setProjectSearch] = React.useState("");
  const [statusSearch, setStatusSearch] = React.useState("");

  // Réinitialiser tous les filtres
  const resetAllFilters = () => {
    setSearchFilter("");
    setCategoryFilter("all");
    setUserFilter("all");
    setProjectFilter("all");
    setStatusFilter("all");
    setDateFilter(undefined);
    setCustomDateRange(undefined);
    setIsCustomDateModalOpen(false);
    // Réinitialiser les recherches
    setCategorySearch("");
    setUserSearch("");
    setProjectSearch("");
    setStatusSearch("");
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
        userFilter === "all"
          ? true
          : item.userId.toString() === userFilter ||
            !!item.requestOlds?.some((r) => r.userId.toString() === userFilter);
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
        matchCategory &&
        matchProject &&
        matchStatus &&
        matchDate &&
        matchSearch &&
        matchUser
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
    userFilter,
  ]);

  if (
    isLoading ||
    categoryData.isLoading ||
    projectsData.isLoading ||
    paymentsData.isLoading ||
    requestTypes.isLoading ||
    usersData.isLoading ||
    getReceptions.isLoading ||
    getPurchases.isLoading
  ) {
    return <LoadingPage />;
  }
  if (
    isError ||
    categoryData.isError ||
    projectsData.isError ||
    paymentsData.isError ||
    requestTypes.isError ||
    usersData.isError ||
    getReceptions.isError ||
    getPurchases.isError
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
          getReceptions.error ||
          getPurchases.error ||
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
    usersData.isSuccess &&
    getReceptions.isSuccess &&
    getPurchases.isSuccess
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
                {"Configurer les filtres pour affiner les données"}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="truncate">
                        {categoryFilter === "all"
                          ? "Toutes les catégories"
                          : uniqueCategories.find(
                              (c) => String(c.id) === categoryFilter,
                            )?.name || "Sélectionner une catégorie"}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                      <Input
                        placeholder="Rechercher une catégorie..."
                        className="h-8"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setCategoryFilter("all");
                        setCategorySearch("");
                      }}
                      className={categoryFilter === "all" ? "bg-accent" : ""}
                    >
                      <div className="flex items-center gap-2">
                        <span>Toutes les catégories</span>
                      </div>
                    </DropdownMenuItem>
                    {uniqueCategories
                      .filter((category) =>
                        category.name
                          .toLowerCase()
                          .includes(categorySearch.toLowerCase()),
                      )
                      .map((category) => (
                        <DropdownMenuItem
                          key={category.id}
                          onClick={() => {
                            setCategoryFilter(String(category.id));
                            setCategorySearch("");
                          }}
                          className={
                            categoryFilter === String(category.id)
                              ? "bg-accent"
                              : ""
                          }
                        >
                          <div className="flex items-center gap-2">
                            <span className="truncate">{category.name}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    {uniqueCategories.filter((category) =>
                      category.name
                        .toLowerCase()
                        .includes(categorySearch.toLowerCase()),
                    ).length === 0 && (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        Aucune catégorie trouvée
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* User filter */}
              <div className="grid gap-1.5">
                <Label htmlFor="initiator">{"Utilisateur"}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="truncate">
                        {userFilter === "all"
                          ? "Tous les utilisateurs"
                          : getUserName(
                              usersData.data.data,
                              Number(userFilter),
                            ) || "Sélectionner un utilisateur"}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                      <Input
                        placeholder="Rechercher un utilisateur..."
                        className="h-8"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setUserFilter("all");
                        setUserSearch("");
                      }}
                      className={userFilter === "all" ? "bg-accent" : ""}
                    >
                      <div className="flex items-center gap-2">
                        <span>Tous les utilisateurs</span>
                      </div>
                    </DropdownMenuItem>
                    {usersData.data.data
                      .filter((user) =>
                        getUserName(usersData.data.data, user.id)!
                          .toLowerCase()
                          .includes(userSearch.toLowerCase()),
                      )
                      .map((user) => (
                        <DropdownMenuItem
                          key={user.id}
                          onClick={() => {
                            setUserFilter(String(user.id));
                            setUserSearch("");
                          }}
                          className={
                            userFilter === String(user.id) ? "bg-accent" : ""
                          }
                        >
                          <div className="flex items-center gap-2">
                            <span className="truncate">
                              {getUserName(usersData.data.data, user.id)}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    {usersData.data.data.filter((user) =>
                      getUserName(usersData.data.data, user.id)!
                        .toLowerCase()
                        .includes(userSearch.toLowerCase()),
                    ).length === 0 && (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        Aucun utilisateur trouvé
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Project filter */}
              <div className="grid gap-1.5">
                <Label htmlFor="project">{"Projet"}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="truncate">
                        {projectFilter === "all"
                          ? "Tous les projets"
                          : uniqueProjects.find(
                              (p) => String(p.id) === projectFilter,
                            )?.label || "Sélectionner un projet"}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                      <Input
                        placeholder="Rechercher un projet..."
                        className="h-8"
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setProjectFilter("all");
                        setProjectSearch("");
                      }}
                      className={projectFilter === "all" ? "bg-accent" : ""}
                    >
                      <div className="flex items-center gap-2">
                        <span>Tous les projets</span>
                      </div>
                    </DropdownMenuItem>
                    {uniqueProjects
                      .filter((project) =>
                        project.label
                          .toLowerCase()
                          .includes(projectSearch.toLowerCase()),
                      )
                      .map((project) => (
                        <DropdownMenuItem
                          key={project.id}
                          onClick={() => {
                            setProjectFilter(String(project.id));
                            setProjectSearch("");
                          }}
                          className={
                            projectFilter === String(project.id)
                              ? "bg-accent"
                              : ""
                          }
                        >
                          <div className="flex items-center gap-2">
                            <span className="truncate">{project.label}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    {uniqueProjects.filter((project) =>
                      project.label
                        .toLowerCase()
                        .includes(projectSearch.toLowerCase()),
                    ).length === 0 && (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        Aucun projet trouvé
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Status filter */}
              <div className="grid gap-1.5">
                <Label htmlFor="status">{"Statut"}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="truncate">
                        {statusFilter === "all"
                          ? "Tous les statuts"
                          : REQUEST_STATUS.find((s) => s.value === statusFilter)
                              ?.name || "Sélectionner"}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                      <Input
                        placeholder="Rechercher un statut..."
                        className="h-8"
                        value={statusSearch}
                        onChange={(e) => setStatusSearch(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setStatusFilter("all");
                        setStatusSearch("");
                      }}
                      className={statusFilter === "all" ? "bg-accent" : ""}
                    >
                      <div className="flex items-center gap-2">
                        <span>Tous les statuts</span>
                      </div>
                    </DropdownMenuItem>
                    {REQUEST_STATUS.filter((status) =>
                      status.name
                        .toLowerCase()
                        .includes(statusSearch.toLowerCase()),
                    ).map((status) => (
                      <DropdownMenuItem
                        key={status.value}
                        onClick={() => {
                          setStatusFilter(status.value);
                          setStatusSearch("");
                        }}
                        className={
                          statusFilter === status.value ? "bg-accent" : ""
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span>{status.name}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    {REQUEST_STATUS.filter((status) =>
                      status.name
                        .toLowerCase()
                        .includes(statusSearch.toLowerCase()),
                    ).length === 0 && (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        Aucun statut trouvé
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Filtre par période */}
              <div className="grid gap-1.5">
                <Label>{"Période"}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="truncate">
                        {dateFilter === undefined
                          ? "Toutes les périodes"
                          : dateFilter === "today"
                            ? "Aujourd'hui"
                            : dateFilter === "week"
                              ? "Cette semaine"
                              : dateFilter === "month"
                                ? "Ce mois"
                                : dateFilter === "year"
                                  ? "Cette année"
                                  : dateFilter === "custom"
                                    ? "Personnalisé"
                                    : "Sélectionner une période"}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                    <DropdownMenuItem
                      onClick={() => {
                        setDateFilter(undefined);
                        setCustomDateRange(undefined);
                        setIsCustomDateModalOpen(false);
                      }}
                      className={dateFilter === undefined ? "bg-accent" : ""}
                    >
                      <span>Toutes les périodes</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setDateFilter("today");
                        setIsCustomDateModalOpen(false);
                      }}
                      className={dateFilter === "today" ? "bg-accent" : ""}
                    >
                      <span>Aujourd'hui</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setDateFilter("week");
                        setIsCustomDateModalOpen(false);
                      }}
                      className={dateFilter === "week" ? "bg-accent" : ""}
                    >
                      <span>Cette semaine</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setDateFilter("month");
                        setIsCustomDateModalOpen(false);
                      }}
                      className={dateFilter === "month" ? "bg-accent" : ""}
                    >
                      <span>Ce mois</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setDateFilter("year");
                        setIsCustomDateModalOpen(false);
                      }}
                      className={dateFilter === "year" ? "bg-accent" : ""}
                    >
                      <span>Cette année</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setDateFilter("custom");
                        setIsCustomDateModalOpen(true);
                      }}
                      className={dateFilter === "custom" ? "bg-accent" : ""}
                    >
                      <span>Personnalisé</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

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
                      onSelect={(range) => {
                        if (!range?.from || !range?.to) return;
                        const from = new Date(range.from);
                        const to = new Date(range.to);
                        to.setHours(23, 59, 59, 999);
                        setCustomDateRange({ from, to });
                      }}
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
          users={usersData.data.data}
          receptions={getReceptions.data.data}
          purchaseOrders={getPurchases.data.data}
        />
      </div>
    );
  }
}

export default Page;
