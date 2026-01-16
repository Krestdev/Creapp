"use client";
import { ChartDataItem, ChartPieDonut } from "@/components/Charts/chart-pie-donut";
import { ChartConfig } from "@/components/ui/chart";
import { getRandomColor, XAF } from "@/lib/utils";
import { BonsCommande, PURCHASE_ORDER_STATUS } from "@/types/types";
import React from "react";


interface Props {
    purchases: Array<BonsCommande>;
}

function StatusChart({purchases}:Props) {
  // Données pour Pie Chart par statut
  const data: {data:ChartDataItem[], config:ChartConfig} = React.useMemo(() => {
    let data; let config;
    const statusCounts: Record<string, { count: number; amount: number }> = {};
    const statusLabels = Object.fromEntries(
      PURCHASE_ORDER_STATUS.map((s) => [s.value, s.name])
    );
    const statusColors: Record<string, string> = {
      APPROVED: "var(--status-approved)",
      PENDING: "var(--status-pending)",
      "IN-REVIEW": "var(--status-review)",
      REJECTED: "var(--status-rejected)",
      PAID: "var(--status-paid)",
    };

    purchases.forEach((order) => {
      const status = order.status;
      const orderAmount =
        order.amountBase ||
        order.devi?.element?.reduce(
          (sum, element) => sum + element.priceProposed * element.quantity,
          0
        ) ||
        0;

      if (!statusCounts[status]) {
        statusCounts[status] = { count: 0, amount: 0 };
      }

      statusCounts[status].count += 1;
      statusCounts[status].amount += orderAmount;
    });
    data = Object.entries(statusCounts).map(([status, data], index) => ({
      id: status,
      value: data.count,
      label: statusLabels[status] || status,
      color: statusColors[status] || getRandomColor(index),
      name: statusLabels[status],
      amount: data.amount,
      percentage: ((data.count / purchases.length) * 100).toFixed(1),
    }));
    config = {value:{label: "Quantité"}, ...Object.fromEntries(purchases.map((item, id)=>[id, {label:statusLabels[item.status], color:statusColors[item.status]}]))}

    return {data, config} 
  }, [purchases]);

  return <ChartPieDonut
                data={data.data}
                tooltipConfig={{
                  valueFormatter: (value,name,payload) => `${XAF.format(value)} - `,
                }}
                chartConfig={data.config}
                showLegend={true}
              />;
}

export default StatusChart;
