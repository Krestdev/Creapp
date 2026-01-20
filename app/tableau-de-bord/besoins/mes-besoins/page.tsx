"use client";

import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import RequestList from "@/components/besoin/RequestListPage";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { useStore } from "@/providers/datastore";
import { requestQ } from "@/queries/requestModule";
import { useQuery } from "@tanstack/react-query";

const Page = () => {
  const { user, isHydrated } = useStore();

  // Récupérer les besoins de l'utilisateur
  const { data, isSuccess, isLoading, isError, error } = useQuery({
    queryKey: ["requests-user", user?.id],
    queryFn: () => {
      if (!user?.id) {
        throw new Error("ID utilisateur non disponible");
      }
      return requestQ.getMine(user.id);
    },
    enabled: !!user?.id && isHydrated,
  });

  if (isLoading) {
    return <LoadingPage />;
  }
  if (isError) {
    return <ErrorPage error={error} />;
  }
  if (isSuccess) {
    // Calcul des statistiques
    const cancel =
      data.data.filter((item) => item.state === "cancel").length ?? 0;
    const sent = data.data.length - cancel || 0;
    const awaiting =
      data.data.filter((item) => item.state === "pending").length ?? 0;
    const rejected =
      data.data.filter((item) => item.state === "rejected").length ?? 0;
    const validated = sent - awaiting - rejected;

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
        variant: "default",
        more: {
          title: "Besoins approuvés",
          value: validated,
        },
      },
    ];
    return (
      <div className="content">
        <PageTitle
          title="Mes Besoins"
          subtitle="Consulter et gérez les besoins"
        />
        <div className="grid-stats-4">
          {Statistics.map((statistic, id) => (
            <StatisticCard key={id} {...statistic} />
          ))}
        </div>
        <RequestList data={data.data} />
      </div>
    );
  }
};

export default Page;
