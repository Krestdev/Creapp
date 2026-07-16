"use client";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import PageTitle from "@/components/pageTitle";
import { XAF } from "@/lib/utils";
import {
  Category,
  PaymentRequest,
  ProjectT,
  RequestModelT,
  User,
} from "@/types/types";

interface Props {
  requests: Array<RequestModelT>;
  tickets: Array<PaymentRequest>;
  users: Array<User>;
  projects: Array<ProjectT>;
  categories: Array<Category>;
}

//Revoir le contenu pour ne considérer que les tickets non payés

function NotPaidRequestsTable({ tickets }: Props) {
  // const [searchFilter, setSearchFilter] = React.useState("");
  // const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  // const [projectFilter, setProjectFilter] = React.useState<string>("all");
  // const [userFilter, setUserFilter] = React.useState<string>("all");
  // // const [isCustomDateModalOpen, setIsCustomDateModalOpen] =
  // //   React.useState(false);
  // const [dateFilter, setDateFilter] = React.useState<DateFilter>();
  // const [customDateRange, setCustomDateRange] = React.useState<
  //   { from: Date; to: Date } | undefined
  // >();

  // const resetAllFilters = () => {
  //   setSearchFilter("");
  //   setProjectFilter("all");
  //   setCategoryFilter("all");
  //   setUserFilter("all");
  //   setDateFilter(undefined);
  //   setCustomDateRange(undefined);
  // };

  // const filteredData: PaymentRequest[] = React.useMemo(() => {
  //   return tickets.filter((r) => {
  //     const search = searchFilter.toLocaleLowerCase();
  //     const matchSearch =
  //       search.trim() === ""
  //         ? true
  //         : r.id === Number(search) ||
  //           r.title.toLocaleLowerCase().includes(search);
  //     const matchCategory =
  //       categoryFilter === "all" ? true : r.type === categoryFilter;
  //     const matchProject =
  //       projectFilter === "all" ? true : r.projectId === Number(projectFilter);
  //     const matchUser =
  //       userFilter === "all" ? true : r.benefId === Number(userFilter);
  //     return matchSearch && matchCategory && matchProject && matchUser;
  //   });
  // }, [
  //   tickets,
  //   searchFilter,
  //   categoryFilter,
  //   projectFilter,
  //   dateFilter,
  //   customDateRange,
  //   userFilter,
  // ]);

  const stats: Array<StatisticProps> = [
    {
      title: "Besoins validés en attente de paiement",
      // value: filteredData.length,
      value: tickets.length,
      variant: "primary",
    },
    {
      title: "Montant estimatif à payer",
      // value: XAF.format(filteredData.reduce((acc, i) => acc + i.price, 0)),
      value: XAF.format(tickets.reduce((acc, i) => acc + i.price, 0)),
      variant: "secondary",
    },
  ];

  return (
    <div className="content">
      <PageTitle
        title="Rapports"
        subtitle="Données relatives aux tickets en espèces"
      />
      <div className="grid-stats-4">
        {stats.map((statistic, id) => (
          <StatisticCard key={id} {...statistic} />
        ))}
      </div>
    </div>
  );
}

export default NotPaidRequestsTable;
