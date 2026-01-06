"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { format, subDays, eachDayOfInterval, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { fr } from "date-fns/locale"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { RequestModelT } from "@/types/types"

interface ChartAreaInteractiveProps {
  filteredData?: RequestModelT[];
  dateFilter?: string;
  customDateRange?: { from: Date; to: Date };
}

const chartConfig = {
  approuvé: {
    label: "Approuvé",
    color: "hsl(var(--chart-2))",
  },
  rejetté: {
    label: "Rejeté",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({
  filteredData = [],
  dateFilter,
  customDateRange
}: ChartAreaInteractiveProps) {


  // Fonction pour générer les données mensuelles (pour le filtre "year")
  const [activeChart, setActiveChart] = React.useState("approuvé");
  const generateMonthlyData = (data: RequestModelT[], year: number) => {
    const months = Array.from({ length: 12 }, (_, i) => i);

    return months.map(monthIndex => {
      const monthStart = new Date(year, monthIndex, 1);
      const monthEnd = new Date(year, monthIndex + 1, 0);
      const monthName = format(monthStart, 'MMM', { locale: fr });

      // Filtrer les données pour ce mois
      const monthData = data.filter(item => {
        try {
          const itemDate = new Date(item.createdAt);
          return itemDate >= monthStart && itemDate <= monthEnd;
        } catch {
          return false;
        }
      });

      // Correspondance flexible des statuts
      const approuvé = monthData.filter(item => {
        const state = (item.state || '').toLowerCase();
        return state.includes('approv') ||
          state.includes('valid') ||
          state === 'approved' ||
          state === 'validé' ||
          state === 'validée';
      }).length;

      const rejetté = monthData.filter(item => {
        const state = (item.state || '').toLowerCase();
        return state.includes('reject') ||
          state.includes('refus') ||
          state === 'rejected' ||
          state === 'rejeté' ||
          state === 'rejetée';
      }).length;

      return {
        date: `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`,
        month: monthName,
        approuvé,
        rejetté,
        total: monthData.length
      };
    });
  };

  // DEBUG: Afficher les données reçues
  React.useEffect(() => {
    console.log('📊 ChartAreaInteractive - Données reçues:', {
      nbDonnées: filteredData.length,
      filtreDate: dateFilter,
      plagePerso: customDateRange,
      statutsUniques: [...new Set(filteredData.map(item => item.state))],
      datesMinMax: filteredData.length > 0 ? {
        min: new Date(Math.min(...filteredData.map(d => new Date(d.createdAt).getTime()))),
        max: new Date(Math.max(...filteredData.map(d => new Date(d.createdAt).getTime())))
      } : null
    });
  }, [filteredData, dateFilter, customDateRange]);

  // Fonction pour générer les données du graphique
  const chartData = React.useMemo(() => {
    console.log('🔄 Génération des données du graphique...');

    if (filteredData.length === 0) {
      console.log('⚠️ Aucune donnée filtrée disponible');
      return [];
    }

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    // CAS 1: "Toutes les périodes" (dateFilter est undefined)
    if (!dateFilter) {
      console.log('📅 Mode: Toutes les périodes');

      startDate = subDays(now, 29); // 30 derniers jours
      startDate.setHours(0, 0, 0, 0);
    }
    // CAS 2: Plage personnalisée
    else if (dateFilter === "custom" && customDateRange) {
      console.log('📅 Mode: Plage personnalisée');
      startDate = customDateRange.from;
      endDate = customDateRange.to;
    }
    // CAS 3: Filtres prédéfinis
    else {
      console.log(`📅 Mode: ${dateFilter}`);
      switch (dateFilter) {
        case "today":
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate = subDays(now, 6);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "month":
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          // Pour une année, on regroupe par mois
          return generateMonthlyData(filteredData, now.getFullYear());
        default:
          // Par défaut: 7 derniers jours
          startDate = subDays(now, 6);
          startDate.setHours(0, 0, 0, 0);
      }
    }

    // Si c'est une année, on utilise les données mensuelles déjà générées
    if (dateFilter === "year") {
      const yearlyData = generateMonthlyData(filteredData, now.getFullYear());
      console.log('📊 Données annuelles générées:', yearlyData);
      return yearlyData;
    }

    // S'assurer que la plage de dates est valide
    if (startDate > endDate) {
      [startDate, endDate] = [endDate, startDate];
    }

    console.log(`📅 Plage: ${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`);

    // Générer les dates pour la période
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    console.log(`📊 ${dateRange.length} jours dans la plage`);

    // Initialiser les données du graphique
    const data: Array<{ date: string, approuvé: number, rejetté: number, total: number }> = dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');

      // Filtrer les données pour cette date
      const dayData = filteredData.filter(item => {
        try {
          const itemDate = new Date(item.createdAt);
          const itemDateStr = format(itemDate, 'yyyy-MM-dd');
          return itemDateStr === dateStr;
        } catch (error) {
          console.error('❌ Erreur de date:', item.createdAt, error);
          return false;
        }
      });

      // Vérifier les valeurs exactes des statuts pour debug
      if (dayData.length > 0 && dateRange.length <= 10) {
        console.log(`📈 ${dateStr}: ${dayData.length} besoins - Statuts:`, dayData.map(d => d.state));
      }

      // Correspondance flexible des statuts
      const approuvé = dayData.filter(item => {
        const state = (item.state || '').toLowerCase();
        return state.includes('approv') ||
          state.includes('valid') ||
          state === 'approved' ||
          state === 'validé' ||
          state === 'validée';
      }).length;

      const rejetté = dayData.filter(item => {
        const state = (item.state || '').toLowerCase();
        return state.includes('reject') ||
          state.includes('refus') ||
          state === 'rejected' ||
          state === 'rejeté' ||
          state === 'rejetée';
      }).length;

      // Pour le debug
      if (approuvé > 0 || rejetté > 0) {
        console.log(`✅ ${dateStr}: ${approuvé} approuvé(s), ${rejetté} rejeté(s)`);
      }

      return {
        date: dateStr,
        approuvé,
        rejetté,
        total: dayData.length
      };
    });

    // Calculer les totaux pour debug
    const totalApprouvé = data.reduce((sum, item) => sum + item.approuvé, 0);
    const totalRejeté = data.reduce((sum, item) => sum + item.rejetté, 0);
    const totalBesoins = data.reduce((sum, item) => sum + item.total, 0);

    console.log('📊 Résumé données graphique:', {
      totalPoints: data.length,
      totalApprouvé,
      totalRejeté,
      totalBesoins,
      pointsAvecDonnées: data.filter(d => d.total > 0).length
    });

    return data;
  }, [filteredData, dateFilter, customDateRange]);


  // Générer le texte du sous-titre en fonction du filtre
  const getSubtitle = () => {
    if (dateFilter === "custom" && customDateRange) {
      const fromStr = format(customDateRange.from, 'dd/MM/yyyy', { locale: fr });
      const toStr = format(customDateRange.to, 'dd/MM/yyyy', { locale: fr });
      return `Consulter mes besoins du ${fromStr} au ${toStr}`;
    }

    switch (dateFilter) {
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

  // Formater la date pour l'axe X en fonction du filtre
  const formatXAxisTick = (value: string) => {
    try {
      const date = new Date(value);

      if (dateFilter === "year") {
        // Pour l'année, afficher le mois
        return format(date, 'MMM', { locale: fr });
      } else if (!dateFilter || dateFilter === "month") {
        // Pour "toutes périodes" ou mois, afficher le jour/mois
        return format(date, 'dd/MM', { locale: fr });
      } else {
        // Par défaut: jour de la semaine + jour
        return format(date, 'EEE dd', { locale: fr });
      }
    } catch {
      return value;
    }
  };

  // Formater la date pour le tooltip
  const formatTooltipLabel = (value: string) => {
    try {
      const date = new Date(value);

      if (dateFilter === "year") {
        return format(date, 'MMMM yyyy', { locale: fr });
      } else {
        return format(date, 'EEEE dd MMMM yyyy', { locale: fr });
      }
    } catch {
      return value;
    }
  };

  // DEBUG: Log des données finales
  React.useEffect(() => {
    if (chartData.length > 0) {
      console.log('📈 Données finales pour le graphique:', chartData);
      console.log('📊 Points avec données:', chartData.filter(d => d.total > 0).length);
    }
  }, [chartData]);

  const total = chartData.reduce((acc, item) => {
    acc.approuvé += item.approuvé;
    acc.rejetté += item.rejetté;
    return acc;
  }, { approuvé: 0, rejetté: 0 });

  // Si pas de données, afficher un message
  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader className="border-b py-5">
          <CardTitle>Mes besoins</CardTitle>
          <CardDescription>{getSubtitle()}</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">
            Aucune donnée disponible
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex flex-col items-stretch border-b sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>Mes besoins</CardTitle>
          <CardDescription>
            {getSubtitle()}
          </CardDescription>
        </div>

        {/* -------- SWITCH -------- */}
        <div className="flex">
          {(["approuvé", "rejetté"] as const).map((key) => {
            return (
              <button
                key={key}
                data-active={activeChart === key}
                className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(key)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[key].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {total[key]}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {chartData.length === 0 ? (
          <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">
            Aucune donnée à afficher pour cette période
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="h-[250px] w-full"
          >
            <AreaChart data={chartData}>
              {/* Dégradés */}
              <defs>
                <linearGradient id="fillApprouve" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.1} />
                </linearGradient>

                <linearGradient id="fillRejete" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} />

              {/* Axe X avec format adaptatif */}
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatXAxisTick}
              />

              {/* Tooltip */}
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={formatTooltipLabel}
                  />
                }
              />

              {/* Zones - IMPORTANT: strokeWidth et fillOpacity */}
              <Area
                type="monotone"
                dataKey="rejetté"
                stackId="a"
                stroke="hsl(var(--chart-1))"
                fill="url(#fillRejete)"
                strokeWidth={2}
                fillOpacity={1}
              />

              <Area
                type="monotone"
                dataKey="approuvé"
                stackId="a"
                stroke="hsl(var(--chart-2))"
                fill="url(#fillApprouve)"
                strokeWidth={2}
                fillOpacity={1}
              />

              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}