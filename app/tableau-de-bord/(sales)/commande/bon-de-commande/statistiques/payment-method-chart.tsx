import { ChartDataItem, ChartPieDonut } from "@/components/Charts/chart-pie-donut";
import { ChartConfig } from "@/components/ui/chart";
import { getRandomColor, XAF } from "@/lib/utils";
import { BonsCommande, PayType } from "@/types/types";
import React from "react";

interface Props {
  purchases: Array<BonsCommande>;
  methods: Array<PayType>;
}

function PaymentMethodChart({ purchases, methods }: Props) {
    // Données pour Pie Chart par mode de paiement
const paymentMethodData: { data: ChartDataItem[]; config: ChartConfig } =
  React.useMemo(() => {
    const methodCounts: Record<string, { count: number; amount: number }> = {};

    for (const order of purchases ?? []) {
      const method = methods.find(m=> String(m.id) === order.paymentMethod)?.label ?? "Inconnu";

      const orderAmount =
        order.devi?.element?.reduce(
          (sum, element) => sum + element.priceProposed * element.quantity,
          0
        ) ?? 0;

      if (!methodCounts[method]) methodCounts[method] = { count: 0, amount: 0 };

      methodCounts[method].count += 1;
      methodCounts[method].amount += orderAmount;
    }

    const methodColors = (method:string):string => {
        if(method.toLocaleLowerCase().includes("virement")) return "var(--chart-1)";
        if(method.toLocaleLowerCase().includes("ch")) return "var(--chart-3)";
        if(method.toLocaleLowerCase().includes("esp")) return "var(--chart-2)";
        return "var(--chart-4)";
    }

    const entries = Object.entries(methodCounts);

    const data: ChartDataItem[] = entries.map(([method, stats], index) => {
      const color = methodColors(method) || getRandomColor(index);
      return {
        id: method,
        value: stats.amount,
        label: method,
        color,
        name: `method_${method}`,
        count: stats.count,
        avgAmount: stats.count ? stats.amount / stats.count : 0,
      };
    });

    // ✅ ChartConfig: value + une entrée par "name" (method_xxx)
    const config: ChartConfig = {
      value: { label: "Montant" },
      ...Object.fromEntries(
        data.map((item) => [
          item.name,
          { label: item.label, color: item.color },
        ])
      ),
    };

    return { data, config };
  }, [purchases]);
  return <ChartPieDonut
                data={paymentMethodData.data}
                tooltipConfig={{
                  valueFormatter: (value) => `${XAF.format(value)} - `,
                }}
                showLegend
                chartConfig={paymentMethodData.config}
              />;
}

export default PaymentMethodChart;
