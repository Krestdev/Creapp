"use client";
import { AreaChartDataItem, ChartArea } from "@/components/Charts/area-chart";
import { getPeriodType, XAF } from "@/lib/utils";
import { BonsCommande } from "@/types/types";
import React, { useMemo } from "react";
import { DateRange } from "react-day-picker";

interface Props {
  data: Array<BonsCommande>;
  dateFilter: DateRange | undefined;
}

function AreaPurchaseChart({ data, dateFilter }: Props) {
  // Données pour le graphique d'évolution des bons de commande
  const areaChartData: AreaChartDataItem[] = useMemo(() => {
    // Grouper par jour/semaine/mois selon la période sélectionnée
    const periodType = getPeriodType(dateFilter); // Fonction à implémenter selon vos besoins

    const groupedData: Record<
      string,
      {
        count: number;
        amount: number;
        approved: number;
        pending: number;
      }
    > = {};

    data.forEach((order) => {
      const date = new Date(order.createdAt);
      let periodKey: string;

      if (periodType === "day") {
        periodKey = date.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
        });
      } else if (periodType === "week") {
        const weekNumber = Math.ceil(date.getDate() / 7);
        periodKey = `Semaine ${weekNumber}`;
      } else {
        // Par défaut, par mois
        periodKey = date.toLocaleDateString("fr-FR", {
          month: "short",
          year: "numeric",
        });
      }

      const orderAmount = order.devi.element.reduce(
        (t, e) => t + e.priceProposed * e.quantity,
        0
      );

      if (!groupedData[periodKey]) {
        groupedData[periodKey] = {
          count: 0,
          amount: 0,
          approved: 0,
          pending: 0,
        };
      }

      groupedData[periodKey].count += 1;
      groupedData[periodKey].amount += orderAmount;

      if (order.status === "APPROVED") {
        groupedData[periodKey].approved += 1;
      } else if (order.status === "PENDING" || order.status === "IN-REVIEW") {
        groupedData[periodKey].pending += 1;
      }
    });

    // Convertir en array et trier
    return Object.entries(groupedData)
      .map(([period, data]) => ({
        period,
        total: data.count,
        montant: data.amount,
        approuves: data.approved,
        enAttente: data.pending,
      }))
      .sort((a, b) => {
        // Trier chronologiquement
        const dateA = new Date(
          a.period.includes(" ") ? `01 ${a.period}` : a.period
        );
        const dateB = new Date(
          b.period.includes(" ") ? `01 ${b.period}` : b.period
        );
        return dateA.getTime() - dateB.getTime();
      });
  }, [data, dateFilter]);
  // Fonction pour déterminer le type de période
  return (
    <ChartArea
      data={areaChartData}
      series={[
        {
          key: "total",
          label: "Total des commandes",
          color: "var(--primary-600)",
          type: "natural",
          fillOpacity: 0.3,
        },
        {
          key: "approuves",
          label: "Commandes approuvées",
          color: "var(--secondary-600)",
          type: "natural",
          fillOpacity: 0.2,
        },
      ]}
      showYAxis={true}
      tooltipIndicator="line"
      tooltipConfig={{
        valueFormatter: (value, name) => {
          if (name === "montant") {
            return XAF.format(value);
          }
          return value.toString();
        },
      }}
      height={400}
    />
  );
}

export default AreaPurchaseChart;
